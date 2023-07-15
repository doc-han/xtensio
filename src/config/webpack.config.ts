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
  await execute(`yarn tsc ${mPath} --outDir ${tmpdir()} --resolveJsonModule --esModuleInterop`); 
  return path.join(tmpdir(), path.basename(mPath).replace(".ts", ".js"));
}

export const getXtensioWebpackConfig = async (cwd: string) => {
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

  const reactMountLoader = path.resolve(__dirname, "../loaders/reactMountLoader.js");
  const babelLoader = {
    loader: "babel-loader",
    options: {
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript"
      ]
    }
  }
  return {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
      ...(isPopup ? { popup } : {}),
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
          test: new RegExp(path.basename(popup)),
          use: [
            babelLoader,
            {
              loader: reactMountLoader,
            }
          ] 
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: "/node_modules/",
          use: babelLoader 
        },
        {
          test: /\.(css|scss|sass)$/,
          use: [
            "style-loader",
            "css-loader",
            "sass-loader"
          ]
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
          }
        },
      }),
      new HtmlWebpackPlugin({
        chunks: ["popup"],
        filename: "popup.html"
      })
    ]
  } as webpack.Configuration;
}

