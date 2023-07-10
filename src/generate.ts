import { mkdirSync, writeFileSync } from "fs";
import { GenerateValues } from "./types";
import path from "path";
import { genFile } from "./helper";

export default function generateCommand(cwd: string, value: GenerateValues){
  switch(value){
    case "popup": 
      // check if popup directory exists before updating.
      const popupPath = path.join(cwd, "./popup/popup.tsx");
      genFile(popupPath, {path: path.resolve(__dirname, "./template/popup/popup.tsx.hbs"), variables: {}});
      return;
    case "page":
      return;
    case "contentscript":
      return;
    case "background":
      const backgroundPath = path.join(cwd, "./background/index.ts");
      genFile(backgroundPath, {path: path.resolve(__dirname, "./template/background/index.ts.hbs"), variables: {}});
      return;
    default:
      throw Error(`Command ${value} was not found!`);
  }
}