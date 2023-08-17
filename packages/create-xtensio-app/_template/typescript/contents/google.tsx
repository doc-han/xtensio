import React from "react"
import { ContentConfig } from "xtensio"

export function getConfig(): ContentConfig {
  return {
    matches: ["*://*.google.com/*"]
  }
}

const GoogleModal: React.FC = () => {
  return <div>This is injected onto the google url specified below</div>
}

export default GoogleModal
