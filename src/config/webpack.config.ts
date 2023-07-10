import path from "path"
import webpack from "webpack"

export const getXtensioWebpackConfig = (cwd: string) => {
  return {
    entry: {
      popup: path.join(cwd, "./popup/popup.tsx"),
      background: path.join(cwd,"./background/index.ts"),
      // TODO go through everything in pages folder.
      // get the default export supposed to be a react component
      // inject code that create the react mount and renders the component
      // now use new file for webpack here!
      // TODO go through everything in contentscripts folder
      // build a map of filenames and matches rules
      // use this map to generate manifest file!
    },
    output: {
      path: path.join(cwd, './dist'),
      filename: '[name].js'
    }
  } as webpack.Configuration;
}

