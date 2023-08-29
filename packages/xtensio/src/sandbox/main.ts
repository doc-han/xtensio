import "../config/environment"
import { getItemFromObj } from "./getItemFromObj"

async function init() {
  const [_, __, sourcePath, rawObj] = process.argv
  const obj = JSON.parse(rawObj)
  const cImport = await import(sourcePath)
  const items = getItemFromObj(cImport, obj)
  process.send?.(items)
}
init()
