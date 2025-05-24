import inquirer from "inquirer"
import chalk from "chalk"
import * as cheerio from "cheerio"
import { Spinner } from "cli-spinner"
import fs from "fs"
import { defaultContext } from "../lib/default-value.js"
import sleep from "../lib/sleep.js"
import typeValid from "../lib/unvalidation.js"
import fetching from "../lib/fetching.js"
import path from "path"

const platformQuen = process.platform
const domTarget = {
  stabil: {
    win32: "serverBedrockWindows",
    linux: "serverBedrockLinux"
  },
  preview: {
    win32: "serverBedrockPreviewWindows",
    linux: "serverBedrockPreviewLinux"
  }
}
const labelPlatform = {
  win32: "Windows",
  linux: "Linux"
}

async function downloadFileServer() {
  // Check Platform
  if(typeValid.platform) {
    console.log(`[${chalk.gray("Log")}]: Checking platform compatible...`)
    if(!["linux","win32"].includes(platformQuen)) {
      console.log(`[${chalk.red("Error")}]: This platform (${platformQuen}) unsupport default installation!`)
      return process.exit(1)
    }
  } else {
    console.log(`[${chalk.yellow("Warning")}]: The system cannot read the platform, please make sure to select manual mode`)
  }
  // Asking for select what
  const selectMethod = [
    { name: `[${labelPlatform[platformQuen]||"Ukn"}] - Offical Mojang (Recommend)`, value: "offical" },
    { name: `[${labelPlatform[platformQuen]||"Ukn"}] - Manual`, value: "manual" },
  ]
  const promptMethod = await inquirer.prompt([
    { name: "method", type: "select", message: "[Download]: Method Downloading", choices: selectMethod, }
  ])
  // Create Folder
  if(!fs.existsSync(defaultContext.folderDownload) || !fs.lstatSync(defaultContext.folderDownload).isDirectory()) {
    fs.mkdirSync(path.join(defaultContext.folderDownload), { recursive: true })
  }
  if(promptMethod['method'] === "manual") {
    console.log(`---------------\n[${chalk.yellow("MANUAL METHOD")}]\nIt is recommended to upload the file server (.zip) first, you can still refresh before executing it, the manual system does not detect what devices are available, it only runs the installation command.\n\nFor manual installation, just uploaded and setup server normally.\n---------------`)
    const _CasePrompt = await inquirer.prompt([
      { name: "c", type: "select", message: "Got it?", choices: [{ name: "Yeah" }] }
    ])
    return;
  }
  // Asking type channel
  const selectChannel = [
    { name: `[${labelPlatform[platformQuen]||"Ukn"}] - Stabil (Recommend)`, value: "stabil" },
    { name: `[${labelPlatform[platformQuen]||"Ukn"}] - Preview`, value: "preview" },
  ]
  const promptChannel = await inquirer.prompt([
    { name: "channel", type: "select", message: "[Download]: Channel Media", choices: selectChannel }
  ])
  const domSelection = domTarget[promptChannel.channel][platformQuen||"linux"]
  // Loading Progress Bar Fetching
  console.log(`[${chalk.gray("Log")}]: Start Downloading..`)
  const loadingMain = Spinner(`[${chalk.gray("Request")}]: %s Get File Downloading..`)
  loadingMain.setSpinnerString(18)
  loadingMain.start()
  const requestMain = await fetching("https://www.minecraft.net/en-us/download/server/bedrock")
  loadingMain.stop(true)
  await sleep(1000)
  if(requestMain.error) {
    console.error("ErrorRequest:", requestMain)
    throw new Error(requestMain.error)
  }
  const parsing = cheerio.load(requestMain.data)
  const getADoc = String(parsing(`a[data-platform="${domSelection}"]`)?.attr("href")||"")
  const fileName = String(promptChannel.channel+"-"+(new URL(getADoc)?.pathname?.split("/")?.pop()))
  if(!getADoc.trim()) {
    throw new Error("No URL To Downloading In Offical!")
  }
  console.log(`[${chalk.gray("Request")}]: URL:`, getADoc)
  // Downloading
  const loadingDown = Spinner(`[${chalk.gray("Request")}]: %s Connect to server ..`)
  loadingDown.setSpinnerString(18)
  loadingDown.start()
  const downloadingFile = await fetching(getADoc, {
    onDownloadProgress: (pgevnt) => {
      const totalLength = pgevnt.lengthComputable ? pgevnt.total : pgevnt.target.getResponseHeader('content-length') || pgevnt.target.getResponseHeader('x-decompressed-content-length')
      let labelProcess = ""
      if(!isNaN(totalLength)) {
        const processing = Math.round((pgevnt.loaded * 100) / totalLength)
        labelProcess = `[${chalk.gray("Request")}]: %s [${processing}%] Process downloading...`
      } else {
        labelProcess = `[${chalk.gray("Request")}]: %s Stream process downloading...`
      }
      loadingDown.setSpinnerTitle(labelProcess)
    },
    responseType: 'arraybuffer'
  })
  await sleep(500)
  loadingDown.stop(true)
  await sleep(1000)
  console.log(`[${chalk.gray("Log")}]: Write file`, fileName)
  console.log(`[${chalk.gray("Log")}]: Version:`, String(fileName).split(".zip")[0].replace(/[^0-9.]/g, ''))
  fs.writeFileSync(path.join(defaultContext.folderDownload, fileName), downloadingFile.data)
  console.log(`[${chalk.green("Success")}]: Finish!, Next Setup Your Server`)
  await sleep(5000)
}

export default downloadFileServer