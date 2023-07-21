import { LoaderContext } from "webpack";
import { findDefaultExportName } from "../helper";

interface Options {
  appName: string;
}

export default function injectReactLoader(
  this: LoaderContext<Options>,
  source: string
) {
  const defaultName = findDefaultExportName(source);
  const options = this.getOptions();
  const appName = options.appName || "xtensio-app";
  return `
import { createRoot as __createRoot } from "react-dom/client";
${source}
const __appHost = document.createElement("${appName}");
const __appRoot = document.createElement("div");
__appHost.append(__appRoot);
document.body.append(__appHost);
const __root = __createRoot(__appRoot);
__root.render(<${defaultName}/>)`;
}
