import packageJson from "./package.json"
import icon from "@public/icons/icon.png"

export default {
  name: "{{app-name}}",
  manifest_version: 3,
  version: packageJson.version,
  icons: {
    16: icon,
    32: icon,
    48: icon,
    128: icon
  }
}
