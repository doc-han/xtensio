import * as inquirer from "@inquirer/prompts"
import { CreateValues, ExtensionOptionsKey } from "./types";
import { mkdirSync } from "fs";
import path from "path";
import generateCommand from "./generate";

export default async function createCommand(cwd: string, value?: CreateValues){
  // TODO 
  const projectName = value ? value : await inquirer.input({message: "What's the name of your project?"}); 
  const options = await inquirer.checkbox({
    message: "Extension options",
      choices: [
        {
          name: "Popup",
          value: ExtensionOptionsKey.Popup,
        },
        {
          name: "Background Script",
          value: ExtensionOptionsKey.Background,
        },
      ],
  });
  
  const projectDir = path.join(cwd, projectName);
  mkdirSync(projectDir, {recursive: true});
  if(options.includes(ExtensionOptionsKey.Popup)) generateCommand(projectDir, "popup"); 
  if(options.includes(ExtensionOptionsKey.Background)) generateCommand(projectDir, "background"); 
}
