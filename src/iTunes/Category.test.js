/* eslint-env jest */

import { buildiTunesCategory } from "./Category";

describe("buildiTunesCategory", () => {
  test("produce a result for a simple category", () => {
    expect(buildiTunesCategory("tv_and_film")).toEqual({
      "itunes:category": {
        _attr: {
          text: "TV & Film"
        }
      }
    });
  });

  test("produce a result for a nested category", () => {
    expect(buildiTunesCategory("shopping")).toEqual({
      "itunes:category": [
        {
          _attr: {
            text: "Business"
          }
        },
        {
          "itunes:category": {
            _attr: {
              text: "Shopping"
            }
          }
        }
      ]
    });
  });

  test("produce no result for an unknown category", () => {
    expect(buildiTunesCategory("ultimate_ninja")).toEqual({});
  });
});
