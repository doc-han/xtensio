import { Compiler } from "webpack"

interface IgnoreEntriesPluginOptions {
  ignoreEntries: string[]
}

class IgnoreEntriesPlugin {
  constructor(private options: IgnoreEntriesPluginOptions) {}

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      IgnoreEntriesPlugin.name,
      (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          IgnoreEntriesPlugin.name,
          async (assets) => {
            Object.keys(assets).forEach((key) => {
              const name = key.split(".")?.[0]
              if (this.options.ignoreEntries.includes(name)) {
                compilation.deleteAsset(key)
              }
            })
          }
        )
      }
    )
  }
}

export default IgnoreEntriesPlugin
