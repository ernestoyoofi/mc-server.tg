import readline from "readline"
import chalk from "chalk"
import sleep from "./sleep.js"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.output,
})

async function HitEnterToRun(cb) {
  console.log(`[${chalk.gray("Log")}]: Hit "Enter" to running this function...`)
  rl.on("line", async (input) => {
    if(input.trim() === "") {
      console.log(`[${chalk.gray("Log")}]: Run...`)
      await sleep(500)
      cb()
      rl.close()
    } else {
      HitEnterToRun(cb)
    }
  })
}

export default HitEnterToRun