import generateCommand from "./generate"
import buildCommand from "./build"
import { Commands, GenerateValues } from "../types"
import devCommand from "./dev"
import path from "path"
import { execute, fileExists } from "./helper"

export async function xtensioCLI<T extends Commands>(
  binaryPath: string,
  _cwd: string,
  command: T,
  value: GenerateValues
) {
  const cwd = process.cwd()
  const isNpm = fileExists(path.join(cwd, "./package-lock.json"))
  switch (command) {
    case "generate":
      generateCommand(cwd, value)
      return
    case "build":
      await buildCommand(cwd)
      const buildPath = path.join(cwd, "./.xtensio/build")
      execute(
        `${
          isNpm ? "npx" : "yarn"
        } web-ext build --source-dir ${buildPath} -o --artifacts-dir=zips`
      )
      return
    case "dev":
      const pkg = require(path.join(cwd, "./package.json"))
      const startUrls: string[] = (
        Array.isArray(pkg.xtensio?.startUrls) ? pkg.xtensio?.startUrls : []
      )
        .filter((v: unknown) => typeof v === "string")
        .map((v: string) => `--start-url ${v}`)
        .join(" ")
      await devCommand(cwd)
      const devPath = path.join(cwd, "./.xtensio/dev")
      execute(
        `${
          isNpm ? "npx" : "yarn"
        } web-ext run --source-dir ${devPath} --target=chromium --no-reload ${startUrls}`
      )
      return
    default:
      throw Error(`Command ${command} was not found!`)
  }
}
