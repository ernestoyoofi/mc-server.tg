import inquirer from "inquirer"
import chalk from "chalk"
import { Spinner } from "cli-spinner"
import { Separator } from "@inquirer/core"
import fs from "fs"
import path from "path"
import { defaultContext } from "../lib/default-value.js"
import sleep from "../lib/sleep.js"
import downloadFileServer from "./download-server.js"
import { copyFolderAll, copyFile } from "../lib/copy-dirfile.js"
import unzipFile from "../lib/unzip-file.v2.js"

const labelChannel = {
  stabil: "Stabil",
  preview: "Preview",
  ukn: "Unknown"
}

async function updateServer() {
  // Always Exist This Folder
  const downloadFolder = path.join(defaultContext.folderDownload)
  const backupFolder = path.join(defaultContext.folderBackupUpdate)
  if(!fs.existsSync(downloadFolder) || !fs.lstatSync(downloadFolder).isDirectory()) {
    fs.mkdirSync(downloadFolder, { recursive: true })
  }
  // Exist Folder Backup
  if(!fs.existsSync(backupFolder) || !fs.lstatSync(backupFolder).isDirectory()) {
    fs.mkdirSync(backupFolder, { recursive: true })
  }
  // Get File Exist
  const readDir = fs.readdirSync(downloadFolder)
  const companingLeft = readDir.filter(a => a.endsWith(".zip")).map((nameFile) => {
    const namePath = path.parse(nameFile)
    return {
      slugname: nameFile,
      namefile: namePath.name,
      version_n: parseInt((namePath.name)?.replace(/[^0-9]/g, '')),
      version: (namePath.name)?.replace(/[^0-9.]/g, ''),
      channel: labelChannel[namePath.name?.split("-")[0]]
    }
  }).sort((a, b) => b.version_n - a.version_n).map(a => (
    { name: `${a.channel} | ${a.version} - ${a.namefile}`, value: `file$:${a.slugname}` }
  ))
  const promptSelectFileServer = await inquirer.prompt([
    {
      name: "server_file", type: "select", message: "[File Server] Select Your File Server Downloader", 
      choices: [
        new Separator(),
        { name: "Refresh Folder", value: "refresh" },
        { name: "Download New", value: "download-server" },
        { name: "Cancel, Back To Menu", value: "exit" },
        new Separator(),
        ...companingLeft
      ]
    }
  ])
  switch(promptSelectFileServer['server_file']) {
    case "refresh": {
      await sleep(1000)
      return await updateServer()
    } break;
    case "download-server": {
      await sleep(500)
      await downloadFileServer()
      await sleep(500)
      return await updateServer()
    } break;
    case "exit": {
      await sleep(1500)
      return;
    }
  }
  const pathFileSelected = path.join(downloadFolder, promptSelectFileServer['server_file'].replace("file$:",""))
  const serverFolder = path.join(defaultContext.folderServer)
  // Starting!
  console.log(`[${chalk.gray("Log")}]: File selected: ${pathFileSelected}`)
  const spinnerTup = new Spinner(`[${chalk.gray("Processing")}]: %s Processing...`)
  spinnerTup.setSpinnerString(18)
  spinnerTup.start()
  spinnerTup.setSpinnerTitle(`[${chalk.gray("Processing")}]: %s Backup File...`)
  // Copy Configuration - To Backup Update
  copyFile(
    path.join(serverFolder, "server.properties"),
    path.join(backupFolder, "server.properties")
  )
  // Copy File World - To Backup Update
  copyFolderAll(
    path.join(serverFolder, "worlds"),
    path.join(backupFolder, "worlds")
  )
  // Removeing Old Data
  await sleep(1500)
  spinnerTup.setSpinnerTitle(`[${chalk.gray("Processing")}]: %s Removeing Old Data...`)
  fs.rmSync(serverFolder, { recursive: true, force: true })
  fs.mkdirSync(serverFolder, { recursive: true })
  // Unzip New Data
  spinnerTup.setSpinnerTitle(`[${chalk.gray("Processing")}]: %s Unzip File...`)
  await unzipFile(pathFileSelected, serverFolder)
  // Copy Backup To Server
  copyFile(
    path.join(backupFolder, "server.properties"),
    path.join(serverFolder, "server.properties")
  )
  copyFolderAll(
    path.join(backupFolder, "worlds"),
    path.join(serverFolder, "worlds")
  )
  await sleep(500)
  spinnerTup.stop(true)
  console.log(`[${chalk.green("Success")}]: Finish!`)
  await sleep(3000)
}

export default updateServer