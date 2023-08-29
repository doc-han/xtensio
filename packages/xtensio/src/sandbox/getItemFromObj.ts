import Refresh from "react-refresh/runtime"

// cheatsheet
// rx() - isLikelyComponentType function call on curr
// () - check if curr is a function and call it
export function getItemFromObj(obj: any, map: Record<string, string>) {
  if (typeof obj !== "object") return {}
  const res = Object.entries(map)
    .map(([key, value]) => {
      const tree = value.split(".")
      let curr = obj
      for (let item of tree) {
        if (item === "()" && typeof curr === "function") {
          curr = curr()
          continue
        } else if (item === "rx()" && typeof curr === "function") {
          curr = Refresh.isLikelyComponentType(curr)
          continue
        }
        curr = curr?.[item]
        if (!curr) break
      }
      return { [key]: curr }
    })
    .reduce((a, b) => ({ ...a, ...b }), {})
  return res
}
