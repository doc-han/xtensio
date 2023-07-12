import { getXtensioWebpackConfig } from "./config/webpack.config";
import webpack from "webpack";

export default async function buildCommand(cwd: string) {
  const webpackConfig = await getXtensioWebpackConfig(cwd);
  webpack(webpackConfig, (err, stats) => {
    if (err || stats?.hasErrors()) {
      console.log(err);
    } else {
      console.log("bundled successfully!");
    }
  });
}
