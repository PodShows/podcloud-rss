import * as jwt from "jsonwebtoken"

import process from "process"
import { spawn } from "child_process"

class podCloudStatsAPI {
  constructor(privateKey, bin) {
    this.privateKey = privateKey
    this.bin = bin
  }

  saveView(feed_guid, request) {
    return new Promise((resolve, reject) => {
      const pkey = fs.readFileSync(this.privateKey)

      const signed_payload = jwt.sign(payload, pkey, {
        issuer: "feeds",
        subject: "stats"
      })

      const proc = spawn(this.bin, [signed_payload], {})

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
