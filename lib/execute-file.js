import { spawn } from "child_process"

export async function executeFile(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      ...options,
    })
    child.stdout.on("data", (data) => {
      process.stdout.write(data)
    })
    child.stderr.on("data", (data) => {
      process.stderr.write(data)
    })
    process.stdin.pipe(child.stdin)
    child.on("close", (code) => {
      process.stdin.unpipe(child.stdin)
      child.stdin.end()
      resolve(code)
    })
    child.on("error", (err) => {
      reject(err)
    })
  })
}

export default executeFile