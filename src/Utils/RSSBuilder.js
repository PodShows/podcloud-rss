import RSS from "rss"

export default function RSSBuilder(apiResponse) {
  if (typeof apiResponse !== "object") return null

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
        "itunes:author": notEmpty(fdata.author) ? fdata.author : "Anonyme"
      },
      { "itunes:image": { _attr: { href: fdata.cover_url } } }
    ]
  }

  if (notEmpty(fdata.contact_email)) {
    let webmaster = fdata.contact_email

    let itunesOwner = []

    if (notEmpty(fdata.author)) {
      webmaster += " (" + fdata.author + ")"
      itunesOwner.push({ "itunes:name": fdata.author })
    }

    rss_feed.webMaster = webmaster
    itunesOwner.push({ "itunes:email": fdata.contact_email })
    rss_feed.custom_elements.push({ "itunes:owner": itunesOwner })
  }

  if (fdata.block_itunes) {
    rss_feed.custom_elements.push({ "itunes:block": "yes" })
  }

  if (fdata.itunes_category) {
    rss_feed.custom_elements.push(buildiTunesCategory(fdata.itunes_category))
  }

  if (fdata.disabled) {
    rss_feed.custom_elements.push({
      "itunes:new-feed-url": fdata.feed_redirect_url
    })
  }

  let feed = new RSS(rss_feed)

  if (!fdata.disabled) {
    fdata.items.forEach(item => {
      let rss_item = {
        title: item.title,
        guid: item.guid,
        url: item.url,
        date: item.published_at,
        description: item.formatted_content
      }

      const has_enclosure = typeof item.enclosure === "object"

      if (has_enclosure) {
        let chronic_duration = ""
        let seconds = item.enclosure.duration
        let hours = Math.floor(seconds / 3600)
        seconds = seconds - hours * 3600
        let minutes = Math.floor(seconds / 60)
        seconds = seconds - minutes * 60

        chronic_duration =
          hours +
          ":" +
          ("00" + minutes).slice(-2) +
          ":" +
          ("00" + seconds).slice(-2)

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
        ]

        rss_item.enclosure = item.enclosure
      }

      if (notEmpty(item.author)) {
        rss_item.author = item.author
        if (has_enclosure) {
          rss_item.custom_elements.push({
            "itunes:author": item.author
          })
        }
      }

      feed.item(rss_item)
    })
  }

  return feed
}
