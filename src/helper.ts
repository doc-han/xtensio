import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path"
import { TemplateVariables } from "./types";
import Handlebars from "handlebars";

type ContentConfig = {
    content: string;
}
type TemplateConfig = {
    path: string,
  variables: TemplateVariables 
}

type Config = ContentConfig | TemplateConfig;

export function genFile(dest: string, config: ContentConfig): void;
export function genFile(dest: string, config: TemplateConfig): void;
export function genFile(dest: string, config: Config){
  const directories = path.dirname(dest);
  mkdirSync(directories, {recursive: true});
  let outputContent;
  if("content" in config){
    outputContent = config.content;
  }else {
    const rawTemplate = readFileSync(config.path, "utf8").toString();
    const template = Handlebars.compile(rawTemplate);
    const generatedContent = template(config.variables);
    outputContent = generatedContent;
  }
  writeFileSync(dest, outputContent);
}