import * as inquirer from "@inquirer/prompts";
import createCommand from "./create";
import generateCommand from "./generate";
import { Commands, CreateValues, GenerateValues } from "./types";

export async function xtensioCLI<T extends Commands>(
  binaryPath: string, 
  cwd: string, 
  command: T, 
  value: GenerateValues | CreateValues 
) {
  switch(command){
    case "create": 
      createCommand(cwd, value as CreateValues);
      return;
    case "generate":
      generateCommand(cwd, value as GenerateValues);
      return;
    default:
      throw Error(`Command ${command} was not found!`);
  }
}
