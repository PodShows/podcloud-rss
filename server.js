// polyfill
import "isomorphic-fetch";

import express from "express";
import compression from "compression";
import ApolloClient, {
  createNetworkInterface,
  IntrospectionFragmentMatcher
} from "apollo-client";
import gql from "graphql-tag";
import RSS from "rss";

const notEmpty = function(obj) {
  return typeof obj === "string" && obj.length > 0;
};

const empty = function(obj) {
  return !notEmpty(obj);
};

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
});

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: "http://localhost:8880/graphql"
  }),
  fragmentMatcher
});

const PORT = 8881;

var app = express();
app.use(compression());

app.get("*", function(req, res) {
  let identifier = req.query.identifier;
  console.log("identifier: " + identifier);
  if (empty(identifier)) {
    identifier = req.get("host").replace(/\.(podcloud|lepodcast)\.fr$/, "");
  }
  console.log("identifier: " + identifier);

  if (notEmpty(identifier)) {
    client
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
      .then(graph_res => {
        console.log(graph_res);
        let fdata = graph_res.data.podcastForFeedWithIdentifier;

        if (fdata == null) {
          res.send("Not found");
        } else {
          let rss_feed = {
            title: fdata.title,
            description: fdata.description,
            site_url: fdata.website_url,
            feed_url: fdata.feed_url,
            image_url: fdata.cover_url,
            language: fdata.language,
            copyright: fdata.copyright,
            pubDate: fdata.updated_at,
            generator: "podcloud-rss 1.0.0",
            custom_namespaces: {
              itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd"
            },
            custom_elements: [
              {
                "itunes:summary": {
                  _cdata: fdata.description.substring(0, 3950)
                }
              },
              {
                "itunes:subtitle": { _cdata: fdata.catchline.substring(0, 255) }
              },
              { "itunes:explicit": fdata.explicit ? "yes" : "no" },
              { "itunes:keywords": fdata.tags.concat(["podCloud"]).join(", ") },
              {
                "itunes:author": notEmpty(fdata.author)
                  ? fdata.author
                  : "Anonyme"
              },
              { "itunes:image": { _attr: { href: fdata.cover_url } } }
            ]
          };

          if (notEmpty(fdata.contact_email)) {
            let webmaster = fdata.contact_email;

            let itunesOwner = [];

            if (notEmpty(fdata.author)) {
              webmaster += " (" + fdata.author + ")";
              itunesOwner.push({ "itunes:name": fdata.author });
            }

            rss_feed.webMaster = webmaster;
            itunesOwner.push({ "itunes:email": fdata.contact_email });
            rss_feed.custom_elements.push({ "itunes:owner": itunesOwner });
          }

          if (fdata.block_itunes) {
            rss_feed.custom_elements.push({ "itunes:block": "yes" });
          }

          if (fdata.itunes_category) {
            rss_feed.custom_elements.push(
              buildiTunesCategory(fdata.itunes_category)
            );
          }

          if (fdata.disabled) {
            rss_feed.custom_elements.push({
              "itunes:new-feed-url": fdata.feed_redirect_url
            });
          }

          let feed = new RSS(rss_feed);

          if (!fdata.disabled) {
            fdata.items.forEach(item => {
              let rss_item = {
                title: item.title,
                guid: item.guid,
                url: item.url,
                date: item.published_at,
                description: item.formatted_content
              };

              const has_enclosure = typeof item.enclosure === "object";

              if (has_enclosure) {
                let chronic_duration = "";
                let seconds = item.enclosure.duration;
                let hours = Math.floor(seconds / 3600);
                seconds = seconds - hours * 3600;
                let minutes = Math.floor(seconds / 60);
                seconds = seconds - minutes * 60;

                chronic_duration =
                  hours +
                  ":" +
                  ("00" + minutes).slice(-2) +
                  ":" +
                  ("00" + seconds).slice(-2);

                rss_item.custom_elements = [
                  {
                    "itunes:image": {
                      _attr: {
                        href: item.cover_url
                      }
                    }
                  },
                  { "itunes:summary": item.text_content.substring(0, 3999) },
                  { "itunes:summary": item.text_content.substring(0, 255) },
                  { "itunes:duration": chronic_duration }
                ];

                rss_item.enclosure = item.enclosure;
              }

              if (notEmpty(item.author)) {
                rss_item.author = item.author;
                if (has_enclosure) {
                  rss_item.custom_elements.push({
                    "itunes:author": item.author
                  });
                }
              }

              feed.item(rss_item);
            });
          }

          res.send(feed.xml({ indent: true }));
        }
      })
      .catch(error => {
        console.error(error);
        res.send(error);
      });
  } else {
    res.send("ok");
  }
});

app.listen(PORT, () =>
  console.log(`RSS server is now running on http://localhost:${PORT}/`)
);
