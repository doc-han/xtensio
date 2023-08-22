import execute from "./execute"

interface InstallInterface {
  deps: Record<string, string | undefined>
  devDeps: Record<string, string | undefined>
  pkgManager: "npm" | "yarn"
  cwd: string
}

function genScript(
  vals: Record<string, string | undefined>,
  pkgManager: "npm" | "yarn",
  dev: boolean
) {
  const deps = Object.entries(vals).map(([key, value]) => {
    return value ? `${key}@${value}` : key
  })
  const devStr = dev ? (pkgManager === "npm" ? "--save-dev" : "-D") : ""
  return (
    (pkgManager === "npm" ? "npm install" : "yarn add") +
    " " +
    deps.join(" ") +
    " " +
    devStr
  )
}

async function pkgInstall(options: InstallInterface) {
  const depsCommand = genScript(options.deps, options.pkgManager, false)
  const devDepsCommand = genScript(options.devDeps, options.pkgManager, true)

  await execute(depsCommand, options.cwd)
  await execute(devDepsCommand, options.cwd)
}

export default pkgInstall
