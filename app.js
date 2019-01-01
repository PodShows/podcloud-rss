import Server from "~/Server"
import config from "config"
import { Mongo } from "podcloud-stats"

const feeds_host = config.hosts.feeds

const feedsAPIURL =
  (feeds_host &&
    (feeds_host.match(/^https?:\/\//) ? feeds_host : "http://" + feeds_host) +
      "/graphql") ||
  null

const stats_host = config.hosts.stats

const statsAPIURL =
  (stats_host &&
    (stats_host.match(/^https?:\/\//) ? stats_host : "http://" + stats_host) +
      "/graphql") ||
  null

Mongo.connect(config.get("mongodb")).then(() => {
  const server = new Server(config.get("listen"), feedsAPIURL, statsAPIURL)
  server.start()
}, console.error)
