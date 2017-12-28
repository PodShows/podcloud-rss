import express from "express"
import compression from "compression"

import FeedsAPI from "~/podCloud/FeedsAPI"
import { notEmpty, getFeedIdentifierFromRequest, RSSBuilder } from "~/Utils"

const sendResponse = function(status = 200, content = "ok") {
  res.status(status)
  res.send(content)
}

const send500 = function(content = "An error occured") {
  sendResponse(500, content)
}

const send404 = function(content = "Not found") {
  sendResponse(404, content)
}

const requestHandler = function(feedsAPI) {
  return function(req, res) {
    const identifier = getFeedIdentifierFromRequest(req)

    if (notEmpty(identifier)) {
      feedsAPI
        .getFeedWithIdentifier(identifier)
        .then(apiResponse => {
          const rss = RSSBuilder(apiResponse)

          if (rss == null) {
            send404()
          } else {
            res.status(200)
            res.send(rss.xml({ indent: true }))
          }
        })
        .catch(error => {
          console.error(error)
          send500(error)
        })
    } else {
      send404()
    }
  }
}

var feedsAPI = Symbol("feedsAPI")

class Server {
  constructor(listen, apiEndpoint) {
    this.listen = listen
    this.apiEndpoint = apiEndpoint
    this.app = express()
    this.app.use(compression())
    this[feedsAPI] = new FeedsAPI(apiEndpoint)

    this.app.get("*", requestHandler(this[feedsAPI]))
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
