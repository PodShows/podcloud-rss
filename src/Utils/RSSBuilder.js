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
    webMaster: "team@podcloud.fr (podCloud)",
    generator: "podCloud (https://podcloud.fr)",
    custom_namespaces: {
      itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd",
      googleplay: "http://www.google.com/schemas/play-podcasts/1.0",
      podext: "https://podcast-ext.org"
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
        "itunes:keywords": _cdata(podcast.tags).join(", ")
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
    let managingEditor = podcast.contact_email;

    let itunesOwner = [];

    if (notEmpty(podcast.author)) {
      managingEditor += " (" + podcast.author + ")";
      itunesOwner.push({ "itunes:name": _cdata(podcast.author) });
    }

    rss_feed.managingEditor = managingEditor;

    itunesOwner.push({ "itunes:email": podcast.contact_email });
    rss_feed.custom_elements.push({ "itunes:owner": itunesOwner });
  }

  rss_feed.custom_elements.push({
    "itunes:block": podcast.itunes_block ? "yes" : "no",
    "podext:block": [
      { _attr: { platform: "itunes" } },
      podcast.itunes_block ? "yes" : "no"
    ]
  });

  rss_feed.custom_elements.push({
    "googleplay:block": podcast.googleplay_block ? "yes" : "no",
    "podext:block": [
      { _attr: { platform: "google_podcasts" } },
      podcast.googleplay_block ? "yes" : "no"
    ]
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

  podcast.platforms = podcast.platforms || {};
  podcast.socials = podcast.socials || {};

  if (notEmpty(podcast.platforms.apple)) {
    rss_feed.custom_elements.push({
      "podext:platform": {
        _attr: {
          platform: "apple_podcasts",
          href: `https://podcasts.apple.com/${podcast.platforms.apple}`
        }
      }
    });
  }

  if (notEmpty(podcast.platforms.google)) {
    rss_feed.custom_elements.push({
      "podext:platform": {
        _attr: {
          platform: "google_podcasts",
          href: podcast.platforms.google
        }
      }
    });
  }

  if (notEmpty(podcast.platforms.spotify)) {
    rss_feed.custom_elements.push({
      "podext:platform": {
        _attr: {
          platform: "spotify",
          href: `https://open.spotify.com/show/${podcast.platforms.spotify}`
        }
      }
    });
  }

  if (notEmpty(podcast.platforms.deezer)) {
    rss_feed.custom_elements.push({
      "podext:platform": {
        _attr: {
          platform: "deezer",
          href: `https://deezer.com/${podcast.platforms.deezer}`
        }
      }
    });
  }

  if (notEmpty(podcast.platforms.podcloud)) {
    rss_feed.custom_elements.push({
      "podext:platform": {
        _attr: {
          platform: "podcloud",
          href: `https://podcloud.fr/podcast/${podcast.platforms.podcloud}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.youtube)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "youtube",
          href: `https://youtube.com/${podcast.socials.youtube}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.soundcloud)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "soundcloud",
          handle: podcast.socials.soundcloud,
          href: `https://soundcloud.com/${podcast.socials.soundcloud}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.twitch)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "twitch",
          handle: podcast.socials.twitch,
          href: `https://twitch.tv/${podcast.socials.twitch}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.dailymotion)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "dailymotion",
          href: `https://dailymotion.com/${podcast.socials.dailymotion}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.twitter)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "twitter",
          handle: podcast.socials.twitter,
          href: `https://twitter.com/${podcast.socials.twitter}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.facebook)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "facebook",
          href: `https://facebook.com/${podcast.socials.facebook}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.instagram)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "instagram",
          handle: podcast.socials.instagram,
          href: `https://instagram.com/${podcast.socials.instagram}`
        }
      }
    });
  }

  if (notEmpty(podcast.socials.discord)) {
    rss_feed.custom_elements.push({
      "podext:social": {
        _attr: {
          platform: "discord",
          href: podcast.socials.discord
        }
      }
    });
  }

  if (notEmpty(podcast.wiki_url)) {
    rss_feed.custom_elements.push({
      "podext:link": [
        {
          _attr: {
            href: podcast.wiki_url
          }
        },
        "Wiki"
      ]
    });
  }

  if (notEmpty(podcast.shop_url)) {
    rss_feed.custom_elements.push({
      "podext:shop": {
        _attr: {
          href: podcast.shop_url
        }
      }
    });
  }

  if (notEmpty(podcast.donate_url)) {
    rss_feed.custom_elements.push({
      "podext:donate": {
        _attr: {
          href: podcast.donate_url
        }
      }
    });

    rss_feed.custom_elements.push({
      link: {
        _attr: {
          rel: "payment",
          href: podcast.donate_url
        }
      }
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
