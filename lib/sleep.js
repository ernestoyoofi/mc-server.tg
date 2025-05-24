async function sleep(milisec) {
  return new Promise((a) => setTimeout(a, milisec))
}

export default sleep