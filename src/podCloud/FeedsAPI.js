// polyfill
import "isomorphic-fetch";

import gql from "graphql-tag";

import { execute, makePromise } from "apollo-link";
import { HttpLink } from "apollo-link-http";

class GraphQLSimpleHttpClient {
  constructor(uri) {
    this.link = new HttpLink({ uri });
  }

  query(operation) {
    /* istanbul ignore next */
    return makePromise(execute(this.link, operation));
  }
}

import cacheManager from "cache-manager";

import redisStore from "cache-manager-redis";

const cache = cacheManager.caching({
  store: redisStore,
  host: "rss-feed-cache",
  ttl: 2 * 60, // time to life in seconds
  compress: true
});

let defaultClient;
export default class podCloudFeedsAPI {
  constructor(endpoint_url) {
    if (!endpoint_url) throw "An endpoint url is required";
    defaultClient = new GraphQLSimpleHttpClient(endpoint_url);
  }

  getFeedWithIdentifier(
    identifier,
    /* istanbul ignore next */
    client = defaultClient
  ) {
    console.log(`Asking cache for ${identifier}`);
    return cache
      .wrap(
        `feed-data-${identifier}`,
        () => {
          console.log(`Creating cache for ${identifier}`);
          return client.query({
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
                  googleplay_block
                  itunes_block
                  itunes_category
                  feed_redirect_url
                  copyright
                  ordering
                  updated_at
                  platforms {
                    apple
                    google
                    spotify
                    deezer
                    podcloud
                  }
                  socials {
                    youtube
                    soundcloud
                    dailymotion
                    twitch
                    twitter
                    facebook
                    instagram
                  }
                  wiki_url
                  shop_url
                  donate_url
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
          });
        },
        { ttl: 2 * 60 }
      )
      .then(resp => {
        console.log(`Got response from cache for ${identifier}`);
        if (
          typeof resp === "object" &&
          typeof resp.data === "object" &&
          typeof resp.data.podcastForFeedWithIdentifier === "object" &&
          typeof resp.errors !== "object"
        ) {
          return Promise.resolve(resp.data.podcastForFeedWithIdentifier);
        }

        return Promise.reject(resp);
      });
  }
}
