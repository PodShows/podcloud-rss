/* eslint-env jest */

import * as Utils from "./utils";

describe("Utils", () => {
  describe("isObject", () => {
    test("should return true if given object", () => {
      expect(Utils.isObject({})).toBe(true);
    });

    test("should return false if object is null", () => {
      expect(Utils.isObject(null)).toBe(false);
    });

    test("should return false if not an object", () => {
      expect(Utils.isObject("")).toBe(false);
      expect(Utils.isObject(5)).toBe(false);
      expect(Utils.isObject(undefined)).toBe(false);
    });
  });

  describe("notEmpty", () => {
    test("should return true if string not empty", () => {
      expect(Utils.notEmpty("toto")).toBe(true);
    });

    test("should return false if string is empty", () => {
      expect(Utils.notEmpty("")).toBe(false);
      expect(Utils.notEmpty("   ")).toBe(false);
    });

    test("should return false if not a string", () => {
      expect(Utils.notEmpty({})).toBe(false);
      expect(Utils.notEmpty([])).toBe(false);
      expect(Utils.notEmpty([])).toBe(false);
    });
  });

  describe("empty", () => {
    test("should return false if string not empty", () => {
      expect(Utils.empty("toto")).toBe(false);
    });

    test("should return true if string is empty", () => {
      expect(Utils.empty("")).toBe(true);
      expect(Utils.empty("   ")).toBe(true);
    });

    test("should return true if not a string", () => {
      expect(Utils.empty({})).toBe(true);
      expect(Utils.empty([])).toBe(true);
      expect(Utils.empty([])).toBe(true);
    });
  });

  describe("getFeedIdentifierFromRequest", () => {
    test("should return query param if present and not empty", () => {
      const req = { query: { identifier: "toto" } };
      expect(Utils.getFeedIdentifierFromRequest(req)).toBe("toto");
    });

    describe("if query param is not present or empty", () => {
      test("should return host", () => {
        let req = {
          query: { identifier: "   " },
          get(key) {
            if (key === "host") return "toto.com";
          }
        };
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("toto.com");
        req.query.identifier = "";
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("toto.com");
        req.query.identifier = undefined;
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("toto.com");
      });

      test("should return only subdomain if platform or podcast url", () => {
        let req = {
          query: { identifier: "   " },
          get(key) {
            if (key === "host") return this._host;
          },
          _host: "toto.lepodcast.fr"
        };
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("toto");
        req._host = "toto.podcloud.fr";
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("toto");
      });

      test("should return an empty string if there is no subdomain or identifier", () => {
        let req = {
          get(key) {
            if (key === "host") return this._host;
          },
          _host: "lepodcast.fr"
        };
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("");
        req._host = "podcloud.fr";
        expect(Utils.getFeedIdentifierFromRequest(req)).toBe("");
      });
    });
  });
});
