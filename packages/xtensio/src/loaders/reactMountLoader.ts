import { findDefaultExportName } from "../helper";
import importReactLoader from "./importReactLoader";

export default function injectReactLoader(source: string) {
  const defaultName = findDefaultExportName(source);
  return `
import { createRoot } from "react-dom/client";
${importReactLoader(source)}
let rootContainer = document.getElementById("popup");
if (!rootContainer) {
  rootContainer = document.createElement("div");
  rootContainer.id = "popup";
  document.body.append(rootContainer);
}
const root = createRoot(rootContainer);
root.render(<${defaultName}/>)`;
}
