import { mkdirSync, writeFileSync } from "fs";
import path from "path"

type ContentConfig = {
    content: string;
}
type TemplateConfig = {
    path: string,
    variables: Record<string, any>
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
    // TODO generate template and write out put to location
    const genCode = "#generate with handlebar";
    outputContent = genCode;
  }
  writeFileSync(dest, outputContent);
}
