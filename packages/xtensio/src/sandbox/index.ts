import path from "path"
import "../config/environment"
import { execute, fileExists } from "../helper"
import Refresh from "react-refresh/runtime"

async function compileTSFile(
  filePath: string,
  projectDir: string,
  tmpDir: string,
  isNpm: boolean
) {
  await execute(
    `${
      isNpm ? "npx" : "yarn"
    } tsc ${filePath} --outDir ${tmpDir} --resolveJsonModule --esModuleInterop --jsx react --allowUmdGlobalAccess --allowJs`
  )
  const relPath = path.relative(projectDir, filePath)
  const extName = path.extname(filePath)
  const possiblePaths = [
    path.join(tmpDir, path.basename(filePath).replace(extName, ".js")),
    path.join(tmpDir, relPath.replace(extName, ".js"))
  ]
  const activePath = possiblePaths.find((p) => fileExists(p))
  return activePath as string
}

// cheatsheet
// rx() - isLikelyComponentType function call on curr
// () - check if curr is a function and call it
function getItemFromObj(obj: any, map: Record<string, string>) {
  if (typeof obj !== "object") return {}
  const res = Object.entries(map)
    .map(([key, value]) => {
      const tree = value.split(".")
      let curr = obj
      for (let item of tree) {
        if (item === "()" && typeof curr === "function") {
          curr = curr()
          continue
        } else if (item === "rx()" && typeof curr === "function") {
          curr = Refresh.isLikelyComponentType(curr)
          continue
        }
        curr = curr?.[item]
        if (!curr) break
      }
      return { [key]: curr }
    })
    .reduce((a, b) => ({ ...a, ...b }), {})
  return res
}

async function init() {
  const [_, __, filePath, projectDir, tmpDir, isNpm, rawObj] = process.argv
  const obj = JSON.parse(rawObj)
  const compiled = await compileTSFile(filePath, projectDir, tmpDir, !!isNpm)
  const cImport = await import(compiled)
  const items = getItemFromObj(cImport, obj)
  process.send?.(items)
}
init()
