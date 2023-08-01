import { ReactElement } from "react"
import { createRoot } from "react-dom/client"
import { domSelector } from "./domSelector"

interface MountConfig {
  insertType?: "append" | "prepend" | "after" | "before"
  // wait?: number;
}

const MOUNT_NAME = `${process.env.XTENSIO_APPNAME}-mount` // This env var should always be preset

// TODO - Hmmm loud idea
// mount should not only mount but also watch the mountPoint using MutationObserver
// when it changes or when is lost and back, mount our component again!
export async function mount(
  component: ReactElement,
  insert: (() => Element | Promise<Element>) | Element | string,
  config: MountConfig = { insertType: "after" }
) {
  const { insertType } = config
  let mountContainer: Element = document.createElement(MOUNT_NAME)
  let mountShadowContainer = document.createElement("div")
  mountShadowContainer.setAttribute("shadow-root", MOUNT_NAME)
  let mountShadowRoot = mountShadowContainer.attachShadow({ mode: "open" })
  let mountRoot = document.createElement("div")

  mountContainer.append(mountShadowContainer)
  mountShadowRoot.append(mountRoot)
  let mountPoint: Element | null
  if (typeof insert === "function" || typeof insert === "string")
    mountPoint = await domSelector(insert)
  else mountPoint = insert
  if (!mountPoint) return // TODO maybe throw an error here!
  if (insertType === "append") {
    mountPoint.append(mountContainer)
  } else if (insertType === "prepend") {
    mountPoint.prepend(mountContainer)
  } else if (insertType === "after") {
    mountPoint.after(mountContainer)
  } else if (insertType === "before") {
    mountPoint.before(mountContainer)
  }
  const root = createRoot(mountRoot)
  root.render(component)
}
