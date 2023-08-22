import { exec } from "child_process"

const execute = (command: string, cwd: string) =>
  new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
        return
      }
      resolve(stdout)
      if (stderr) reject(stderr)
    })
  })

export default execute
