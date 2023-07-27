import { mkdirSync } from "fs";
import Listr from "listr";
import path from "path";
import { install } from "pkg-install";
import fs from "fs/promises";
import kebabCase from "lodash.kebabcase";
import camelCase from "lodash.camelcase";
import upperFirst from "lodash.upperfirst";
import readline from "readline/promises";
import { exec } from "node:child_process";

const readlineInstance = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// TODO remove unwanted filename characters
export const nameHelper = (str: string) => {
  const kebab = kebabCase(str);
  const camel = camelCase(kebab);
  const pascal = upperFirst(camel);
  return {
    name: str,
    kebab,
    camel,
    pascal,
  };
};

export default async function createCommand(cwd: string, value?: string) {
  const projectName = nameHelper(
    value
      ? value
      : await readlineInstance.question("What's the name of your project? ")
  );

  const projectDir = path.join(cwd, projectName.kebab);
  const tasks = new Listr([
    {
      title: "Generating Project directory",
      task: () => {
        mkdirSync(projectDir, { recursive: true });
      },
    },
  ]);

  tasks.add({
    title: "Copying project files",
    task: async () => {
      const templatePath = path.resolve(__dirname, "./_template");
      const files = await fs.readdir(templatePath);
      files.forEach(async (file) => {
        const filePath = path.join(templatePath, file);
        const destPath = path.join(projectDir, file);
        if (file === "package.json" || file === "manifest.ts") {
          const isManifest = file === "manifest.ts";
          const fileContent = await fs.readFile(filePath, "utf-8");
          await fs.writeFile(
            path.join(projectDir, file),
            fileContent.replace("{{app-name}}", isManifest ? projectName.name : projectName.kebab),
            "utf-8"
          );
        } else await fs.cp(filePath, destPath, { recursive: true });
      });
    },
  });

  tasks.add({
    title: "Installing dependencies",
    task: async () => {
      await install(
        {
          typescript: undefined,
          react: "^18",
          "react-dom": "^18",
        },
        {
          prefer: "yarn",
          dev: false,
          cwd: projectDir,
        }
      );

      // DEV deps
      await install(
        {
          "@types/react": "~18",
          "@types/react-dom": "~18",
          "@types/chrome": undefined,
          xtensio: undefined,
        },
        {
          prefer: "yarn",
          dev: true,
          cwd: projectDir,
        }
      );
    },
  });

  tasks.add({
    title: "Initializing git",
    task: ()=>  new Promise<void>((resolve, reject)=> {
      exec("git init", { cwd: projectDir }, (error, stdout, stderr) => {
        if (error) reject(error);
        resolve();
      });
    }) 
  })

  tasks.run().catch((err) => {
    console.error(err);
  });
}
