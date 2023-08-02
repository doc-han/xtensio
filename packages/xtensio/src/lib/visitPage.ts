export const visitPage = (page: string) => {
  const url = chrome.runtime.getURL(`/pages/${page.replace(/\..+/, "")}.html`)
  if (chrome.tabs) chrome.tabs.create({ url })
  else if (window && window.open) window.open(url)
  // TODO throw an error here - unable to open url
  // also remember to check for existence of url before opening
}
