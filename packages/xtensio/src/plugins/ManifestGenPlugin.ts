import { Compiler, sources } from "webpack"

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
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const asset = compilation.assets[this.options.filename]
      if (asset) {
        const source = asset.source()
        const commonJsSource = `const self={};\n${source}\nmodule.exports = xtensioExports`
        const sourceExports = eval(commonJsSource) // TODO replace this with an exec
        if (!sourceExports.default)
          console.error(`[${PLUGIN_NAME}]: Default export not found!`)
        const manifestObj = {
          ...(sourceExports.default || {}),
          ...this.options.extend,
          permissions: [
            ...(sourceExports.default.permissions || []),
            ...(this.options.extend.permissions || [])
          ]
        }
        const outSource = JSON.stringify(manifestObj)
        compilation.deleteAsset(this.options.filename)
        compilation.emitAsset(
          this.options.outFilename,
          new sources.RawSource(outSource)
        )
      }
      callback()
    })
  }
}

export default ManifestGenPlugin
