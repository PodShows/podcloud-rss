import Server from "~/Server";
import config from "config";
import { Mongo } from "podcloud-stats";

import path from "path";

import findRemoveSync from "find-remove";

const feeds_host = config.get("hosts") && config.get("hosts").feeds;

const feedsAPIURL =
  (feeds_host &&
    (feeds_host.match(/^https?:\/\//) ? feeds_host : "https://" + feeds_host) +
      "/graphql") ||
  null;

Mongo.connect(config.get("mongodb")).then(() => {
  const server = new Server(config.get("listen"), feedsAPIURL);
  removeOldCache();
  server.start();
}, console.error);

const removeOldCache = () => {
  console.log("Deleting old cache files");
  findRemoveSync(path.resolve("cache"), {
    files: "*.*",
    age: {
      seconds: 25 * 60 * 60
    }
  });
};

setInterval(removeOldCache, 5 * 60 * 1000);
