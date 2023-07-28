import { rmSync } from "fs";
import fs from "fs/promises";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";
import WebpackExtensionManifestPlugin from "webpack-extension-manifest-plugin";
import { ContentConfig } from "../../types/lib";
import { directoryExists, execute, fileExists } from "../helper";
import "./environment";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

// TODO add a loader for the background page. 
// on install or refresh, check all open tabs using contentConfig and inject corresponding content
// TODO remove all extension code from tabs when extension is removed.


const getTmpDir = (cwd: string) => {
  return path.join(cwd, "./.xtensio/tmp");
};

async function compileManifestTS(mPath: string, cwd: string) {
  await execute(
    `yarn tsc ${mPath} --outDir ${getTmpDir(
      cwd
    )} --resolveJsonModule --esModuleInterop --jsx react --allowUmdGlobalAccess`
  );
  const relPath = path.relative(cwd, mPath);
  const extName = path.extname(mPath);
  const possiblePaths = [
    path.join(getTmpDir(cwd), path.basename(mPath).replace(extName, ".js")),
    path.join(getTmpDir(cwd), relPath.replace(extName, ".js")),
  ];
  const activePath = possiblePaths.find((p) => fileExists(p));
  return activePath as string;
}

function clearTmpDir(cwd: string) {
  // clear tmpdir if it exists
  if (directoryExists(getTmpDir(cwd)))
    rmSync(getTmpDir(cwd), { force: true, recursive: true });
}

export const getXtensioWebpackConfig = async (cwd: string, dev: boolean = true) => {
  const applicationJson = await import(path.join(cwd, "./package.json"));
  const appName = applicationJson.name as string;
  clearTmpDir(cwd);
  const popup = path.join(cwd, "./popup/popup.tsx");
  const isPopup = fileExists(popup);
  const background = path.join(cwd, "./background/index.ts");
  const isBackground = fileExists(background);
  const manifest = path.join(cwd, "./manifest.ts");

  const baseManifest = await compileManifestTS(manifest, cwd);
  const importObj = await import(baseManifest);
  const manifestObj: chrome.runtime.Manifest = {
    ...(importObj?.default || importObj),
    web_accessible_resources: [
      // TODO let the matches here match what is coming from contentscripts
      {resources: ["*"], matches: ["<all_urls>"]}
    ]
  }

  const popupManifest = isPopup
    ? { action: { default_popup: "popup.html" } }
    : {};
  const backgroudManifest = isBackground
    ? { background: { service_worker: "background.js" } }
    : {};

  const reactMountLoader = path.resolve(
    __dirname,
    "../loaders/reactMountLoader.js"
  );
  const importReactLoader = path.resolve(
    __dirname,
    "../loaders/importReactLoader.js"
  );
  const babelLoader = {
    loader: "babel-loader",
    options: {
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
    },
  };

  const contentsDir = path.join(cwd, "./contents");
  const isContents = directoryExists(contentsDir);

  const contentFiles = isContents
    ? (await fs.readdir(path.join(cwd, "./contents"))).filter(f=> {
      const ext = path.extname(f);
      return ext === ".ts" || ext === ".tsx" || ext === ".js";
    })
    : [];
  const contentFilesAndExt = await Promise.all(
    contentFiles.map(async (file) => {
      const contentLoc = path.join(contentsDir, file);
      const compiled = await compileManifestTS(contentLoc, cwd);
      const codeImport = await import(compiled);
      // TODO get name of what's in component [function, class]
      const defaultExport = codeImport?.default || codeImport || {};
      const config: ContentConfig = {
        matches: defaultExport.matches,
        shadowRoot: defaultExport.shadowRoot,
        component: defaultExport.component?.name || defaultExport.component,
      };
      const ext = path.extname(file);
      return {
        filename: path.basename(file, ext),
        ext,
        config,
      };
    })
  );

  const configMap = new Map<string, ContentConfig>();
  contentFilesAndExt.forEach((op) => {
    configMap.set(`${op.filename}${op.ext}`, op.config);
  });

  const contentNamesAndPaths = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .map((file) => ({
      [file.filename]: path.join(cwd, `./contents/${file.filename}${file.ext}`),
    }));
  const contentsEntry = Object.assign({}, ...contentNamesAndPaths) as Record<
    string,
    string
  >;

  const contentsManifest = contentFilesAndExt
    .filter((file) => !!file.config.matches?.length)
    .map((file) => ({
      matches: file.config.matches,
      js: [file.filename + ".js"],
    }));

  clearTmpDir(cwd);
  return {
    mode: dev ? "development" : "production",
    devtool: dev ? "inline-source-map" : undefined,
    watch: dev ? true : false,
    entry: {
      ...(isPopup ? { popup } : {}),
      ...(isBackground ? { background } : {}),
      // TODO go through everything in pages folder.
      // get the default export supposed to be a react component
      // inject code that create the react mount and renders the component
      // now use new file for webpack here!
      ...contentsEntry,
    },
    output: {
      path: path.join(cwd, `./.xtensio/${dev ? "dev" : "build"}`),
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg|pdf)$/i,
          use: [{
            loader: "file-loader",
            options: {
              name: "[contenthash].[ext]",
              publicPath: "/"
            }
          }]
        },
        {
          test: new RegExp(path.basename(popup)),
          exclude: "/node_modules/",
          use: [
            babelLoader,
            {
              loader: reactMountLoader,
              options: {
                appName,
              },
            },
          ],
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
                appName,
              },
            },
          ],
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: "/node_modules/",
          use: babelLoader,
        },
        {
          test: /\.(css|scss|sass)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: true
              }
            },
            "sass-loader",
          ],
        },
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: "styles",
            type: "css/mini-extract",
            chunks: "all",
            enforce: true,
          },
        },
      },
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    plugins: [
      new WebpackExtensionManifestPlugin({
        config: {
          base: {
            ...manifestObj,
            ...popupManifest,
            ...backgroudManifest,
            content_scripts: contentsManifest,
          },
        },
      }),
      new HtmlWebpackPlugin({
        chunks: ["popup"],
        filename: "popup.html",
      }),
      new MiniCssExtractPlugin({
        filename: `${appName}-styles.css`,
      })
    ],
  } as webpack.Configuration;
};
