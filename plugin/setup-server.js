import inquirer from "inquirer"
import chalk from "chalk"
import { Spinner } from "cli-spinner"
import { Separator } from "@inquirer/core"
import fs from "fs"
import path from "path"
import { defaultContext } from "../lib/default-value.js"
import sleep from "../lib/sleep.js"
import downloadFileServer from "./download-server.js"
import unzipFile from "../lib/unzip-file.v2.js"
import executeFileExe from "../lib/execute-file.js"
import setupConfigurationServer from "./setup-file.js"

const labelChannel = {
  stabil: "Stabil",
  preview: "Preview",
  ukn: "Unknown"
}

async function setupServer(IgnoreSafetyFolder = false) {
  // Always Exist This Folder
  const downloadFolder = path.join(defaultContext.folderDownload)
  if(!fs.existsSync(downloadFolder) || !fs.lstatSync(downloadFolder).isDirectory()) {
    fs.mkdirSync(downloadFolder, { recursive: true })
  }
  // Checking Doing Safety
  const serverFolder = path.join(defaultContext.folderServer)
  if(!IgnoreSafetyFolder && fs.existsSync(serverFolder) && fs.lstatSync(serverFolder)?.isDirectory() && fs.readdirSync(serverFolder)?.length > 1) {
    console.log(`---------------\n[${chalk.yellow("WARNING!")}]\nThis server setup will delete everything in the main server folder, if you don't backup it then you will lose it, before the process continues then you confirm this..\n---------------`)
    const _CasePrompt = await inquirer.prompt([
      {
        name: "c", type: "select",
        message: "Got it?",
        choices: [
          { name: "Okey, countinue (At your own risk)", value: "next" },
          { name: "Do not continue", value: "dont" },
        ],
      }
    ])
    if(_CasePrompt['c'] === "dont") {
      console.log(`[${chalk.gray("Log")}]: Okey, cancel this unit process!`)
      await sleep(1200)
      return;
    }
  }
  // Select File Downloading
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
      return await setupServer(true)
    } break;
    case "download-server": {
      await sleep(500)
      await downloadFileServer()
      await sleep(500)
      return await setupServer(true)
    } break;
    case "exit": {
      await sleep(1500)
      return;
    }
  }
  const pathFileSelected = path.join(downloadFolder, promptSelectFileServer['server_file'].replace("file$:",""))
  console.log(`[${chalk.gray("Log")}]: File selected: ${pathFileSelected}`)
  // Installing New Server
  const spinnerTup = new Spinner(`[${chalk.gray("Processing")}]: %s Processing...`)
  spinnerTup.setSpinnerString(18)
  spinnerTup.start()
  await sleep(500)
  if(fs.existsSync(serverFolder) && fs.lstatSync(serverFolder)?.isDirectory() && fs.readdirSync(serverFolder)?.length > 1) {
    spinnerTup.setSpinnerTitle(`[${chalk.gray("Processing")}]: %s Remove exist folder...`)
    // If Exists To Remove All (Including Files)
    fs.rmSync(serverFolder, { recursive: true, force: true })
    fs.mkdirSync(serverFolder, { recursive: true })
  }
  // Unzip Files
  spinnerTup.setSpinnerTitle(`[${chalk.gray("Processing")}]: %s Unzip file...`)
  await unzipFile(pathFileSelected, serverFolder)
  spinnerTup.stop(true)
  await sleep(500)
  // Finishing
  console.log(`[${chalk.green("Success")}]: Finish setup!, next to setup basic config`)
  await sleep(3000)
  // Standar Configuration
  await setupConfigurationServer()
  console.log(`[${chalk.green("Success")}]: Finish!, just running your server`)
  const readdirFileExecuted = fs.readdirSync(serverFolder).filter(a => a.match("bedrock_server") && a.length < 19)[0]
  const executeFile = path.join(serverFolder, readdirFileExecuted)
  console.log(`[${chalk.green("Success")}]: To running, open (if windows) or execute (if linux) this file on ${executeFile}`)
  await sleep(500)
  const promptRunExec = await inquirer.prompt([
    { name: "exec", type: "select", message: "Do you want to run it here?", choices: [
      { name: "Yes, i want", value: "true" },
      { name: "Nope", value: "false" },
    ] }
  ])
  if(promptRunExec['exec'] === "true") {
    console.log(`[${chalk.gray("Log")}]: Wait...`)
    await sleep(500)
    console.log(`[${chalk.gray("Log")}]: Launching ${executeFile}...`)
    console.log(`[${chalk.blue("Launch")}]: > ${executeFile}`)
    await sleep(500)
    await executeFileExe(executeFile)
  }
}

export default setupServer