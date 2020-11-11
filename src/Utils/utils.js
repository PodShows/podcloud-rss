import crypto from "crypto";

export const isObject = function(obj) {
  return !!(typeof obj === "object" && obj);
};

export const notEmpty = function(obj) {
  return typeof obj === "string" && obj.trim().length > 0;
};

export const empty = function(obj) {
  return !notEmpty(obj);
};

export const sha256 = obj =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex");

export const getFeedIdentifierFromRequest = function(request) {
  return typeof request === "object" &&
    typeof request.query === "object" &&
    notEmpty(request.query.identifier)
    ? request.query.identifier
    : request
        .get("host")
        .replace(/^((.*)\.)?(podcloud|lepodcast)\.(fr|test)$/, "$2");
};
