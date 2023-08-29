import path from "path"
import "../config/environment"
import { execute, fileExists } from "../helper"
import { getItemFromObj } from "./getItemFromObj"

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

async function init() {
  const [_, __, filePath, projectDir, tmpDir, isNpm, rawObj] = process.argv
  const obj = JSON.parse(rawObj)
  const compiled = await compileTSFile(filePath, projectDir, tmpDir, !!isNpm)
  const cImport = await import(compiled)
  const items = getItemFromObj(cImport, obj)
  process.send?.(items)
}
init()
