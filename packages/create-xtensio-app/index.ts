import { mkdirSync } from "fs"
import Listr from "listr"
import path from "path"
import fs from "fs/promises"
import kebabCase from "lodash.kebabcase"
import camelCase from "lodash.camelcase"
import upperFirst from "lodash.upperfirst"
import chalk from "chalk"
import prompts from "prompts"
import pkgInstall from "./helpers/install"
import execute from "./helpers/execute"

export const nameHelper = (str: string) => {
  const kebab = kebabCase(str)
  const camel = camelCase(kebab)
  const pascal = upperFirst(camel)
  return {
    name: str,
    kebab,
    camel,
    pascal
  }
}

export default async function createCommand(cwd: string, value?: string) {
  let projectNameInput = value
  if (!projectNameInput)
    projectNameInput = (
      await prompts({
        type: "text",
        message: "What's the name of your project?",
        name: "projectName",
        validate: (name) => typeof name === "string" && name.length > 0
      })
    ).projectName

  if (!projectNameInput) throw Error("Project name not specified")
  const projectName = nameHelper(projectNameInput)

  const pkgManager = (
    await prompts({
      type: "toggle",
      message: "Choose preferred package manager",
      name: "pkgManager",
      active: "yarn",
      inactive: "npm"
    })
  ).pkgManager
    ? "yarn"
    : "npm"

  const srcFolder = (
    await prompts({
      type: "confirm",
      message: "Do you want an src folder?",
      name: "srcFolder",
      initial: true
    })
  ).srcFolder

  const isTs = (
    await prompts({
      type: "confirm",
      message: `Do you want to use ${chalk.blue("Typescript")}?`,
      initial: true,
      name: "isTs"
    })
  ).isTs

  const projectDir = path.join(cwd, projectName.kebab)
  const tasks = new Listr([
    {
      title: "Generating Project directory",
      task: () => {
        mkdirSync(projectDir, { recursive: true })
      }
    }
  ])

  const srcFiles = [
    "background",
    "contents",
    "pages",
    "popup",
    "manifest.ts",
    "manifest.js"
  ]

  tasks.add({
    title: "Copying project files",
    task: async () => {
      const templatePath = path.resolve(
        __dirname,
        `./_template/${isTs ? "typescript" : "javascript"}`
      )
      const files = await fs.readdir(templatePath)
      const manifestFile = isTs ? "manifest.ts" : "manifest.js"
      const srcDir = path.join(projectDir, "./src")
      files.forEach(async (file) => {
        let destFile = file
        if (file === "gitignore") destFile = ".gitignore" // TODO to be fixed
        const filePath = path.join(templatePath, file)
        const destPath =
          srcFolder && srcFiles.includes(file)
            ? path.join(srcDir, destFile)
            : path.join(projectDir, destFile)
        if (file === "package.json" || file === manifestFile) {
          const isManifest = file === manifestFile
          let fileContent = await fs.readFile(filePath, "utf-8")
          if (isManifest && srcFolder)
            fileContent = fileContent.replace(
              '"./package.json"',
              '"../package.json"'
            )
          await fs.writeFile(
            destPath,
            fileContent.replace(
              /{{app-name}}/gi,
              isManifest ? projectName.name : projectName.kebab
            ),
            "utf-8"
          )
        } else await fs.cp(filePath, destPath, { recursive: true })
      })
    }
  })

  tasks.add({
    title: "Installing dependencies",
    task: async () => {
      await pkgInstall({
        deps: {
          typescript: undefined,
          react: "^18",
          "react-dom": "^18",
          xtensio: undefined
        },
        devDeps: {
          "@types/react": "~18",
          "@types/react-dom": "~18",
          "@types/chrome": undefined
        },
        cwd: projectDir,
        pkgManager
      })
    }
  })

  tasks.add({
    title: "Initializing git",
    task: async () => {
      await execute("git init", projectDir)
    }
  })

  tasks
    .run()
    .catch(console.error)
    .then(() => {
      console.log(`
Successfully generated! 🔥🔥🔥
${chalk.blue.bold("Available commands:")}
    ${chalk.underline(pkgManager === "yarn" ? "yarn dev" : "npm run dev")}
      starts the development server and injects extension.

    ${chalk.underline(pkgManager === "yarn" ? "yarn build" : "npm run build")}
      builds for production into the /zips directory.

${chalk.blue.bold("You can begin by:")}
    cd ${chalk.green(projectName.kebab)}
    ${pkgManager === "yarn" ? "yarn dev" : "npm run dev"}
`)
      process.exit()
    })
}
