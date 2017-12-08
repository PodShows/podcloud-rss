import Server from "~/Server"
import config from "config"

const server = new Server(config.get("listen"), config.get("hosts").feeds)
server.start()
