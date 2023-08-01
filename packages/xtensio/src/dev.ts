import { getXtensioWebpackConfig } from "./config/webpack.config"
import webpack from "webpack"

export default function devCommand(cwd: string) {
  return new Promise<void>(async (resolve) => {
    const webpackConfig = await getXtensioWebpackConfig(cwd)
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.log(err)
      } else {
        console.log(stats?.toString({ colors: true }))
        console.log("xtensio watching for changes...")
      }
      resolve()
    })
  })
}
