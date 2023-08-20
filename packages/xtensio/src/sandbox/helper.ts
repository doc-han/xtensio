import { fork } from "child_process"
import path from "path"

export async function sanboxExec<T extends string>(
  filePath: string,
  projectDir: string,
  tmpDir: string,
  isNpm: boolean,
  obj?: Record<T, string>
): Promise<Record<T, any>> {
  // @ts-ignore
  if (!obj) obj = {}
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
