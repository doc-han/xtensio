import getProjectPaths from "./config/projectPaths"
import { getXtensioWebpackConfig } from "./config/webpack.config"
import webpack from "webpack"
import express from "express"
import cors from "cors"
import devMiddleware from "webpack-dev-middleware"
import hotMiddleware from "webpack-hot-middleware"

const DEV_SERVER_PORT = 5332 // new port for xtensio

export default function devCommand(cwd: string) {
  return new Promise<void>(async (resolve) => {
    const app = express()
    app.use(cors({ origin: "*" }))
    const webpackConfig = await getXtensioWebpackConfig(getProjectPaths(cwd), {
      port: DEV_SERVER_PORT
    })
    const compiler = webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.log(err)
      } else {
        console.log(stats?.toString({ colors: true }))
        console.log("xtensio watching for changes...")
      }
      resolve()
    })
    app.use(
      devMiddleware(compiler, {
        writeToDisk: (filePath) => {
          return (
            !/hot-update\.json$/.test(filePath) &&
            !/hot-update\.js$/.test(filePath)
          )
        }
      })
    )

    app.use(hotMiddleware(compiler))

    app.listen(DEV_SERVER_PORT, () => {
      console.log(`xtensio dev-server at port ${DEV_SERVER_PORT}`)
    })
  })
}
