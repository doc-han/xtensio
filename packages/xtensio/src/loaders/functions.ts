export function __getLinkTag(appName: string) {
  const styleLink = chrome.runtime.getURL(`${appName}-styles.css`)
  const linkTag = document.createElement("link")
  linkTag.rel = "stylesheet"
  linkTag.href = styleLink
  return linkTag
}
