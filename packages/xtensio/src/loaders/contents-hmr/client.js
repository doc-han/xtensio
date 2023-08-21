if (typeof __webpack_public_path__ !== "undefined") {
  __webpack_public_path__ = chrome.runtime.getURL("")
}

if (typeof __webpack_require__ !== "undefined") {
  const inProgress = {}
  const loaded = {}
  __webpack_require__.l = (url, done, key, chunkId) => {
    if (inProgress[url]) {
      inProgress[url].push(done)
      return
    }

    inProgress[url] = [done]

    if (loaded[url]) return

    const onLoadComplete = (event) => {
      clearTimeout(timeout)
      const fns = inProgress[url]
      delete inProgress[url]
      // TODO: the line below makes HMR break.
      // fns && fns.forEach(fn=> fn(event));
    }
    var timeout = setTimeout(
      () => onLoadComplete({ type: "timeout", target: { src: url } }),
      120000
    )
    chrome.runtime.sendMessage(
      {
        type: "CONTENT_HMR_MODULE_LOAD",
        url
      },
      (data) => {
        loaded[url] = true
        if (data.done) onLoadComplete({ type: "load", target: { src: url } })
        else onLoadComplete({ type: "error", target: { src: url } })
      }
    )
  }
}
