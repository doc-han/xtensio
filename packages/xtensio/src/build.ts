import getProjectPaths from "./config/projectPaths"
import { getXtensioWebpackConfig } from "./config/webpack.config"
import webpack from "webpack"

export default function buildCommand(cwd: string) {
  return new Promise<void>(async (resolve) => {
    const webpackConfig = await getXtensioWebpackConfig(
      getProjectPaths(cwd),
      false
    )
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.log(err)
      } else {
        console.log(stats?.toString({ colors: true }))
        console.log("Extension bundled for production!")
      }
      resolve()
    })
  })
}
