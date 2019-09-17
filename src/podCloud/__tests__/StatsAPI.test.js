import podCloudStatsAPI from "../StatsAPI";

const statsMock = `#!/usr/bin/env node

var process = require("process") ; 
process.exit((+process.argv[2]+1 || 0)-1);
`;

describe("statsAPI", () => {
  describe("saveView", () => {
    it("should return null when called with a non object podcast argument", () => {
      const sAPI = new podCloudStatsAPI(null, null);
      expect(sAPI.saveView(null, null)).toBe(null);
    });
  });
});
