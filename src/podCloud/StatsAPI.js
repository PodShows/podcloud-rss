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

import fs from "fs";

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

      const payload = {
        fid: clean(podcast._id),
        ip: getIP(request),
        ua: user_agent,
        ref: getHeader(request, "referer")
      };

      let isCrawler = typeof user_agent !== "string";

      isCrawler = isCrawler || user_agent.trim().length < 1;

      [
        "TPA/",
        "Spotify/",
        "Deezer Podcasters/",
        "Luminary/",
        "podCloud/",
        "Podchaser-Parser",
        "rss-parser",
        "NextCloud-News/",
        "PocketCasts/1.0 (Pocket Casts Feed Parser;",
        "iVoox Global Podcasting Service",
        "fyyd-poll-1/",
        "iTMS",
        "Tentacles, Like iTunes",
        "Podinstall",
        "Overcast/1.0 Podcast Sync",
        "Mozilla/5.0 +https://podmust.com",
        "Mozilla/5.0 (compatible; INA dlweb"
      ].forEach(ua => {
        isCrawler = isCrawler || user_agent.indexOf(ua) === 0;
      });

      isCrawler = isCrawler || payload.ip === "5.39.90.104";
      isCrawler = isCrawler || payload.ip.indexOf("194.127.248") === 0;

      isCrawler = isCrawler || CrawlerDetector.isCrawler(user_agent);

      if (isCrawler) {
        return reject(
          `User-Agent is a crawler: ${user_agent} ( IP : ${payload.ip} )`
        );
      }

      const user_cache_key = `user-` + sha256([payload.ip, payload.ua]);
      cache.get(user_cache_key, (err, per_user_ping) => {
        per_user_ping = parseInt(per_user_ping) || 0;

        if (per_user_ping >= 50)
          return reject(
            `Too many call from IP/UA in the last 60 minutes (IP: ${
              payload.ip
            }) : \n ${payload.ua}`
          );

        cache.set(user_cache_key, per_user_ping + 1, { ttl: 24 * 60 * 60 });

        const feed_cache_key =
          `feed-` + sha256([payload.fid, payload.ip, payload.ua]);

        cache.get(feed_cache_key, (error, per_feed_ping) => {
          per_feed_ping = parseInt(per_feed_ping) || 0;
          if (per_feed_ping > 0) {
            return reject(
              `Too many call from IP/UA for this feed in the last 24 hours ${
                payload.ip
              } : \n ${payload.ua}`
            );
          }

          console.log(
            `Really saving view for ${podcast.identifier} : \n ${payload.ua}`
          );

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
