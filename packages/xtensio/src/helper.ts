import fs from "fs"
import Handlebars from "handlebars"
import path from "path"
import ts from "typescript"
import { TemplateVariables } from "../types"
import kebabCase from "lodash/kebabCase"
import camelCase from "lodash/camelCase"
import upperFirst from "lodash/upperFirst"
import { exec } from "node:child_process"

type GenContentConfig = {
  content: string
}
type TemplateConfig = {
  path: string
  variables: TemplateVariables | Record<string, string>
}

type Config = GenContentConfig | TemplateConfig

export function genFile(dest: string, config: GenContentConfig): string
export function genFile(dest: string, config: TemplateConfig): string
export function genFile(dest: string, config: Config): string {
  const directories = path.dirname(dest)
  fs.mkdirSync(directories, { recursive: true })
  let outputContent
  if ("content" in config) {
    outputContent = config.content
  } else {
    const rawTemplate = fs.readFileSync(config.path, "utf8").toString()
    const template = Handlebars.compile(rawTemplate)
    const generatedContent = template(config.variables)
    outputContent = generatedContent
  }
  fs.writeFileSync(dest, outputContent)
  return dest
}

export function fileExists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

export function directoryExists(dirPath: string) {
  return fileExists(dirPath)
}

// deal with syntax [export {smth as default}]
export function findDefaultExportName(sourceCode: string): string | undefined {
  const m = sourceCode.match(/export\s+default\s+(?:function\s+)?(\w+)/)
  if (m && m[1]) return m[1]
  const sourceFile = ts.createSourceFile(
    "module.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  )

  let name: string | undefined

  function visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ExportAssignment) {
      // @ts-ignore - not all nodes have an expression
      const expr = node.expression
      if (ts.isIdentifier(expr)) name = expr.text
    }

    ts.forEachChild(node, visitNode)
  }

  visitNode(sourceFile)

  return name
}

export const nameHelper = (str: string) => {
  const strippedStr = str.replace(/[^a-z0-9\-\_]/g, "")
  const kebab = kebabCase(strippedStr)
  const camel = camelCase(kebab)
  const pascal = upperFirst(camel)
  return {
    kebab,
    camel,
    pascal
  }
}

export function execute(cmd: string) {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, {}, (error, stdout, stderr) => {
      if (error) reject(error)
      resolve()
    })
  })
}

export function getLoader(loader: string) {
  const extname = path.extname(loader)
  return path.resolve(__dirname, `./loaders/${loader.replace(extname, "")}.js`)
}

export function validateMatches(matches: any) {
  return (
    typeof matches === "string" ||
    (typeof matches === "object" &&
      Array.isArray(matches) &&
      matches.length > 0 &&
      matches.reduce((a, b) => a && typeof b === "string", true))
  )
}

export function validateGetConfig(getConfig: any) {
  return typeof getConfig === "function"
}
