import * as inquirer from "@inquirer/prompts";
import { mkdirSync } from "fs";
import Listr from "listr";
import path from "path";
import { install } from "pkg-install";
import { genFile, nameHelper } from "xtensio";

enum ExtensionOptionsKey {
  Background,
  Contentscript,
  Popup,
  ExtensionPages,
}

// Contentscript create requires to steal the inquirer focus.
// This is reason why it's not here yet

export default async function createCommand(cwd: string, value?: string) {
  const projectName = nameHelper(
    value
      ? value
      : await inquirer.input({ message: "What's the name of your project?" })
  );
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

  const projectDir = path.join(cwd, projectName.kebab);
  const tasks = new Listr([
    {
      title: "Generating Project directory",
      task: () => {
        mkdirSync(projectDir, { recursive: true });
      },
    },
  ]);
  if (options.includes(ExtensionOptionsKey.Popup))
    tasks.add({
      title: "Generating popup files",
      task: () => {
        const popupPath = path.join(projectDir, "./popup/popup.tsx");
        genFile(popupPath, {
          path: path.resolve(__dirname, "./template/popup.tsx.hbs"),
          variables: {},
        });
      },
    });

  if (options.includes(ExtensionOptionsKey.Background))
    tasks.add({
      title: "Generating background file",
      task: () => {
        const backgroundPath = path.join(projectDir, "./background/index.ts");
        genFile(backgroundPath, {
          path: path.resolve(__dirname, "./template/background.ts.hbs"),
          variables: {},
        });
      },
    });

  tasks.add({
    title: "Generating manifest file",
    task: () =>
      genFile(path.join(projectDir, "manifest.ts"), {
        path: path.resolve(__dirname, "./template/manifest.ts.hbs"),
        variables: { "app-name": projectName.kebab },
      }),
  });

  tasks.add({
    title: "Installing dependencies",
    task: async () => {
      genFile(path.join(projectDir, "package.json"), {
        path: path.resolve(__dirname, "./template/package.json.hbs"),
        variables: { "app-name": projectName.kebab },
      });

      genFile(path.join(projectDir, "tsconfig.json"), {
        path: path.resolve(__dirname, "./template/tsconfig.json.hbs"),
        variables: {},
      });

      genFile(path.join(projectDir, "index.d.ts"), {
        path: path.resolve(__dirname, "./template/index.d.ts.hbs"),
        variables: {},
      });

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

  tasks.run().catch((err) => {
    console.error(err);
  });
}
