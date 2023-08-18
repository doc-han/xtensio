import packageJson from "./package.json"

export default {
  name: "{{app-name}}",
  manifest_version: 3,
  version: packageJson.version,
  icons: {
    16: "/public/icons/icon.png",
    32: "/public/icons/icon.png",
    48: "/public/icons/icon.png",
    128: "/public/icons/icon.png"
  }
}
