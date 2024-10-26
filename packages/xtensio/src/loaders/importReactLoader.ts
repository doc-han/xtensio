import path from "path"
import { LoaderContext } from "webpack"
import { ContentConfig } from "../../types/lib"
import { __getLinkTag } from "./functions"

interface Options {
  configMap: Map<string, ContentConfig>
  appName: string
}

export default function importReactLoader(
  this: LoaderContext<Options>,
  source: string
) {
  const resourcePath = this.resourcePath
  const resourceFilename = path.basename(resourcePath)
  const options = this.getOptions()
  const appName = options.appName
  if (!(options.configMap instanceof Map))
    throw new Error("importReactLoader requires options.contents to be a map")

  const contentConfig = options.configMap.get(resourceFilename)
  if (contentConfig?.component) {
    const shadowRoot = contentConfig.shadowRoot
    if (shadowRoot)
      return `
import { createRoot as __createRoot } from "react-dom/client";
${source}
${__getLinkTag.toString()}
const __mObserver = new MutationObserver((mutationsList, observer)=> {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && Array.from(mutation.removedNodes).some(node=> node.tagName === "HTML") && !document.querySelector("${appName}"))
      __mount()
  }
});
__mObserver.observe(document.documentElement.parentNode, {childList: true });

function __mount(){
  console.log("xtensio: mounting...");
  let el;
  if(el = document.querySelector("${appName}")) el.remove();
  const __appHost = document.createElement("${appName}");
  const __appRoot = document.createElement("div");
  const __appShadowRoot = document.createElement("div");
  __appShadowRoot.setAttribute("shadow-root", "${appName}");
  __appHost.append(__appShadowRoot);
  document.querySelector("html").append(__appHost);
  __appShadowRoot.attachShadow({ mode: "open" }).append(__getLinkTag("${appName}"), __appRoot);
  const __root = __createRoot(__appRoot);
  __root.render(<${contentConfig.component}/>);
}
__mount();
if(module.hot){
  module.hot.accept(()=> {
    __mount();
  })
}
 `
    else
      return `
 import { createRoot as __createRoot } from "react-dom/client";
 ${source}
 function __mount(){
  console.log("xtensio: mounting...");
  let el;
  if(el = document.querySelector("${appName}")) el.remove();
   const __appHost = document.createElement("${appName}");
   const __appRoot = document.createElement("div");
   __appHost.append(__appRoot);
   document.querySelector("html").append(__appHost);
   const __root = __createRoot(__appRoot);
   __root.render(<${contentConfig.component}/>);
 }
 __mount();
 if(module.hot){
  module.hot.accept(()=> {
    __mount();
  })
}
     `
  } else return source
}
