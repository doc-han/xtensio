export function getConfig() {
  return {
    matches: ["*://*.google.com/*"]
  }
}

const GoogleModal = () => {
  return <div>This is injected onto the google url specified below</div>
}

export default GoogleModal
