import RSS from "rss";
import { notEmpty } from "./utils";

import { buildiTunesCategory } from "~/iTunes/Category";

export default function RSSBuilder(podcast) {
  if (typeof podcast !== "object" || podcast === null || podcast === {})
    return null;

  let _cdata = stuff => ({ _cdata: stuff });

  let rss_feed = {
    title: podcast.title,
    description: podcast.description,
    site_url: podcast.website_url,
    feed_url: podcast.feed_url,
    image_url: podcast.cover.url,
    language: podcast.language,
    copyright: podcast.copyright,
    pubDate: podcast.updated_at,
    generator: "podcloud-rss 1.1.5",
    custom_namespaces: {
      itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd"
    },
    custom_elements: [
      {
        "itunes:summary": _cdata(podcast.description.substring(0, 3950))
      },
      {
        "itunes:subtitle": _cdata(podcast.catchline.substring(0, 255))
      },
      { "itunes:explicit": podcast.explicit ? "yes" : "no" },
      {
        "itunes:keywords": _cdata(podcast.tags.concat(["podCloud"]).join(", "))
      },
      {
        "itunes:author": _cdata(
          notEmpty(podcast.author) ? podcast.author : "Anonyme"
        )
      },
      { "itunes:image": { _attr: { href: podcast.cover.url } } }
    ]
  };

  if (notEmpty(podcast.contact_email)) {
    let webmaster = podcast.contact_email;

    let itunesOwner = [];

    if (notEmpty(podcast.author)) {
      webmaster += " (" + podcast.author + ")";
      itunesOwner.push({ "itunes:name": _cdata(podcast.author) });
    }

    rss_feed.webMaster = webmaster;
    itunesOwner.push({ "itunes:email": podcast.contact_email });
    rss_feed.custom_elements.push({ "itunes:owner": itunesOwner });
  }

  rss_feed.custom_elements.push({
    "itunes:block": podcast.itunes_block ? "yes" : "no"
  });

  rss_feed.custom_elements.push({
    "googleplay:block": podcast.googleplay_block ? "yes" : "no"
  });

  rss_feed.custom_elements.push({
    "itunes:type": podcast.ordering === "asc" ? "serial" : "episodic"
  });

  if (podcast.itunes_category) {
    rss_feed.custom_elements.push(buildiTunesCategory(podcast.itunes_category));
  }

  if (podcast.disabled) {
    rss_feed.custom_elements.push({
      "itunes:new-feed-url": podcast.feed_redirect_url
    });
  }

  let feed = new RSS(rss_feed);

  if (!podcast.disabled) {
    podcast.items.forEach(item => {
      let rss_item = {
        title: item.title,
        guid: item.guid,
        url: item.url,
        date: item.published_at,
        description: item.formatted_content
      };

      const has_enclosure = typeof item.enclosure === "object";

      rss_item.custom_elements = [];

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

        rss_item.custom_elements.push(
          {
            "itunes:image": {
              _attr: {
                href: item.enclosure.cover.url
              }
            }
          },
          { "itunes:summary": _cdata(item.text_content.substring(0, 3999)) },
          { "itunes:explicit": podcast.explicit ? "yes" : "no" },
          { "itunes:duration": chronic_duration }
        );

        rss_item.enclosure = item.enclosure;
      }

      if (notEmpty(item.author)) {
        rss_item.author = item.author;
        rss_item.custom_elements.push({
          "itunes:author": _cdata(item.author)
        });
      }

      if (item.episode_type !== null) {
        rss_item.custom_elements.push({
          "itunes:episodeType": item.episode_type
        });
      }

      if (+item.season > 0) {
        rss_item.custom_elements.push({
          "itunes:season": item.season
        });
      }

      if (+item.episode > 0) {
        rss_item.custom_elements.push({
          "itunes:episode": item.episode
        });
      }

      feed.item(rss_item);
    });
  }

  return feed;
}
