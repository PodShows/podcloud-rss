import gql from "graphql-tag"
import GraphQLSimpleHttpClient from "./GraphQLSimpleHttpClient"

import { empty } from "../Utils"

import { PodcastViewAppeal } from "podcloud-stats"

let defaultClient
export class podCloudStatsAPI {
  constructor(endpoint_url) {
    if (!endpoint_url) throw "An endpoint url is required"
    defaultClient = new GraphQLSimpleHttpClient(endpoint_url)
  }

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

      const FeedID = clean(podcast._id)
      const FeedName = clean(podcast.title)
      const IP = getIP(request)
      const UserAgent = getHeader(request, "user-agent")
      const Referer = getHeader(request, "referer")

      Promise.all([
        PodcastViewAppeal.process({
          fid: FeedID,
          ip: IP,
          ua: UserAgent,
          ref: Referer
        }),
        this._sendViewToStats({
          FeedID,
          FeedName,
          IP,
          UserAgent,
          Referer
        })
      ]).then(resolve, reject)
    })
  }

  _sendViewToStats(
    payload,
    /* istanbul ignore next */
    client = defaultClient
  ) {
    const query = gql`
      mutation saveView(
        $FeedID: String!
        $FeedName: String!
        $IP: String!
        $UserAgent: String!
        $Referer: String!
      ) {
        views {
          saveView(
            FeedID: $FeedID
            FeedName: $FeedName
            IP: $IP
            UserAgent: $UserAgent
            Referer: $Referer
          )
        }
      }
    `
    console.log(query)
    return client.query({
      query,
      variables: payload,
      operationName: "saveView"
    })
  }
}

export default podCloudStatsAPI
