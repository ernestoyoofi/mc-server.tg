import crypto from "crypto"
import chalk from "chalk"
import fs from "fs"
import path from "path"
import { defaultContext } from "../lib/default-value.js"
import sleep from "../lib/sleep.js"
import { copyFolderAll, copyFile } from "../lib/copy-dirfile.js"

async function backupServer() {
  const serverFolder = path.join(defaultContext.folderServer)
  const namefolder = `${new Date().getTime()}-${crypto.randomBytes(8).toString("hex")}`
  if(!fs.existsSync(serverFolder) || !fs.lstatSync(serverFolder).isDirectory()) {
    console.log(`[${chalk.red("Error")}]: Folder server is not founded!`)
    await sleep(5000)
    return;
  }
  console.log(`[${chalk.blue("Start")}]: Start...`)
  await sleep(500)
  console.log(`[${chalk.gray("Log")}]: Backup to new folder...`)
  console.log(`[${chalk.gray("Log")}]: Backup: ${namefolder}`)
  const backupFolder = path.join(defaultContext.folderBackup, namefolder)
  fs.mkdirSync(backupFolder, { recursive: true })
  await sleep(500)
  // Create Backup
  console.log(`[${chalk.gray("Log")}]: Backup server.properties...`)
  copyFile(
    path.join(serverFolder, "server.properties"),
    path.join(backupFolder, "server.properties")
  )
  console.log(`[${chalk.gray("Log")}]: Backup world...`)
  await sleep(500)
  // Copy File World - To Backup Update
  copyFolderAll(
    path.join(serverFolder, "worlds"),
    path.join(backupFolder, "worlds")
  )
  await sleep(500)
  console.log(`[${chalk.green("Success")}]: Finish!`)
}

export default backupServer