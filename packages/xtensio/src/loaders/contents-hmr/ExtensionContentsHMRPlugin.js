const LoadScriptRuntimeModule = require("./LoadScriptRuntimeGlobals")

class ExtensionContentsHMRPlugin {
  /**
   *
   * @param { {entry: RegExp} } options
   */
  constructor(options) {
    if (
      !(options.entry instanceof RegExp || options.entry.constructor === RegExp)
    )
      throw Error("The entry option has to be a RegExp")
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "ExtensionContentsHMRPlugin",
      (compilation) => {
        const { RuntimeGlobals } = compiler.webpack
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.loadScript)
          .tap("ExtensionContentsHMRPlugin", (chunk, set) => {
            console.log("chunk-name: ", chunk.name)
            if (this.options.entry.test(chunk.name)) {
              console.log("passed:", chunk.name)
              compilation.addRuntimeModule(chunk, new LoadScriptRuntimeModule())
              return true
            }
            return undefined
          })
      }
    )
  }
}

module.exports = ExtensionContentsHMRPlugin
