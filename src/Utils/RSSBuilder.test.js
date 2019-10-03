/* eslint-env jest */

import RSSBuilder from "./RSSBuilder";
import FeedFixture from "./__fixtures__/feed.json";

describe("RSS Builder", () => {
  beforeAll(() => {
    // Mock lastBuildDate
    Date.prototype.toUTCString = jest.fn(() => "Mon, 11 Dec 2017 13:21:30 GMT");
  });

  test("should return null when not given an object", () => {
    const rss_feed = RSSBuilder("");
    expect(rss_feed).toBe(null);
  });

  describe("should produce a valid RSS feed with a feed graphql returned object", () => {
    test("standard feed", () => {
      const rss_feed = RSSBuilder(FeedFixture.default);
      expect(rss_feed.xml({ indent: true })).toMatchSnapshot("typical feed");
    });

    test("disabled feed", () => {
      const rss_feed = RSSBuilder(FeedFixture.disabled);
      expect(rss_feed.xml({ indent: true })).toMatchSnapshot("feed disabled");
    });

    test("explicit feed", () => {
      const podcast = Object.assign({}, FeedFixture.default);
      podcast.explicit = true;
      podcast.items[0].explicit = true;
      const rss_feed = RSSBuilder(podcast);
      expect(rss_feed.xml({ indent: true })).toMatchSnapshot("explicit feed");
    });

    test("without some infos in feed", () => {
      const podcast = Object.assign({}, FeedFixture.default);
      podcast.author = "";
      podcast.googleplay_block = false;
      podcast.itunes_block = false;
      podcast.itunes_category = "";
      podcast.items.forEach(i => (i.author = ""));

      expect(RSSBuilder(podcast).xml({ indent: true })).toMatchSnapshot(
        "feed_without_optional infos but author email"
      );

      podcast.contact_email = "";

      expect(RSSBuilder(podcast).xml({ indent: true })).toMatchSnapshot(
        "feed_without_optional infos nor author email"
      );
    });
  });
});
