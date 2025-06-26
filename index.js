import inquirer from "inquirer"
import { Separator } from "@inquirer/core"
import chalk from "chalk"
import fs from "fs"
import path from "path"
import { defaultContext } from "./lib/default-value.js"
import { fileURLToPath } from "url"
import downloadFileServer from "./plugin/download-server.js"
import sleep from "./lib/sleep.js"
import SetupFolderUp from "./lib/setup-folder-up.js"
import executeFileExe from "./lib/execute-file.js"
import setupServer from "./plugin/setup-server.js"
import updateServer from "./plugin/update-server.js"
import backupServer from "./plugin/backup-server.js"
import restoreServer from "./plugin/restore-server.js"
import listInstallAddons from "./plugin/list-install-addons.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function startMainRunning() {
  SetupFolderUp()
  console.log(`
  
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 
  ░░░█▄█░█▀▀░█▀▄░█▀▀░░░░█▀▀░░░░█▀▀░░░ 
  ░░░█░█░█░░░█▀▄░█▀▀░░░░▀▀█░░░░▀▀█░░░ 
  ░░░▀░▀░▀▀▀░▀▀░░▀▀▀░▀░░▀▀▀░▀░░▀▀▀░░░ 
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 
 
 [ ${chalk.yellow("MINECRAFT BEDROCK SETUP SERVER")} ✨ ]
 [ Version: ${JSON.parse(fs.readFileSync(__dirname+"/package.json","utf-8")).version} ]
`)
  const chooseToSelectMenu = [
    new Separator(`${chalk.gray("─────")} Menu ${chalk.gray("─────")}`),
    { name: "• Running Server", value: "run-server" },
    { name: "• Downloading File Server", value: "download-server" },
    { name: "• Setup Server New (Remove All If Exist)", value: "setup-server" },
    { name: "• Update Server", value: "update-server" },
    { name: "• Restore Server", value: "restore-server" },
    { name: "• Backup Server", value: "backup-server" },
    new Separator(`${chalk.gray("────")} Add-On ${chalk.gray("─────")}`),
    { name: "• List Up Add-On", value: "list-install-addons" },
    { name: "• List Add-On (Next Version)", value: "list-addons" },
    { name: "• Install Add-On (Next Version)", value: "install-addons" },
    { name: "• Remove Add-On (Next Version)", value: "remove-addons" },
    new Separator(`${chalk.gray("────")} Other ${chalk.gray("─────")}`),
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
    case "update-server": {
      await updateServer()
    } break;
    case "restore-server": {
      await restoreServer()
    } break;
    case "backup-server": {
      await backupServer()
    } break;
    case "list-install-addons": {
      await listInstallAddons()
    } break;
    case "run-server": {
      const serverFolder = path.join(defaultContext.folderServer)
      const readdirFileExecuted = fs.readdirSync(serverFolder).filter(a => a.match("bedrock_server") && a.length < 19)[0]
      const executeFile = path.join(serverFolder, readdirFileExecuted)
      console.log(`[${chalk.gray("Log")}]: -----------------------------------`)
      console.log(`[${chalk.gray("Log")}]: [INFO]`)
      console.log(`[${chalk.gray("Log")}]: Hit CTRL + C 2x to exit from this process`)
      console.log(`[${chalk.gray("Log")}]: -----------------------------------`)
      console.log(`[${chalk.gray("Log")}]: Launching ${executeFile}...`)
      console.log(`[${chalk.blue("Launch")}]: ${chalk.gray(`> ${executeFile}`)}`)
      await sleep(500)
      await executeFileExe(executeFile)
      await sleep(1000)
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