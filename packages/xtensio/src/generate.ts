import { GenerateValues } from "../types";
import path from "path";
import { genFile, nameHelper } from "./helper";
import * as inquirer from "@inquirer/prompts";

export default async function generateCommand(
  cwd: string,
  value: GenerateValues
) {
  switch (value) {
    case "popup":
      const popupPath = path.join(cwd, "./popup/popup.tsx");
      genFile(popupPath, {
        path: path.resolve(__dirname, "./template/popup.tsx.hbs"),
        variables: {},
      });
      return;
    case "page":
      return;
    case "contents":
      // ask user for name of file
      const fileName = nameHelper(
        await inquirer.input({
          message: "What's the name of your content script?",
        })
      );
      const contentPath = path.join(cwd, `./contents/${fileName.kebab}.tsx`);
      genFile(contentPath, {
        path: path.resolve(__dirname, "./template/contents.tsx.hbs"),
        variables: { contentName: fileName.pascal },
      });
      return;
    case "background":
      const backgroundPath = path.join(cwd, "./background/index.ts");
      genFile(backgroundPath, {
        path: path.resolve(__dirname, "./template/background.ts.hbs"),
        variables: {},
      });
      return;
    default:
      throw Error(`Command ${value} was not found!`);
  }
}
