To change icons for your extension. You just need to have them in the `public` directory and then import them into your `manifest.js` file.

> How to import extension icons of several dimensions

```ts title="manifest.js" linenums="1" hl_lines="2 3 4 5 11 12 13 14 15 16"
import packageJson from "./package.json";
import icon16 from "@public/icons/icon16.png";
import icon32 from "@public/icons/icon32.png";
import icon48 from "@public/icons/icon48.png";
import icon128 from "@public/icons/icon128.png";

export default {
  name: "simple-extension", // extension name
  manifest_version: 3,
  version: packageJson.version,
  icons: {
    16: icon16,
    32: icon32,
    48: icon48,
    128: icon128,
  },
};
```

And that's it! your extension icons have been updated.
