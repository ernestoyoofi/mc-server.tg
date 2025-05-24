import * as unzipper from "unzipper"
import fs from "fs"

/**
 * Unzips a .zip file to a target output directory.
 * @param {string} zipPath - Path to .zip file
 * @param {string} outputDir - Output directory
 */
async function unzipFile(zipPath, outputDir) {
  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: outputDir }))
    .promise()
}

export default unzipFile