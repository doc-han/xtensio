import { fork } from "child_process"
import path from "path"
import os from "os"
import fs from "fs"

function randomGen() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(23).substring(2, 5)
  )
}

async function sandboxExecTs<T extends string>(
  filePath: string,
  projectDir: string,
  tmpDir: string,
  isNpm: boolean,
  obj?: Record<T, string>
): Promise<Record<T, any>> {
  if (!obj) obj = {} as Record<T, any>
  return new Promise((resolve) => {
    const child = fork(path.resolve(__dirname, "./index.js"), [
      filePath,
      projectDir,
      tmpDir,
      isNpm,
      JSON.stringify(obj)
    ] as any)
    child.on("message", (data) => {
      child.kill()
      resolve(data as any)
    })
  })
}

async function sandboxExecMain<T extends string>(
  sourcePath: string,
  obj?: Record<T, string>
): Promise<Record<T, any>> {
  if (!obj) obj = {} as Record<T, any>
  return new Promise((resolve) => {
    const child = fork(path.resolve(__dirname, "./main.js"), [
      sourcePath,
      JSON.stringify(obj)
    ] as any)
    child.on("message", (data) => {
      child.kill()
      resolve(data as any)
    })
  })
}

const sandboxExec = {
  ts: sandboxExecTs,
  source: <T extends string>(source: string, obj?: Record<T, string>) => {
    const filePath = path.join(os.tmpdir(), `x_${randomGen()}.js`)
    fs.writeFileSync(filePath, source)
    return sandboxExecMain<T>(filePath, obj)
  },
  file: <T extends string>(filePath: string, obj?: Record<T, string>) =>
    sandboxExecMain<T>(filePath, obj)
}

export default sandboxExec
