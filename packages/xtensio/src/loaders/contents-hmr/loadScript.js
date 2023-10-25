const MESSAGE_KEY = "XTENSIO_CONTENTS_HMR"
const DEBUG = __resourceQuery.includes("debug=true")

const handleMessage = (request, sender, sendResponse) => {
  if (request.type !== MESSAGE_KEY) return

  const { file } = request.payload

  if (chrome.runtime.getManifest().manifest_version === 2) {
    chrome.tabs.executeScript(sender.tab.id, { file })
  } else {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      injectImmediately: true,
      files: [file]
    })
  }

  return true
}

chrome.runtime.onMessage.addListener(handleMessage)
