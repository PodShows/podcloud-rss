// Development server
//
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

require("babel-register");
require("./src/index.js");
