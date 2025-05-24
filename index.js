import inquirer from "inquirer"
import { Separator } from "@inquirer/core"
import chalk from "chalk"
import * as openurl from "openurl"
import fs from "fs"

import downloadFileServer from "./plugin/download-server.js"
import sleep from "./lib/sleep.js"
import setupServer from "./plugin/setup-server.js"

async function startMainRunning() {
  // console.clear()
  console.log(`
  
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 
  ░░░█▄█░█▀▀░█▀▄░█▀▀░░░░█▀▀░░░░█▀▀░░░ 
  ░░░█░█░█░░░█▀▄░█▀▀░░░░▀▀█░░░░▀▀█░░░ 
  ░░░▀░▀░▀▀▀░▀▀░░▀▀▀░▀░░▀▀▀░▀░░▀▀▀░░░ 
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 
 
 [ ${chalk.yellow("MINECRAFT BEDROCK SETUP SERVER")} ✨ ]
 [ Version: ${JSON.parse(fs.readFileSync("./package.json","utf-8")).version} ]
`)
  const chooseToSelectMenu = [
    new Separator(`${chalk.gray("─────")} Menu ${chalk.gray("─────")}`),
    { name: "• Downloading File Server", value: "download-server" },
    { name: "• Setup Server New (Remove All If Exist)", value: "setup-server" },
    { name: "• Update Server", value: "update-server" },
    { name: "• Restore Server (Comming Soon)", value: "restore-server" },
    { name: "• Backup Server (Comming Soon)", value: "backup-server" },
    new Separator(`${chalk.gray("────")} Other ${chalk.gray("─────")}`),
    { name: "• Help (Documentation)", value: "docs-help" },
    { name: "• Exit", value: "exit" },
  ]
  const promptMenu = await inquirer.prompt([
    { name: "menu", type: "select", message: "What Do You Want Now?", choices: chooseToSelectMenu, }
  ])
  switch(promptMenu['menu']) {
    case "download-server": {
      await downloadFileServer()
    } break;
    case "setup-server": {
      await setupServer()
    } break;
    case "docs-help": {
      openurl.open("https://nakikoneko.gitbook.io/mcbe.s.s")
    } break;
    case "exit": {
      await sleep(100)
      console.log("  [X] Goodbye 👋")
      process.exit()
    }
  }
  await sleep(400)
  startMainRunning()
}
startMainRunning()