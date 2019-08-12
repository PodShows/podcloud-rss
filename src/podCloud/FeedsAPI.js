// polyfill
import "isomorphic-fetch"

import gql from "graphql-tag"

import { execute, makePromise } from "apollo-link"
import { HttpLink } from "apollo-link-http"

class GraphQLSimpleHttpClient {
  constructor(uri) {
    this.link = new HttpLink({ uri })
  }

  query(operation) {
    /* istanbul ignore next */
    return makePromise(execute(this.link, operation))
  }
}

let defaultClient
export default class podCloudFeedsAPI {
  constructor(endpoint_url) {
    if (!endpoint_url) throw "An endpoint url is required"
    defaultClient = new GraphQLSimpleHttpClient(endpoint_url)
  }

  getFeedWithIdentifier(
    identifier,
    /* istanbul ignore next */
    client = defaultClient
  ) {
    return client
      .query({
        query: gql`
          query getFeed($identifier: String!) {
            podcastForFeedWithIdentifier(identifier: $identifier) {
              _id
              identifier
              title
              description
              catchline
              feed_url
              cover {
                url
              }
              website_url
              language
              contact_email
              author
              explicit
              tags
              disabled
              itunes_block
              itunes_category
              feed_redirect_url
              copyright
              ordering
              updated_at
              items {
                title
                author
                guid
                text_content
                formatted_content
                published_at
                url
                explicit
                episode_type
                season
                episode
                ... on Episode {
                  enclosure {
                    cover {
                      url
                    }
                    url
                    type
                    size
                    duration
                  }
                }
              }
            }
          }
        `,
        variables: {
          identifier
        },
        operationName: "getFeed"
      })
      .then(resp => {
        if (
          typeof resp === "object" &&
          typeof resp.data === "object" &&
          typeof resp.data.podcastForFeedWithIdentifier === "object"
        ) {
          return Promise.resolve(resp.data.podcastForFeedWithIdentifier)
        }
        return Promise.reject(resp)
      })
  }
}
