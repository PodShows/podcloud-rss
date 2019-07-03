import { empty } from "../Utils"

import { PodcastViewAppeal } from "podcloud-stats"

import ua from "universal-analytics"

import cacheManager from "cache-manager"

import fsStore from "cache-manager-fs-binary"

const diskCache = cacheManager.caching({
  store: fsStore,
  options: {
    path: "diskcache", // path for cached files
    ttl: 24 * 60 * 60, // time to life in seconds
    maxsize: 1000 * 1000 * 1000 /* max size in bytes on disk */,
    preventfill: true
  }
})

export class podCloudStatsAPI {
  constructor() {}

  saveView(podcast, request) {
    if (typeof podcast !== "object" || podcast === null || podcast === {})
      return null

    return new Promise((resolve, reject) => {
      if (typeof request !== "object") request = false

      const clean = str => (empty(str) ? null : str)

      const getIP = req => {
        try {
          return clean(
            (request
              ? request.headers["x-forwarded-for"] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress
              : ""
            ).split(",")[0]
          )
        } catch (e) {
          console.error(e)
        }
        return clean("")
      }

      const getHeader = (req, header) => {
        return req && req.headers && req.headers[header]
      }

      const payload = {
        fid: clean(podcast._id),
        ip: getIP(request),
        ua: getHeader(request, "user-agent"),
        ref: getHeader(request, "referer")
      }

      PodcastViewAppeal.process(payload).then(resolve, reject)

      diskCache.wrap(
        `rss-${payload.fid}-${payload.ip}-${payload.ua}`,
        () => {
          console.log("Sent to GA")
          ua("UA-59716320-1")
            .pageview({
              dl: podcast.feed_url,
              ua: payload.ua,
              uip: payload.ip,
              dr: payload.ref,
              dt: podcast.title
            })
            .send()
        },
        { ttl: 24 * 60 * 60 },
        err => console.error(err)
      )
    })
  }
}

export default podCloudStatsAPI
