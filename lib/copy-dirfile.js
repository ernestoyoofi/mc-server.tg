import fs from "fs"
import path from "path"

function copyFolderAll(pathSource, pathBackup) {
  if(!fs.existsSync(pathBackup)) {
    fs.mkdirSync(pathBackup, { recursive: true })
  }
  const entries = fs.readdirSync(pathSource, { withFileTypes: true })
  for(const entry of entries) {
    const srcPath = path.join(pathSource, entry.name)
    const destPath = path.join(pathBackup, entry.name)
    if(entry.isDirectory()) {
      copyFolderAll(srcPath, destPath)
    } else if(entry.isFile()) {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function copyFile(pathSource, pathBackup) {
  fs.copyFileSync(pathSource, pathBackup)
}

export {
  copyFolderAll,
  copyFile
}