import url from "url"

import express from "express"
import compression from "compression"

import FeedsAPI from "~/podCloud/FeedsAPI"
import StatsAPI from "~/podCloud/StatsAPI"

import {
  isObject,
  notEmpty,
  getFeedIdentifierFromRequest,
  RSSBuilder
} from "~/Utils"

const sendResponse = function(res, status = 200, content = "ok") {
  res.status(status)
  res.send(content)
}

const send500 = function(res, content = "An error occured") {
  sendResponse(res, 500, content)
}

const send404 = function(res, content = "Not found") {
  sendResponse(res, 404, content)
}

const requestHandler = function(feedsAPI, statsAPI) {
  return function(req, res) {
    const identifier = getFeedIdentifierFromRequest(req)

    if (notEmpty(identifier)) {
      feedsAPI
        .getFeedWithIdentifier(identifier)
        .then(podcast => {
          const rss = RSSBuilder(podcast)

          if (rss == null) {
            send404(res)
          } else {
            res.status(200)
            res.header("Content-Type", "application/rss+xml; charset=utf-8")
            if (podcast.disabled === true) {
              try {
                const redirect_url = url.parse(podcast.feed_redirect_url)
                res.status(301)
                res.header("Location", redirect_url.href)
                res.send(rss.xml({ indent: true }))
                res.end()
              } catch (e) {
                send404(res)
              }
            } else {
              res.send(rss.xml({ indent: true }))
              res.end()

              console.log(`Saving view for ${podcast.identifier}...`)
              statsAPI
                .saveView(podcast, req)
                .then(
                  () => console.log(`View saved for ${podcast.identifier}.`),
                  err =>
                    console.error(
                      `Failed to save view for ${podcast.identifier}!`,
                      err
                    )
                )
            }
          }
        })
        .catch(error => {
          console.error(error)
          send500(res, error)
        })
    } else {
      send404(res)
    }
  }
}

var feedsAPI = Symbol.for("Server.feedsAPI")
var statsAPI = Symbol.for("Server.statsAPI")

class Server {
  constructor(listen, feedsEndpoint, statsEndpoint, statsPrivateKey) {
    this.listen = listen
    this.feedEndpoint = feedsEndpoint
    this.statsEndpoint = statsEndpoint
    this.app = express()
    this.app.use(compression())
    this[feedsAPI] = new FeedsAPI(feedsEndpoint)
    this[statsAPI] = new StatsAPI(statsEndpoint)

    this.app.get("*", requestHandler(this[feedsAPI], this[statsAPI]))
  }

  start() {
    const address = isNaN(parseInt(this.listen, 10))
      ? this.listen
      : `http://localhost:${this.listen}/`
    this.app.listen(this.listen, () =>
      console.log(`RSS server is now running on ${address}`)
    )
  }
}

export default Server
