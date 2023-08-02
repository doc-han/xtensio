import path from "path"

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
}

export default function getProjectPaths(cwd: string): ProjectPaths {
  return {
    projectDirectory: cwd,
    devOutput: path.join(cwd, "./.xtensio/dev"),
    prodOutput: path.join(cwd, "./.xtensio/build"),
    tmpDir: path.join(cwd, "./.xtensio/tmp"),
    packageJSON: path.join(cwd, "./package.json"),
    popup: path.join(cwd, "./popup/popup.tsx"),
    background: path.join(cwd, "./background/index.ts"),
    manifest: path.join(cwd, "./manifest.ts"),
    contentsFolder: path.join(cwd, "./contents")
  }
}
