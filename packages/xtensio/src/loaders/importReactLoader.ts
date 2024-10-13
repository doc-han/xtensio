import path from "path"
import { LoaderContext } from "webpack"
import { ContentConfig } from "../../types/lib"

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
// Extension styles here!
const getLinkTag = () => {
  const __styleLink = chrome.runtime.getURL("${appName}-styles.css");
  const __linkTag = document.createElement("link");
  __linkTag.rel = "stylesheet";
  __linkTag.href = __styleLink;
  return __linkTag;
}

const __mObserver = new MutationObserver((mutationsList, observer)=> {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      if(mutation.target?.parentElement?.tagName === "HTML" && !document.querySelector("${appName}")) __mount();
      mutation.addedNodes.forEach((node) => {
        if (/(${appName}-mount)/i.test(node.nodeName)) {
          const shadowEl = node.querySelector("[shadow-root='${appName}-mount']");
          if(!shadowEl) return;
          shadowEl.shadowRoot.prepend(getLinkTag());
        }
      });
    }
  }
});
__mObserver.observe(document.querySelector("html") || document.body, {childList: true, subtree: true });

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
  __appShadowRoot.attachShadow({ mode: "open" }).append(getLinkTag(), __appRoot);
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
