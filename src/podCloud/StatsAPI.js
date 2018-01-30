import { empty } from "../Utils"

import { PodcastViewAppeal } from "podcloud-stats"

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
    })
  }
}

export default podCloudStatsAPI
