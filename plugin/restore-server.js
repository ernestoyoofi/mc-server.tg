import inquirer from "inquirer"
import chalk from "chalk"
import { Separator } from "@inquirer/core"
import fs from "fs"
import path from "path"
import { defaultContext } from "../lib/default-value.js"
import sleep from "../lib/sleep.js"
import { copyFolderAll, copyFile } from "../lib/copy-dirfile.js"

async function restoreServer() {
  const serverFolder = path.join(defaultContext.folderServer)
  const backupFolder = path.join(defaultContext.folderBackup)
  // Get Select Backup Server
  const readDir = fs.readdirSync(backupFolder).map(a => ({
    date: new Date(parseInt(a.split("-")[0])),
    date_n: parseInt(a.split("-")[0]),
    uid: a.split("-")[1],
    slugname: a
  })).sort((a, b) => b.date_n - a.date_n).map(a => ({
    name: `${String(a.date).split("(")[0].trim()} | UID ${a.uid}`, value: `file$:${a.slugname}`
  }))
  const selectBackup = await inquirer.prompt([
    { name: "backup", type: "select", message: "Select Your Backup", choices: [
      new Separator(),
      { name: "Refresh", value: "refresh" },
      { name: "Cancel, Back To Menu", value: "exit" },
      new Separator(),
      ...readDir
    ] }
  ])
  switch(selectBackup['backup']) {
    case "refresh": {
      await sleep(1000)
      return await restoreServer()
    } break;
    case "exit": {
      await sleep(1500)
      return;
    }
  }
  const selectFolderBackup = path.join(backupFolder, selectBackup['backup'].replace("file$:",""))
  console.log(`[${chalk.gray("Log")}]: Restore: ${selectFolderBackup}`)
  // Copy All From Restore To Server
  console.log(`[${chalk.gray("Log")}]: Restore server.properties...`)
  copyFile(
    path.join(selectFolderBackup, "server.properties"),
    path.join(serverFolder, "server.properties")
  )
  console.log(`[${chalk.gray("Log")}]: Restore world...`)
  await sleep(500)
  copyFolderAll(
    path.join(selectFolderBackup, "worlds"),
    path.join(serverFolder, "worlds")
  )
  await sleep(500)
  console.log(`[${chalk.green("Success")}]: Finish!`)
}

export default restoreServer