import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import dotenv from "dotenv"
import { readFileSync, rmSync } from "fs"
import fs from "fs/promises"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import path from "path"
import webpack from "webpack"
import { ContentConfig } from "../../types/lib"
import {
  directoryExists,
  fileExists,
  getLoader,
  validateMatches
} from "../helper"
import ManifestGenPlugin from "../plugins/ManifestGenPlugin"
import { ProjectPaths } from "./projectPaths"
import sandboxExec from "../sandbox/helper"
import ExtensionContentsHMRPlugin from "../loaders/contents-hmr/ExtensionContentsHMRPlugin"

// TODO add a loader for the background page.
// on install or refresh, check all open tabs using contentConfig and inject corresponding content
// TODO remove all extension code from tabs when extension is removed.

const acceptedJsFilesRE = /\.(js|jsx|ts|tsx)$/i

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

const getEntry = (devPaths: string[], entryPath: string[], dev?: DevConfig) => {
  return [...(dev ? devPaths : []), ...entryPath].filter(Boolean)
}

interface DevConfig {
  port: number
}

export const getXtensioWebpackConfig = async (
  mPaths: ProjectPaths,
  dev?: DevConfig
) => {
  const isDev = !!dev
  // cleaning tmpDirs
  rmSync(mPaths.tmpDir, { force: true, recursive: true })

  const isNpm = fileExists(mPaths.npmLock)
  const useTailwind = fileExists(mPaths.tailwindPath)
  const envObject = getEnvObject(mPaths.projectDirectory, isDev)
  const applicationJson = await import(mPaths.packageJSON)
  const appName = (applicationJson.xtensio?.name ||
    applicationJson.name) as string
  const isPopup = fileExists(mPaths.popup)
  const isBackground = fileExists(mPaths.background)

  const contentSecurity = isDev
    ? {
        content_security_policy: {
          extension_pages: `script-src 'self'; object-src 'self'; script-src-elem 'self' 'unsafe-inline' http://localhost:${dev.port}/`
        }
      }
    : {}
  const isContents = directoryExists(mPaths.contentsFolder)

  const contentFiles = isContents
    ? (await fs.readdir(mPaths.contentsFolder)).filter((f) =>
        acceptedJsFilesRE.test(f)
      )
    : []
  const contentFilesAndExt = await Promise.all(
    contentFiles.map(async (file) => {
      const ext = path.extname(file)
      const filename = path.basename(file, ext)
      const contentLoc = path.join(mPaths.contentsFolder, file)
      const {
        getConfig,
        name,
        default: isLikelyReact
      } = await sandboxExec.ts(
        contentLoc,
        mPaths.projectDirectory,
        mPaths.tmpDir,
        isNpm,
        {
          getConfig: "getConfig.()",
          name: "default.name",
          default: "default.rx()"
        }
      )
      if (getConfig) {
        if (getConfig && validateMatches(getConfig.matches)) {
          const config: ContentConfig = {
            matches: getConfig.matches,
            shadowRoot:
              (getConfig.shadowRoot ?? true) || !!getConfig.shadowRoot,
            component: isLikelyReact && name
          }
          return {
            filename,
            ext,
            config
          }
        } else {
          throw new Error(
            `[MATCHES_TYPE_ERROR]: The returned property matches from getConfig should be a string or an array of string. Error in ${file}`
          )
        }
      } else {
        throw new Error(
          `[GET_CONFIG_REQUIRED]: The required function getConfig wasn't exported in ${file}.`
        )
      }
    })
  )

  const contentsMatches = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .flatMap((file) => file.config.matches?.map((item) => item))

  const devManifest = isDev
    ? {
        web_accessible_resources: [
          { resources: ["*"], matches: ["<all_urls>"] }
        ],
        permissions: ["scripting"],
        host_permissions: ["<all_urls>"]
      }
    : {
        //production:
        //since all css files are merged into 1 big ass file, we will always add it
        // fetch the matches from contents scripts
        web_accessible_resources: [
          {
            resources: [`${appName}-styles.css`],
            matches: contentsMatches
          }
        ]
      }

  const popupManifest = isPopup
    ? { action: { default_popup: "popup.html" } }
    : {}
  const backgroudManifest = isBackground
    ? { background: { service_worker: "background.js" } }
    : {}

  const babelLoader = {
    loader: "babel-loader",
    options: {
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript"
      ],
      plugins: dev && ["react-refresh/babel"]
    }
  }

  const cssLoaderWithTailwind = [
    MiniCssExtractPlugin.loader,
    {
      loader: "css-loader",
      options: {
        importLoaders: 2, // Ensures that postcss-loader and sass-loader are applied
        sourceMap: isDev // Enable source maps in development
      }
    },
    "postcss-loader",
    "sass-loader"
  ]

  const cssLoader = [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]

  const hotMiddlewareClient = `webpack-hot-middleware/client?path=http://localhost:${dev?.port}/__webpack_hmr`

  const configMap = new Map<string, ContentConfig>()
  contentFilesAndExt.forEach((op) => {
    configMap.set(`${op.filename}${op.ext}`, op.config)
  })

  const contentNamesAndPaths = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .map((file) => ({
      [file.filename]: getEntry(
        [hotMiddlewareClient],
        [path.join(mPaths.contentsFolder, `./${file.filename}${file.ext}`)],
        dev
      )
    }))
  const contentsEntry = Object.assign({}, ...contentNamesAndPaths) as Record<
    string,
    string
  >
  const contentsKeys = Object.keys(contentsEntry).join("|")

  const contentsManifest = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .map((file) => ({
      matches: file.config.matches,
      js: [file.filename + ".js"]
    }))

  const isPages = directoryExists(mPaths.pagesFolder)
  const pageFiles = isPages
    ? (await fs.readdir(mPaths.pagesFolder)).filter((f) =>
        acceptedJsFilesRE.test(f)
      )
    : []
  const pageFilesAndExt = pageFiles.map((file) => {
    const ext = path.extname(file)
    return {
      filename: path.basename(file, ext),
      ext
    }
  })
  const pageNamesAndPaths = pageFilesAndExt.map((file) => {
    return {
      [file.filename]: {
        import: getEntry(
          [hotMiddlewareClient],
          [path.join(mPaths.pagesFolder, `./${file.filename}${file.ext}`)],
          dev
        ),
        filename: "pages/[name].js"
      }
    }
  })
  const pagesEntry = Object.assign({}, ...pageNamesAndPaths) as Record<
    string,
    string
  >

  const webpackMode = isDev ? "development" : "production"
  return {
    mode: webpackMode,
    devtool: isDev ? "inline-source-map" : undefined,
    watch: isDev,
    entry: {
      ...(isPopup
        ? { popup: getEntry([hotMiddlewareClient], [mPaths.popup], dev) }
        : {}),
      ...(isBackground
        ? {
            background: getEntry(
              [getLoader("/contents-hmr/loadScript.js")],
              [mPaths.background],
              dev
            )
          }
        : {}),
      ...contentsEntry,
      ...pagesEntry,
      manifest: mPaths.manifest
    },
    output: {
      path: isDev ? mPaths.devOutput : mPaths.prodOutput,
      filename: "[name].js",
      publicPath: isDev ? `http://localhost:${dev.port}/` : "/",
      library: {
        name: "xtensioExports",
        type: "var"
      }
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
          include: /\/popup\//,
          exclude: "/node_modules/",
          use: [
            babelLoader,
            {
              loader: getLoader("reactMountLoader"),
              options: {
                appName
              }
            }
          ]
        },
        {
          test: acceptedJsFilesRE,
          include: /\/pages\//,
          exclude: "/node_modules/",
          use: [
            babelLoader,
            {
              loader: getLoader("reactMountLoader"),
              options: {
                appName
              }
            }
          ]
        },
        {
          test: acceptedJsFilesRE,
          include: /\/contents\//,
          exclude: /node_modules/,
          use: [
            babelLoader,
            {
              loader: getLoader("importReactLoader"),
              options: {
                configMap,
                appName
              }
            }
          ]
        },
        {
          test: acceptedJsFilesRE,
          exclude: "/node_modules/",
          use: babelLoader
        },
        {
          test: /\.(css|scss|sass)$/,
          use: useTailwind ? cssLoaderWithTailwind : cssLoader
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
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@public": path.resolve(mPaths.publicPath)
      }
    },
    plugins: [
      isDev &&
        new ExtensionContentsHMRPlugin({ entry: new RegExp(contentsKeys) }),
      new ManifestGenPlugin({
        filename: path.basename(mPaths.manifest).replace(/\..+/, ".js"),
        outFilename: path.basename(mPaths.manifest).replace(/\..+/, ".json"),
        extend: {
          ...popupManifest,
          ...backgroudManifest,
          content_scripts: contentsManifest,
          ...contentSecurity,
          ...devManifest
        }
      }),
      isDev && new ReactRefreshPlugin(),
      isDev && new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        "process.env.XTENSIO_APPNAME": JSON.stringify(appName),
        "process.env.ENV": JSON.stringify(webpackMode),
        "process.env.NODE_ENV": JSON.stringify(webpackMode),
        ...envObject
      }),
      new HtmlWebpackPlugin({
        chunks: ["popup"],
        filename: "popup.html"
      }),
      ...pageFilesAndExt.map(
        (file) =>
          new HtmlWebpackPlugin({
            chunks: [file.filename],
            filename: `pages/${file.filename}.html`
          })
      ),
      new MiniCssExtractPlugin({
        filename: `${appName}-styles.css`
      })
    ].filter(Boolean)
  } as webpack.Configuration
}
