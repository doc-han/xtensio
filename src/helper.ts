import fs from "fs";
import path from "path";
import { TemplateVariables } from "./types";
import Handlebars from "handlebars";
import ts from "typescript";

type ContentConfig = {
  content: string;
};
type TemplateConfig = {
  path: string;
  variables: TemplateVariables;
};

type Config = ContentConfig | TemplateConfig;

export function genFile(dest: string, config: ContentConfig): string;
export function genFile(dest: string, config: TemplateConfig): string;
export function genFile(dest: string, config: Config): string {
  const directories = path.dirname(dest);
  fs.mkdirSync(directories, { recursive: true });
  let outputContent;
  if ("content" in config) {
    outputContent = config.content;
  } else {
    const rawTemplate = fs.readFileSync(config.path, "utf8").toString();
    const template = Handlebars.compile(rawTemplate);
    const generatedContent = template(config.variables);
    outputContent = generatedContent;
  }
  fs.writeFileSync(dest, outputContent);
  return dest;
}

export function fileExists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

// TODO optimize this function
// it's currently heavy as it visits all the nodes
// we want to exit the loop as soon as we've found name
// Idea 1 - Easy fix(use regex): export\s+default\s+(?:function\s+)?(\w+)
export function findDefaultExportName(sourceCode: string): string | undefined {
  const sourceFile = ts.createSourceFile(
    "module.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  let name: string | undefined;

  function visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ExportAssignment) {
      // @ts-ignore - not all nodes have an expression
      const expr = node.expression;
      if (ts.isIdentifier(expr)) name = expr.text;
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  return name;
}
