import * as jwt from "jsonwebtoken"

import process from "process"
import { spawn } from "child_process"

import { empty } from "../Utils"

import fs from "fs"

export class podCloudStatsAPI {
  constructor(privateKeyPath, bin) {
    this.privateKey = null
    this.privateKeyPath = privateKeyPath
    this.bin = bin
  }

  saveView(podcast, request) {
    if (typeof podcast !== "object" || podcast === null || podcast === {})
      return null

    return new Promise((resolve, reject) => {
      if (this.privateKey === null) {
        this.privateKey = fs.readFileSync(this.privateKeyPath)
      }

      if (typeof request !== "object") request = false

      const clean = str => (empty(str) ? null : str)

      const getIP = req => {
        try {
          return clean(
            (request
              ? request.headers["x-forwarded-for"] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress
              : ""
            ).split(",")[0]
          )
        } catch (e) {
          console.error(e)
        }
        return clean("")
      }

      const getHeader = (req, header) => {
        return req && req.headers && req.header[header]
      }

      const payload = {
        fid: clean(podcast._id),
        ip: getIP(request),
        ua: getHeader(request, "user-agent"),
        ref: getHeader(request, "referer")
      }

      const signed_payload = jwt.sign(payload, this.privateKey, {
        issuer: "rss",
        subject: "stats",
        algorithm: "RS256"
      })

      const proc = spawn(this.bin, ["register", "podcast", signed_payload], {})

      const logprefix = `[stats-${proc.pid}]`

      proc.stdout.on("data", data => {
        console.log(`${logprefix} ${data}`)
      })

      proc.stderr.on("data", data => {
        console.error(`${logprefix} ${data}`)
      })

      proc.on("close", code => {
        const msg = `${logprefix} process exited with code ${code}`
        if (code === 0) {
          console.log(msg)
          resolve()
        } else {
          console.error(msg)
          reject()
        }
      })
    })
  }
}

export default podCloudStatsAPI
