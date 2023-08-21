chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_HMR_MODULE_LOAD") {
    if (message.url) {
      const _url = new URL(message.url)
      const filename = _url.pathname
      chrome.scripting.executeScript({
        files: [filename],
        target: { tabId: sender.tab.id }
      })
      sendResponse({ done: true })
    } else sendResponse({ done: false })
  }
  return true
})
