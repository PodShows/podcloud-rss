// polyfill
import "isomorphic-fetch"

import gql from "graphql-tag"
import ApolloClient, {
  createNetworkInterface,
  IntrospectionFragmentMatcher
} from "apollo-client"

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          kind: "INTERFACE",
          name: "PodcastItem",
          possibleTypes: [{ name: "Episode" }, { name: "Post" }]
        }
      ]
    }
  }
})

let defaultClient
export default class podCloudFeedsAPI {
  constructor(endpoint_url) {
    defaultClient = new ApolloClient({
      networkInterface: createNetworkInterface({
        uri: endpoint_url
      }),
      fragmentMatcher
    })
  }

  getFeedWithIdentifier(identifier, client = this.defaultClient) {
    return client
      .query({
        query: gql`
          query getFeed($identifier: String!) {
            podcastForFeedWithIdentifier(identifier: $identifier) {
              title
              description
              catchline
              feed_url
              cover_url
              website_url
              language
              contact_email
              author
              explicit
              tags
              itunes_block
              itunes_category
              feed_redirect_url
              copyright
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
                ... on Episode {
                  cover_url
                  enclosure {
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
