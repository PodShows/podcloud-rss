export const notEmpty = function(obj) {
  return typeof obj === "string" && obj.trim().length > 0
}

export const empty = function(obj) {
  return !notEmpty(obj)
}

export const getFeedIdentifierFromRequest = function(request) {
  return typeof request === "object" &&
    typeof request.query === "object" &&
    notEmpty(request.query.identifier)
    ? request.query.identifier
    : request.get("host").replace(/^((.*)\.)?(podcloud|lepodcast)\.fr$/, "$2")
}
