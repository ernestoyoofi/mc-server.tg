import inquirer from "inquirer"
import chalk from "chalk"
import { Separator } from "@inquirer/core"
import fs from "fs"
import path from "path"
import { defaultContext } from "../lib/default-value.js"
import unzipFile from "../lib/unzip-file.v2.js"
import sleep from "../lib/sleep.js"
import typeValid from "../lib/unvalidation.js"

const extSlug = {
  ".mcpack": "mcpack",
  ".mcaddon": "mcaddon"
}
const moduleVar = {
  rp: "resource_packs",
  bp: "behavior_packs"
}
const moduleVarName = {
  rp: "world_resource_packs.json",
  bp: "world_behavior_packs.json"
}
const moduleType = {
  resources: "rp",
  data: "bp"
}
const extList = Object.keys(extSlug)

function removeMinecraftFormatting(tgsmsstg) {
  const regex = /§[0-9a-z]/g
  return tgsmsstg.replace(regex, "")
}
function CreateSlugPackage(namepackage) {
  const tgString = String(namepackage).toLowerCase()
  const regex = /[^a-z0-9._]/g
  let caseText = String(tgString.replace(regex, '')||"")
  for(let obc of Object.keys(moduleVarName)) {
    caseText = caseText?.replaceAll(`_${obc}`, "")
      ?.replaceAll(`${obc}_`, "")
      ?.replaceAll(`_${obc}_`, "")
  }
  return caseText
}
function ReadingManifestSmall(pathFileManifest) {
  try {
    const readFile = fs.readFileSync(pathFileManifest, "utf-8")
    const readData = JSON.parse(readFile)
    const moduleTypes = String((readData?.modules?.find(a => 
      Object.keys(moduleType).includes(a?.type||"")
    )).type||"")
    if(!moduleType[moduleTypes]) {
      console.log(`[${chalk.red("Error")}]: Unvalid Type On ${pathFileManifest}`)
      return {
        valid: false,
        unvalid_type: "manifest"
      }
    }
    return {
      valid: true,
      title: removeMinecraftFormatting(readData.header.name),
      description: removeMinecraftFormatting(readData.header.description),
      uuid: readData.header.uuid,
      version: readData.header.version,
      var: moduleVar[moduleType[moduleTypes]],
      type: moduleType[moduleTypes],
    }
  } catch(e) {
    if(typeValid.flaglog) {
      console.log(`[${chalk.red("Error Logs")}]:`, e.stack)
    }
    console.log(`[${chalk.red("Error")}]: Failed Read Detail On ${pathFileManifest}`)
    return {
      valid: false,
      unvalid_type: "reading_logic"
    }
  }
}

async function CreateCache(pathcache, pathAddons) {
  if(!fs.existsSync(pathcache) || !fs.lstatSync(pathcache).isDirectory()) {
    fs.mkdirSync(pathcache, { recursive: true })
  }
  unzipFile(pathAddons, pathcache)
}

async function listInstallAddons({ returnDataOnly = false } = {}) {
  const pathAddons = path.join(defaultContext.folderAddOns)
  const pathAddonsCache = path.join(defaultContext.folderCache+"-run-addons-installed")
  // Create Folder If Not Exist
  if(!fs.existsSync(pathAddons) || !fs.lstatSync(pathAddons).isDirectory()) {
    fs.mkdirSync(pathAddons, { recursive: true })
  }
  console.log(`[${chalk.red("Log")}]: Load list... (Take a few second or minutes)`)
  // List Files
  const readList = fs.readdirSync(pathAddons).filter(a =>
    extList.includes(String(path.parse(a)?.ext||"").trim().toLowerCase())
  )
  let listedName = {}
  for(let listingName of readList) {
    // Unzip The Cache File To See Of Detail Files
    const baseName = path.parse(listingName) // Filename Parser
    const typeDetail = String(extSlug[baseName.ext]||"") // Detail Extension
    const cacheDetail = path.join(pathAddonsCache, baseName.name+"_"+typeDetail) // Cache File
    await CreateCache(cacheDetail, path.join(pathAddons, listingName))
    await sleep(200)
    switch(typeDetail) {
      case "mcpack": {
        const readFile = path.join(cacheDetail, "manifest.json")
        const detailFile = ReadingManifestSmall(readFile)
        if(detailFile.valid) {
          const dataResponse = {
            slug: CreateSlugPackage(baseName.name),
            title: detailFile.title,
            description: detailFile.description,
            uuid: detailFile.uuid,
            version: [...detailFile.version,1,0,0].slice(0,3),
            variables: detailFile.var,
            type: detailFile.type,
            path: path.join(pathAddons, listingName),
            package: cacheDetail
          }
          if(!listedName[dataResponse.slug]) {
            listedName[dataResponse.slug] = {
              file: listingName,
              name: dataResponse.title,
              description: dataResponse.description,
              uuid: dataResponse.uuid,
              version: dataResponse.version,
              slug: dataResponse.slug,
              list: []
            }
          }
          listedName[dataResponse.slug].list.push(dataResponse)
        }
      } break;
      case "mcaddon": {
        const listMoreExt = fs.readdirSync(cacheDetail)
        for(let nameFolder of listMoreExt) {
          const costManifest = path.join(cacheDetail, nameFolder)
          const readFile = path.join(costManifest, "manifest.json")
          const detailFile = ReadingManifestSmall(readFile)
          const dataResponse = {
            slug: CreateSlugPackage(baseName.name),
            title: detailFile.title,
            description: detailFile.description,
            uuid: detailFile.uuid,
            version: [...detailFile.version,1,0,0].slice(0,3),
            variables: detailFile.var,
            type: detailFile.type,
            path: path.join(pathAddons, listingName),
            package: cacheDetail
          }
          if(!listedName[dataResponse.slug]) {
            listedName[dataResponse.slug] = {
              file: listingName,
              name: dataResponse.title,
              description: dataResponse.description,
              uuid: dataResponse.uuid,
              version: dataResponse.version,
              slug: dataResponse.slug,
              list: []
            }
          }
          listedName[dataResponse.slug].list.push(dataResponse)
        }
      }
    }
  }
  const basicLecure = {
    addons_folder: pathAddons,
    addons_folder_cache: pathAddonsCache,
    addons_list_installed: Object.values(listedName)
  }
  // Return API
  if(returnDataOnly) {
    return basicLecure
  }
  // Next To List
  const cachelist = basicLecure.addons_list_installed.map((a) => ({
    name: `${a.name} - ${a.slug}`, value: a.slug
  }))
  console.log(`[${chalk.red("Log")}]: This menu only show, not action to install or remove!`)
  const selectList = await inquirer.prompt([
    {
      name: "backup", type: "select", message: "List Addons Download", choices: [
        new Separator(),
        { name: "Refresh", value: "refresh" },
        { name: "Cancel, Back To Menu", value: "exit" },
        new Separator(),
        ...cachelist
      ]
    }
  ])
  switch(selectList['backup']) {
    case "refresh": {
      await sleep(1000)
      return await listInstallAddons()
    } break;
    case "exit": {
      await sleep(1500)
      return;
    }
  }
  await sleep(1000)
}

export default listInstallAddons