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
    expect(buildiTunesCategory("software_how_to")).toEqual({
      "itunes:category": [
        {
          _attr: {
            text: "Technology"
          }
        },
        {
          "itunes:category": {
            _attr: {
              text: "Software How-To"
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
