import { Compiler, sources } from "webpack"
import sandboxExec from "../sandbox/helper"

const PLUGIN_NAME = "Xtensio-Manifest-Generator"

interface ManifestGenPluginOptions {
  filename: string
  outFilename: string
  extend: Record<string, any>
}

class ManifestGenPlugin {
  options: ManifestGenPluginOptions
  constructor(options: ManifestGenPluginOptions) {
    this.options = options
    this.options.outFilename =
      this.options.outFilename ?? this.options.filename.replace(/\..+/, ".json")
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        PLUGIN_NAME,
        async (assets) => {
          const asset = assets[this.options.filename]
          if (asset) {
            const source = asset.source()
            const commonJsSource = `const self={};\n${source}\nmodule.exports = xtensioExports`
            const { default: manifestExport } = await sandboxExec.source(
              commonJsSource,
              {
                default: "default"
              }
            )
            if (!manifestExport)
              console.error(`[${PLUGIN_NAME}]: Default export not found!`)
            const manifestObj = {
              ...(manifestExport || {}),
              ...this.options.extend,
              permissions: [
                ...(manifestExport.permissions || []),
                ...(this.options.extend.permissions || [])
              ]
            }
            const outSource = JSON.stringify(manifestObj, null, 2)
            compilation.emitAsset(
              this.options.outFilename,
              new sources.RawSource(outSource)
            )
          }
          Object.keys(assets).forEach((key) => {
            const name = key.split(".")?.[0]
            if (name === "manifest" && key !== this.options.outFilename) {
              compilation.deleteAsset(key)
            }
          })
        }
      )
    })
  }
}

export default ManifestGenPlugin
