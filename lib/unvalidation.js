// Use for unvalidation like platform or other

const typeValid = {
  platform: !process.argv.includes("--unvalid-platform")
}

export default typeValid