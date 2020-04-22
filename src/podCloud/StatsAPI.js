import { empty } from "../Utils";

import { PodcastViewAppeal } from "podcloud-stats";

import ua from "universal-analytics";

import cacheManager from "cache-manager";

import fsStore from "cache-manager-fs-binary";

const diskCache = cacheManager.caching({
  store: fsStore,
  options: {
    path: "cache",
    ttl: 24 * 60 * 60, // time to life in seconds
    maxsize: 1000 * 1000 * 1000 /* max size in bytes on disk */
  }
});

import { Crawler } from "es6-crawler-detect/src";

const CrawlerDetector = new Crawler();

export class podCloudStatsAPI {
  constructor() {}

  saveView(podcast, request) {
    if (typeof podcast !== "object" || podcast === null || podcast === {})
      return null;

    return new Promise((resolve, reject) => {
      if (typeof request !== "object") request = false;

      const clean = str => (empty(str) ? null : str);

      const getIP = req => {
        try {
          return clean(
            (request
              ? request.headers["cf-connecting-ip"] ||
                request.headers["x-forwarded-for"] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress
              : ""
            ).split(",")[0]
          );
        } catch (e) {
          console.error(e);
        }
        return clean("");
      };

      const getHeader = (req, header) => {
        return req && req.headers && req.headers[header];
      };

      const user_agent = getHeader(request, "user-agent");

      if (
        typeof user_agent !== "string" ||
        user_agent.trim().length < 1 ||
        CrawlerDetector.isCrawler(user_agent)
      ) {
        return reject(`User-Agent is a crawler: ${user_agent}`);
      }

      const payload = {
        fid: clean(podcast._id),
        ip: getIP(request),
        ua: user_agent,
        ref: getHeader(request, "referer")
      };

      diskCache
        .wrap(
          `rss-${payload.fid}-${payload.ip}-${payload.ua}`,
          () => {
            console.log("Really saving view");
            return PodcastViewAppeal.process(payload);
          },
          { ttl: 24 * 60 * 60 }
        )
        .then(resolve, reject);
    });
  }
}

export default podCloudStatsAPI;
