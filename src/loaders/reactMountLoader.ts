import { findDefaultExportName } from "../helper"

export default function injectReactLoader(source: string){
  const defaultName = findDefaultExportName(source);
  return `
import React from "react";
import { createRoot } from "react-dom/client";

${source}

let rootContainer = document.getElementById("popup");
if (!rootContainer) {
  rootContainer = document.createElement("div");
  rootContainer.id = "popup";
  document.body.append(rootContainer);
}
const root = createRoot(rootContainer);
root.render(<${defaultName}/>)`
}
