import { empty, sha256 } from "../Utils";

import { PodcastViewAppeal } from "podcloud-stats";

import ua from "universal-analytics";

import cacheManager from "cache-manager";

import redisStore from "cache-manager-redis";

const cache = cacheManager.caching({
  store: redisStore,
  host: "rss-ping-cache",
  ttl: 24 * 60 * 60 // time to life in seconds
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

      const user_cache_key = `user-` + sha256([payload.ip, payload.ua]);
      cache.get(user_cache_key, (err, per_user_ping) => {
        per_user_ping = parseInt(per_user_ping) || 0;

        if (per_user_ping >= 50)
          return reject("Too many call from IP/UA in the last 60 minutes");

        cache.set(user_cache_key, per_user_ping + 1, { ttl: 24 * 60 * 60 });

        const feed_cache_key =
          `feed-` + sha256([payload.fid, payload.ip, payload.ua]);

        cache.get(feed_cache_key, (error, per_feed_ping) => {
          per_feed_ping = parseInt(per_feed_ping) || 0;
          if (per_feed_ping > 0) {
            return reject(
              "Too many call from IP/UA for this feed in the last 24 hours"
            );
          }

          console.log("Really saving view");

          PodcastViewAppeal.process(payload).then(() => {
            cache.set(feed_cache_key, 1, { ttl: 60 * 60 }, err => {
              resolve();
            });
          }, reject);
        });
      });
    });
  }
}

export default podCloudStatsAPI;
