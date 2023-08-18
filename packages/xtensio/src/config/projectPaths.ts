import path from "path"
import { fileExists } from "../helper"

export interface ProjectPaths {
  projectDirectory: string
  devOutput: string
  prodOutput: string
  tmpDir: string
  packageJSON: string
  popup: string
  background: string
  manifest: string
  contentsFolder: string
  pagesFolder: string
  npmLock: string
}

function getJsFilePath(absPath: string, required = true) {
  const possiblePaths = [".js", ".ts", ".jsx", ".tsx"].map((ext) =>
    absPath.replace(/\.\w+$/gi, ext)
  )
  const availablePath = possiblePaths.find((path) => fileExists(path))
  if (!availablePath) {
    if (required)
      throw Error(
        "[Required_File_Not_Found] a file that is required by xtensio can't be found"
      )
    else return absPath
  }
  return availablePath
}

export default function getProjectPaths(cwd: string): ProjectPaths {
  return {
    projectDirectory: cwd,
    devOutput: path.join(cwd, "./.xtensio/dev"),
    prodOutput: path.join(cwd, "./.xtensio/build"),
    tmpDir: path.join(cwd, "./.xtensio/tmp"),
    packageJSON: path.join(cwd, "./package.json"),
    popup: getJsFilePath(path.join(cwd, `./popup/popup.tsx`), false),
    background: getJsFilePath(path.join(cwd, `./background/index.ts`), false),
    manifest: getJsFilePath(path.join(cwd, `./manifest.ts`)),
    contentsFolder: path.join(cwd, "./contents"),
    pagesFolder: path.join(cwd, "./pages"),
    npmLock: path.join(cwd, "./package-lock.json")
  }
}
