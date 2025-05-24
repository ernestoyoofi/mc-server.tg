import * as yauzl from "yauzl"
import fs from "fs"
import path from "path"
import { pipeline } from "stream/promises"

/**
 * Unzip file to target directory using yauzl
 * @param {string} zipPath - Path to the .zip file
 * @param {string} outputDir - Path to output directory
 */
async function unzipFile(zipPath, outputDir) {
  const zipfile = await new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) reject(err)
      else resolve(zipfile)
    })
  })
  return new Promise((resolve, reject) => {
    zipfile.readEntry()
    zipfile.on("entry", async (entry) => {
      const filePath = path.join(outputDir, entry.fileName)
      console.log("[Unzip]: Path", filePath)
      try {
        if (/\/$/.test(entry.fileName)) {
          // Folder
          await fs.promises.mkdir(filePath, { recursive: true })
          zipfile.readEntry()
        } else {
          // File
          await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
          zipfile.openReadStream(entry, async (err, readStream) => {
            if (err) return reject(err)
            try {
              await pipeline(readStream, fs.createWriteStream(filePath))
              zipfile.readEntry()
            } catch (e) {
              reject(e)
            }
          })
        }
      } catch (e) {
        reject(e)
      }
    })
    zipfile.on("end", () => resolve())
    zipfile.on("error", reject)
  })
}

export default unzipFile