import * as inquirer from "@inquirer/prompts"
import { CreateValues, ExtensionOptionsKey } from "./types";
import { mkdirSync } from "fs";
import path from "path";

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
          name: "Content Scripts",
          value: ExtensionOptionsKey.Contentscript,
        },
        {
          name: "Extension Pages",
          value: ExtensionOptionsKey.ExtensionPages,
        },
      ],
  });

  console.log(projectName, options)
  // Generate folder in the given location
  // mkdirSync(path.join(cwd, projectName))
  // Popup: copy popup code there
  // Contentscript: ask more questions
  // Extension Pages: ask more questions
}
