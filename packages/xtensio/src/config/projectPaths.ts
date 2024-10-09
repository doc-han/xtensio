import path from "path"
import { directoryExists, fileExists } from "../helper"

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
  publicPath: string
  tailwindPath: string
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
  const srcPath = path.join(cwd, "./src")
  const isSrc = directoryExists(srcPath)
  const _cwd = isSrc ? srcPath : cwd
  return {
    projectDirectory: cwd,
    devOutput: path.join(cwd, "./.xtensio/dev"),
    prodOutput: path.join(cwd, "./.xtensio/build"),
    tmpDir: path.join(cwd, "./.xtensio/tmp"),
    packageJSON: path.join(cwd, "./package.json"),
    popup: getJsFilePath(path.join(_cwd, `./popup/popup.tsx`), false),
    background: getJsFilePath(path.join(_cwd, `./background/index.ts`), false),
    manifest: getJsFilePath(path.join(_cwd, `./manifest.ts`)),
    contentsFolder: path.join(_cwd, "./contents"),
    pagesFolder: path.join(_cwd, "./pages"),
    npmLock: path.join(cwd, "./package-lock.json"),
    publicPath: path.join(cwd, "./public"),
    tailwindPath: path.join(cwd, "./tailwind.config.js")
  }
}
