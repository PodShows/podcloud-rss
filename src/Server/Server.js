import url from "url";
import fs from "fs";
import net from "net";
import http from "http";

import express from "express";
import compression from "compression";

import FeedsAPI from "~/podCloud/FeedsAPI";
import StatsAPI from "~/podCloud/StatsAPI";
import {
  isObject,
  notEmpty,
  getFeedIdentifierFromRequest,
  RSSBuilder
} from "~/Utils";

const sendResponse = function(res, status = 200, content = "ok") {
  res.status(status);
  res.send(content);
};

const send500 = function(res, content = "An error occured") {
  sendResponse(res, 500, content);
};

const send404 = function(res, content = "Feed not found") {
  sendResponse(res, 404, content);
};

const requestHandler = function(feedsAPI, statsAPI) {
  return function(req, res) {
    const identifier = getFeedIdentifierFromRequest(req);

    if (notEmpty(identifier)) {
      feedsAPI
        .getFeedWithIdentifier(identifier)
        .then(podcast => {
          const rss = RSSBuilder(podcast);

          if (rss == null) {
            send404(res);
          } else {
            res.status(200);
            res.header("Content-Type", "application/rss+xml; charset=utf-8");
            if (podcast.disabled === true) {
              try {
                const redirect_url = url.parse(podcast.feed_redirect_url);
                res.status(301);
                res.header("Location", redirect_url.href);
                res.send(rss.xml({ indent: true }));
                res.end();
              } catch (e) {
                send404(res);
              }
            } else {
              res.send(rss.xml({ indent: true }));
              console.log(`Saving view for ${podcast.identifier}...`);
              statsAPI
                .saveView(podcast, req)
                .then(
                  () => console.log(`View saved for ${podcast.identifier}.`),
                  () =>
                    console.error(
                      `Failed to save view for ${podcast.identifier}!`
                    )
                );
            }
          }
        })
        .catch(error => {
          console.error(error);
          send500(res, error);
        });
    } else {
      send404(res);
    }
  };
};

var feedsAPI = Symbol.for("Server.feedsAPI");
var statsAPI = Symbol.for("Server.statsAPI");

class Server {
  constructor(listen, apiEndpoint, statsPrivateKey, statsBin) {
    this.listen = listen;
    this.apiEndpoint = apiEndpoint;
    this.app = express();
    this.app.use(compression());
    this[feedsAPI] = new FeedsAPI(apiEndpoint);
    this[statsAPI] = new StatsAPI();

    this.app.get("*", requestHandler(this[feedsAPI], this[statsAPI]));
  }

  start() {
    const unix_socket = isNaN(parseInt(this.listen, 10));

    const server = http.createServer(this.app).listen(this.listen);

    server.on("listening", () => {
      console.log(
        `RSS server is now running on ${
          unix_socket ? this.listen : `http://localhost:${this.listen}/`
        }`
      );
    });

    if (unix_socket) {
      server.on("listening", () => {
        // set permissions
        return fs.chmod(this.listen, 0o777, err => err && console.error(err));
      });

      // double-check EADDRINUSE
      server.on("error", e => {
        if (e.code !== "EADDRINUSE") throw e;
        net
          .connect({ path: this.listen }, () => {
            // really in use: re-throw
            throw e;
          })
          .on("error", e => {
            if (e.code !== "ECONNREFUSED") throw e;
            // not in use: delete it and re-listen
            fs.unlinkSync(this.listen);
            server.listen(this.listen);
          });
      });
    }
  }
}

export default Server;
