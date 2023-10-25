const MESSAGE_KEY = "XTENSIO_CONTENTS_HMR"
const RuntimeGlobals = require("webpack/lib/RuntimeGlobals")
const Template = require("webpack/lib/Template")
const HelperRuntimeModule = require("webpack/lib/runtime/HelperRuntimeModule")

class LoadScriptRuntimeModule extends HelperRuntimeModule {
  constructor() {
    super("load script")
  }

  generate() {
    const { compilation } = this
    const { runtimeTemplate, outputOptions } = compilation
    const { uniqueName } = outputOptions
    const fn = RuntimeGlobals.loadScript

    return Template.asString([
      "var loadedScripts = {};",
      "var inProgress = {};",
      uniqueName
        ? `var dataWebpackPrefix = ${JSON.stringify(uniqueName + ":")};`
        : "// data-webpack is not used as build has no uniqueName",
      "// loadScript function to load a script by asking background script run chrome.runtime.executeScript",
      `${fn} = ${runtimeTemplate.basicFunction("url, done, key, chunkId", [
        "if(inProgress[url]) { inProgress[url].push(done); return; }",
        "inProgress[url] = [done];",

        "if(loadedScripts[url]) return;",
        "loadedScripts[url] = true;",

        "chrome.runtime.sendMessage({",
        Template.indent([
          `type: '${MESSAGE_KEY}',`,
          "payload: {",
          Template.indent([
            `file: url.replace(${RuntimeGlobals.publicPath},'')`
          ]),
          "}"
        ]),
        "}, () => {",
        Template.indent([
          "var doneFns = inProgress[url];",
          "delete inProgress[url];",
          `doneFns && doneFns.forEach(${runtimeTemplate.returningFunction(
            "fn(event)",
            "fn"
          )});`
        ]),
        "})"
      ])};`
    ])
  }
}

module.exports = LoadScriptRuntimeModule
