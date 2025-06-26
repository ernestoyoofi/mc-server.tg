import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import os from "os"

export async function executeFile(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const parseCommand = path.parse(command)
    const isMinecraftFileServer = parseCommand.name === "bedrock_server"
    const isMinecraftRun = isMinecraftFileServer? (
      os.platform() === "win32"? command:`cd ${parseCommand.dir} && ./bedrock_server`
    ):command
    console.log("[Log]: Hit Enter To Input Cli...")
    setTimeout(() => {
      const child = spawn(isMinecraftRun, args, {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
        shell: os.platform() !== "win32"? true:undefined,
        ...options,
      })
      child.stdout.on("data", (data) => {
        const tgString = String(data?.toString())
        if(tgString.match("Starting Server")) {
          const serverVersion = (tgString.split(" Version:")[1]?.split("[")[0])?.trim()
          const sessionID = (tgString.split(" Session ID:")[1]?.split("[")[0])?.trim()
          const versionStg = String(serverVersion)
          const detailInfo = {
            version: versionStg,
            version_engine: versionStg.split(".").slice(0, 2).map(a => parseInt(a)),
            session: sessionID,
          }
          if(versionStg.split(".").length > 2) {
            fs.writeFileSync(path.join(parseCommand.dir, "detail_server_costum"), JSON.stringify(detailInfo,null,2), "utf-8")
          }
        }
        process.stdout.write(data)
      })
      child.stderr.on("data", (data) => {
        process.stderr.write(data)
      })
      process.stdin.pipe(child.stdin)
      child.on("close", (code) => {
        process.stdin.unpipe(child.stdin)
        child.stdin.end()
        resolve(code)
      })
      child.on("error", (err) => {
        reject(err)
      })
    }, 100*6)
  })
}

export default executeFile