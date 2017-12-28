import Server from "~/Server"
import config from "config"

function constructFeedsAPIUrl() {
  const host = config.get("hosts") && config.get("hosts").feeds

  return (
    (host &&
      (host.match(/^https?:\/\//) ? host : "http://" + host) + "/graphql") ||
    null
  )
}

const server = new Server(config.get("listen"), constructFeedsAPIUrl())
server.start()
