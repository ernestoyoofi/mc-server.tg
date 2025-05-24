import inquirer from "inquirer"
import chalk from "chalk"
import fs from "fs"
import path from "path"
import { defaultContext } from "../lib/default-value.js"
import sleep from "../lib/sleep.js"

function getValueFromKey(reading, key) {
  const ctxStg = String(reading||"").split("\n")
  return String(ctxStg.filter(a => a.match(`${key}=`))[0] || "").split("=").slice(1).join("=")
}

async function setupConfigurationServer() {
  const pathConfig = path.join(defaultContext.folderServer, "server.properties")
  console.log(`[${chalk.gray("Log")}]: The configuration file in ${pathConfig} will be changed in this setting`)
  let readingFile = ""
  if(fs.existsSync(pathConfig) && fs.lstatSync(pathConfig).isFile()) {
    readingFile = fs.readFileSync(pathConfig)
  }
  // Change Settings Basic
  const prompingAll = await inquirer.prompt([
    {
      name: "server_name", type: "input",
      message: "Name server? →", default: getValueFromKey(readingFile, "server-name")
    },
    {
      name: "gamemode", type: "select",
      message: "Game Mode", choices: [
        { name: "Survival (default)", value: "survival", },
        { name: "Creative", value: "creative", },
        { name: "Adventure", value: "adventure", },
      ]
    },
    {
      name: "force_gamemode", type: "select",
      message: "Force Gamemode", choices: [
        { name: "False (default)", value: "false", },
        { name: "True", value: "true", },
      ]
    },
    {
      name: "difficulty", type: "select",
      message: "Difficulty", choices: ["Easy","Normal","Hard","Peaceful"].map((a, i) => ({
        name: `${a} ${parseInt(i)===0?" (default)":""}`, value: String(a).toLowerCase()
      }))
    },
    {
      name: "allow_cheats", type: "select",
      message: "Allow Cheats", choices: [
        { name: "False (default)", value: "false", description: "Unable to perform op or other commands, active achievement" },
        { name: "True", value: "true", description: "Can perform op commands or others, achivement not active" },
      ]
    },
    {
      name: "max_players", type: "select",
      message: "Max Players (Adjust by file, Here are only recommendations)",
      choices: ["10","20","30","40","50","60","70","80","90","100","140","256","512"].map((a, i) => ({
        name: `${a} Players${parseInt(i)===0?" (default)":""}`, value: String(a).toLowerCase()
      }))
    },
    {
      name: "server_port", type: "input",
      message: "Server Port (1024 - 65535)", default: getValueFromKey(readingFile, "server-port")
    },
    {
      name: "server_portv6", type: "input",
      message: "Server Port V6 (1024 - 65535)", default: getValueFromKey(readingFile, "server-port")
    },
    {
      name: "seed", type: "input",
      message: "Seed World", default: getValueFromKey(readingFile, "level-seed")
    },
    {
      name: "online_mode", type: "select",
      message: "Online Mode", choices: [
        { name: "True (default)", value: "true", description: "Need microsoft account to visited server" },
        { name: "False", value: "false" },
      ]
    },
    {
      name: "view_distance", type: "select",
      message: "View Distance (Server)", choices: ["5","10","15","20","25","30","32","60","128"].map((a, i) => ({
        name: `${a} ${parseInt(i)===0?" (default)":""}`, value: String(a).toLowerCase()
      }))
    },
    {
      name: "player_idle_timeout", type: "select",
      message: "Player Idle Timeout (AFK)", choices: ["30","10","15","20","25","0"].map((a, i) => ({
        name: `${a==="0"?"Never":`${a} Minutes`} ${parseInt(i)===0?" (default)":""}`, value: String(a).toLowerCase()
      }))
    },
    {
      name: "max_threads", type: "select",
      message: "Max Thread Server", choices: ["2","4","8","16","32","64","128","256"].map((a, i) => ({
        name: `${a} ${parseInt(i)===0?" (default)":""}`, value: String(a).toLowerCase()
      }))
    },
    {
      name: "tick_distance", type: "select",
      message: "Tick Distance (Number of active chunks around the player)", choices: ["2","4","8","16","32"].map((a, i) => ({
        name: `${a} ${parseInt(i)===0?" (default)":""}`, value: String(a).toLowerCase()
      }))
    },
    {
      name: "disable_custom_skins", type: "select",
      message: "Disable Custom Skins", choices: [
        { name: "True (default)", value: "true" },
        { name: "False", value: "false" },
      ]
    },
    {
      name: "chat_restriction", type: "select",
      message: "Chat Restriction", choices: ["None","Dropped","Disabled"].map((a, i) => ({
        name: `${a} ${parseInt(i)===0?" (default)":""}`, value: String(a)
      }))
    },
  ])
  console.log(`[${chalk.gray("Log")}]: Take to confrim...`)
  const promptApply = await inquirer.prompt([
    { name: "apply", type: "select", message: "Change with new configuration?", choices: [
      { name: "Yes, i will change (Take a risk for none backup)", value: "true" },
      { name: "Cancel, return to previous configuration", value: "false" },
    ] }
  ])
  if(promptApply['apply'] === "false") {
    await sleep(500)
    console.log(`[${chalk.gray("Log")}]: Okay, it will revert back to before, continue your process...`)
    await sleep(2000)
    return;
  }
  const changeAllUnit = Object.keys(prompingAll).map((a => ({
    name: a.replace(/_/g, "-"),
    value: prompingAll[a]
  })))
  let unitChange = String(readingFile)
  for(let changeUnit of changeAllUnit) {
    unitChange = String(unitChange).replace(`${changeUnit.name}=${getValueFromKey(unitChange, changeUnit.name)}`, `${changeUnit.name}=${changeUnit.value}`)
  }
  fs.writeFileSync(pathConfig, unitChange, "utf-8")
  console.log(`[${chalk.green("Success")}]: Success save configuration!`)
  await sleep(2000)
}

export default setupConfigurationServer