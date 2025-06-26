import { defaultContext } from "./default-value.js"
import fs from "fs"

function SetupFolderUp() {
  for(let keyObj of Object.keys(defaultContext)) {
    const folderPath = defaultContext[keyObj]
    // Exist
    if(fs.existsSync(folderPath)) {
      if(!fs.lstatSync(folderPath).isDirectory()) {
        fs.rmSync(folderPath, { recursive: true, force: true })
        // Create New One
        fs.mkdirSync(folderPath, { recursive: true })
      }
    } else {
      // Create New
      fs.mkdirSync(folderPath, { recursive: true })
    }
  }
}

export default SetupFolderUp