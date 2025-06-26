// Use for unvalidation like platform or other

const typeValid = {
  platform: !process.argv.includes("--unvalid-platform"),
  flaglog: !!process.argv.includes("--log")
}

export default typeValid