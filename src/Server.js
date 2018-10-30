import url from "url"

import express from "express"
import compression from "compression"

import FeedsAPI from "~/podCloud/FeedsAPI"
import StatsAPI from "~/podCloud/StatsAPI"
import { isObject, notEmpty, getFeedIdentifierFromRequest, RSSBuilder } from "~/Utils"

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
            res.header("Content-Type", "text/xml; charset=utf-8")
            const result_rss = () => 
              rss.xml({ indent: true }).replace(
                /(<\?xml.*\?>)/, 
                '$1\n<?xml-stylesheet type="text/xsl" href="http://localhost:8880/app/hello.xsl"?>\n'
              );
            if(podcast.disabled === true) {
              try {
                const redirect_url = url.parse(podcast.feed_redirect_url);
                res.status(301)
                res.header("Location", redirect_url.href);
                res.send(result_rss());
                res.end();
              } catch(e) {
                send404(res)
              }
            } else {
              res.send(result_rss())
              console.log(`Saving view for ${podcast.identifier}...`)
              statsAPI
                .saveView(podcast, req)
                .then(
                  () => console.log(`View saved for ${podcast.identifier}.`),
                  () =>
                  console.error(
                    `Failed to save view for ${podcast.identifier}!`
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
  constructor(listen, apiEndpoint, statsPrivateKey, statsBin) {
    this.listen = listen
    this.apiEndpoint = apiEndpoint
    this.app = express()
    this.app.use(compression())
    this[feedsAPI] = new FeedsAPI(apiEndpoint)
    this[statsAPI] = new StatsAPI()

    this.app.use("/app", express.static(__dirname+'/../app'));
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
