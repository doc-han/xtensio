This is where you put most of your extension configurations, permissions and so on.

=== ":material-language-javascript: Javascript"

    ```ts title="manifest.js" linenums="1"
    import packageJson from "./package.json"
    import icon from "@public/icons/icon.png"

    export default {
        name: "simple-extension", // extension name
        manifest_version: 3,
        version: packageJson.version,
        icons: {
            16: icon,
            32: icon,
            48: icon,
            128: icon
        }
        // extend manifest by adding other config here
    }
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="manifest.ts" linenums="1"
    import packageJson from "./package.json"
    import icon from "@public/icons/icon.png"

    export default {
        name: "simple-extension", // extension name
        manifest_version: 3,
        version: packageJson.version,
        icons: {
            16: icon,
            32: icon,
            48: icon,
            128: icon
        }
        // extend manifest by adding other config here
    } as chrome.runtime.Manifest
    ```

Even though this configuration can be extended, some parts of it may be overwritten by xtensio. Mainly the `content_scripts` `background` and `action`.
