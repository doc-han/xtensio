import path from "path"
import webpack from "webpack"
import { fileExists, findDefaultExportName, genFile } from "../helper";
import { exec } from "node:child_process"
import { tmpdir } from "os";
import WebpackExtensionManifestPlugin from "webpack-extension-manifest-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"
import { readFileSync } from "fs";
// TODO we need to generate manifest.json based on the entry data!
// check if popup exists
// check if background exists
// we need a build step for the manifest.ts
// 1. build ts to js 
// 2. use ts as base for extension-webpack plugin 
function execute(cmd: string){
  return new Promise<void>((resolve, reject)=> {
    exec(cmd, {}, (error, stdout, stderr)=> {
      if(error) reject(error);
      resolve();
    })
  })
}

async function compileManifestTS(mPath: string){
  await execute(`yarn tsc ${mPath} --outDir ${tmpdir()}`); 
  return path.join(tmpdir(), path.basename(mPath).replace(".ts", ".js"));
}

const getPopupExt = (popupContent: string) => {
  const defaultName = findDefaultExportName(popupContent);
  if(!defaultName) throw new Error("Can't find default export for Popup entry");
  return `
import React from "react";
import { createRoot } from "react-dom/client";

${popupContent}

let rootContainer = document.getElementById("popup");
if (!rootContainer) {
  rootContainer = document.createElement("div");
  rootContainer.id = "popup";
  document.body.append(rootContainer);
}
const root = createRoot(rootContainer);
root.render(<${defaultName}/>)`
}

export const getXtensioWebpackConfig = async (cwd: string) => {
  const xtensioDir = (filename: string) => path.join(cwd, "./.xtensio/");
  const xtensioTmpdir = (filename: string) => path.join(cwd, "./.xtensio/tmpdir/", filename);

  const popup = path.join(cwd, "./popup/popup.tsx"); 
  const isPopup = fileExists(popup);
  const background = path.join(cwd, "./background/index.ts");
  const isBackground = fileExists(background);
  const manifest = path.join(cwd, "./manifest.ts");

  const baseManifest = await compileManifestTS(manifest);
  const importObj = await import(baseManifest);
  const manifestObj = importObj?.default || importObj;

  const popupManifest = isPopup ? {action: {default_popup: "popup.html"}} : {};
  const backgroudManifest = isBackground ? {background: {service_worker: "background.js"}} : {};

  // TODO update popup before use in entry. 
  // inject more code that mounts it to the UI.
  const popupContent = readFileSync(popup, "utf8");
  const generatedPopup = await genFile(xtensioTmpdir("popup.tsx"), {content: getPopupExt(popupContent) });
  return {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
      ...(isPopup ? { popup: generatedPopup } : {}),
      ...(isBackground ? { background } : {}),
      // TODO go through everything in pages folder.
      // get the default export supposed to be a react component
      // inject code that create the react mount and renders the component
      // now use new file for webpack here!
      // TODO go through everything in contentscripts folder
      // build a map of filenames and matches rules
      // use this map to generate manifest file!
    },
    output: {
      path: path.join(cwd, './.xtensio/dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: "/node_modules/",
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env", 
                "@babel/preset-react",
                "@babel/preset-typescript"
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new WebpackExtensionManifestPlugin({
        config: {
          base: {
            ...manifestObj,
            ...popupManifest,
            ...backgroudManifest
          },
        },
        pkgJsonProps: [
          'version'
        ]
      }),
      new HtmlWebpackPlugin({
        chunks: ["popup"],
        filename: "popup.html"
      })
    ]
  } as webpack.Configuration;
}

