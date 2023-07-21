import path from "path";
import { LoaderContext } from "webpack";
import { ContentConfig } from "../../types";

interface Options {
  configMap: Map<string, ContentConfig>;
  appName: string;
}

export default function importReactLoader(
  this: LoaderContext<Options>,
  source: string
) {
  const resourcePath = this.resourcePath;
  const resourceFilename = path.basename(resourcePath);
  const options = this.getOptions();
  const appName = options.appName || "xtensio-app";
  if (!(options.configMap instanceof Map))
    throw new Error("importReactLoader requires options.contents to be a map");

  const contentConfig = options.configMap.get(resourceFilename);
  if (contentConfig?.component) {
    const shadowRoot = contentConfig.shadowRoot;
    if (shadowRoot)
      return `
import { createRoot as __createRoot } from "react-dom/client";
${source}
const __appRoot = document.createElement("div");
const __appHost = document.createElement("${appName}");
document.querySelector("html").append(__appHost);
__appHost.attachShadow({ mode: "open" }).appendChild(__appRoot);
const __root = __createRoot(__appRoot);
__root.render(<${contentConfig.component}/>);
 `;
    else
      return `
 import { createRoot as __createRoot } from "react-dom/client";
 ${source}
 const __appHost = document.createElement("${appName}");
 const __appRoot = document.createElement("div");
 __appHost.append(__appRoot);
 document.querySelector("html").append(__appHost);
 const __root = __createRoot(__appRoot);
 __root.render(<${contentConfig.component}/>);
     `;
  } else return source;
}
