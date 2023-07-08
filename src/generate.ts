import { GenerateValues } from "./types";

export default function generateCommand(cwd: string, value: GenerateValues){
  switch(value){
    case "popup": 
      // check if popup directory exists before updating.
      console.log(cwd);
      return;
    case "page":
      return;
    case "contentscript":
      return;
    default:
      throw Error(`Command ${value} was not found!`);
  }
}
