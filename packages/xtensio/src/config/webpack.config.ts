import { readFileSync, rmSync } from "fs"
import fs from "fs/promises"
import HtmlWebpackPlugin from "html-webpack-plugin"
import path from "path"
import webpack from "webpack"
import WebpackExtensionManifestPlugin from "webpack-extension-manifest-plugin"
import { ContentConfig } from "../../types/lib"
import { directoryExists, execute, fileExists } from "../helper"
import "./environment"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import dotenv from "dotenv"
import { ProjectPaths } from "./projectPaths"

// TODO add a loader for the background page.
// on install or refresh, check all open tabs using contentConfig and inject corresponding content
// TODO remove all extension code from tabs when extension is removed.

const getEnvObject = (cwd: string, dev: boolean) => {
  const envFiles = [
    ".env",
    ...(dev
      ? [".dev.env", ".development.env"]
      : [".prod.env", ".production.env"])
  ]
  const envObj = envFiles
    .map((file) => {
      const envPath = path.join(cwd, file)
      if (!fileExists(envPath)) return {}
      return dotenv.parse(readFileSync(envPath, "utf-8"))
    })
    .reduce((a, b) => ({ ...a, ...b }))

  return Object.keys(envObj).reduce(
    (prev, next) => {
      prev[`process.env.${next}`] = JSON.stringify(envObj[next])
      return prev
    },
    {} as Record<string, string>
  )
}

async function compileTSFile(
  filePath: string,
  projectDir: string,
  tmpDir: string
) {
  await execute(
    `yarn tsc ${filePath} --outDir ${tmpDir} --resolveJsonModule --esModuleInterop --jsx react --allowUmdGlobalAccess`
  )
  const relPath = path.relative(projectDir, filePath)
  const extName = path.extname(filePath)
  const possiblePaths = [
    path.join(tmpDir, path.basename(filePath).replace(extName, ".js")),
    path.join(tmpDir, relPath.replace(extName, ".js"))
  ]
  const activePath = possiblePaths.find((p) => fileExists(p))
  return activePath as string
}

export const getXtensioWebpackConfig = async (
  mPaths: ProjectPaths,
  dev: boolean = true
) => {
  // cleaning tmpDirs
  rmSync(mPaths.tmpDir, { force: true, recursive: true })

  const envObject = getEnvObject(mPaths.projectDirectory, dev)
  const applicationJson = await import(mPaths.packageJSON)
  const appName = (applicationJson.xtensio?.name ||
    applicationJson.name) as string
  const isPopup = fileExists(mPaths.popup)
  const isBackground = fileExists(mPaths.background)

  const baseManifest = await compileTSFile(
    mPaths.manifest,
    mPaths.projectDirectory,
    mPaths.tmpDir
  )
  const importObj = await import(baseManifest)
  const manifestObj: chrome.runtime.Manifest = {
    ...(importObj?.default || importObj),
    web_accessible_resources: [
      // TODO let the matches here match what is coming from contentscripts
      { resources: ["*"], matches: ["<all_urls>"] }
    ]
  }

  const popupManifest = isPopup
    ? { action: { default_popup: "popup.html" } }
    : {}
  const backgroudManifest = isBackground
    ? { background: { service_worker: "background.js" } }
    : {}

  const reactMountLoader = path.resolve(
    __dirname,
    "../loaders/reactMountLoader.js"
  )
  const importReactLoader = path.resolve(
    __dirname,
    "../loaders/importReactLoader.js"
  )
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

  const isContents = directoryExists(mPaths.contentsFolder)

  const contentFiles = isContents
    ? (await fs.readdir(mPaths.contentsFolder)).filter((f) => {
        const ext = path.extname(f)
        return ext === ".ts" || ext === ".tsx" || ext === ".js"
      })
    : []
  const contentFilesAndExt = await Promise.all(
    contentFiles.map(async (file) => {
      const contentLoc = path.join(mPaths.contentsFolder, file)
      const compiled = await compileTSFile(
        contentLoc,
        mPaths.projectDirectory,
        mPaths.tmpDir
      )
      const codeImport = await import(compiled)
      // TODO get name of what's in component [function, class]
      const defaultExport = codeImport?.default || codeImport || {}
      const config: ContentConfig = {
        matches: defaultExport.matches,
        shadowRoot: defaultExport.shadowRoot,
        component: defaultExport.component?.name || defaultExport.component
      }
      const ext = path.extname(file)
      return {
        filename: path.basename(file, ext),
        ext,
        config
      }
    })
  )

  const configMap = new Map<string, ContentConfig>()
  contentFilesAndExt.forEach((op) => {
    configMap.set(`${op.filename}${op.ext}`, op.config)
  })

  const contentNamesAndPaths = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .map((file) => ({
      [file.filename]: path.join(
        mPaths.contentsFolder,
        `./${file.filename}${file.ext}`
      )
    }))
  const contentsEntry = Object.assign({}, ...contentNamesAndPaths) as Record<
    string,
    string
  >

  const contentsManifest = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .map((file) => ({
      matches: file.config.matches,
      js: [file.filename + ".js"]
    }))

  const webpackMode = dev ? "development" : "production"
  return {
    mode: webpackMode,
    devtool: dev ? "inline-source-map" : undefined,
    watch: dev ? true : false,
    entry: {
      ...(isPopup ? { popup: mPaths.popup } : {}),
      ...(isBackground ? { background: mPaths.background } : {}),
      // TODO go through everything in pages folder.
      // get the default export supposed to be a react component
      // inject code that create the react mount and renders the component
      // now use new file for webpack here!
      ...contentsEntry
    },
    output: {
      clean: true,
      path: dev ? mPaths.devOutput : mPaths.prodOutput,
      filename: "[name].js"
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg|pdf)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[contenthash].[ext]",
                publicPath: "/"
              }
            }
          ]
        },
        {
          test: new RegExp(path.basename(mPaths.popup)),
          exclude: "/node_modules/",
          use: [
            babelLoader,
            {
              loader: reactMountLoader,
              options: {
                appName
              }
            }
          ]
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: /\/contents\//,
          exclude: /node_modules/,
          use: [
            babelLoader,
            {
              loader: importReactLoader,
              options: {
                configMap,
                appName
              }
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
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
        }
      ]
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: "styles",
            type: "css/mini-extract",
            chunks: "all",
            enforce: true
          }
        }
      }
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.XTENSIO_APPNAME": JSON.stringify(appName),
        "process.env.ENV": JSON.stringify(webpackMode),
        "process.env.NODE_ENV": JSON.stringify(webpackMode),
        ...envObject
      }),
      new WebpackExtensionManifestPlugin({
        config: {
          base: {
            ...manifestObj,
            ...popupManifest,
            ...backgroudManifest,
            content_scripts: contentsManifest
          }
        }
      }),
      new HtmlWebpackPlugin({
        chunks: ["popup"],
        filename: "popup.html"
      }),
      new MiniCssExtractPlugin({
        filename: `${appName}-styles.css`
      })
    ]
  } as webpack.Configuration
}
