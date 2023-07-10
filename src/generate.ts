import { mkdirSync, writeFileSync } from "fs";
import { GenerateValues } from "./types";
import path from "path";
import { genFile } from "./helper";

export default function generateCommand(cwd: string, value: GenerateValues){
  switch(value){
    case "popup": 
      // check if popup directory exists before updating.
      const popupPath = path.join(cwd, "./popup/popup.tsx");
      genFile(popupPath, {content: "// generated - popup.tsx"});
      return;
    case "page":
      return;
    case "contentscript":
      return;
    case "background":
      const backgroundPath = path.join(cwd, "./background/index.ts");
      genFile(backgroundPath, {content: "// generated - background.ts"});
      return;
    default:
      throw Error(`Command ${value} was not found!`);
  }
}
