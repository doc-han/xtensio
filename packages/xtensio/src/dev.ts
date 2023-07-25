import { getXtensioWebpackConfig } from "./config/webpack.config";
import webpack from "webpack";

export default async function devCommand(cwd: string) {
  const webpackConfig = await getXtensioWebpackConfig(cwd);
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.log(err);
    } else {
      console.log(stats?.toString({colors: true}))
      console.log("xtensio watching for changes...");
    }
  });
}
