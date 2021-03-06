import Server from "~/Server";
import config from "config";
import { Mongo } from "podcloud-stats";

import path from "path";
import fs from "fs";

const feeds_host = config.get("hosts") && config.get("hosts").feeds;

const feedsAPIURL =
  (feeds_host &&
    (feeds_host.match(/^https?:\/\//) ? feeds_host : "https://" + feeds_host) +
      "/graphql") ||
  null;

Mongo.connect(config.get("mongodb")).then(() => {
  const server = new Server(config.get("listen"), feedsAPIURL);
  server.start();
}, console.error);
