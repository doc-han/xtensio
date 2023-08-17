chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log(`Extension just got installed!`)
  }
})
