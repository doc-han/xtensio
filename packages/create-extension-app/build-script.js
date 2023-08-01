const fs = require("fs")
const pkg = require("create-xtensio-app/package.json")
const thisPkg = require("./package.json")
const path = require("path")

const command = process.argv[2]
pkg.files.forEach((file) => {
  const filePath = path.relative(__dirname, `../create-xtensio-app/${file}`)
  const destPath = path.join(__dirname, file)
  if (command === "clean") fs.rmSync(destPath, { recursive: true, force: true })
  else fs.cpSync(filePath, destPath, { recursive: true, force: true })
  console.log(`Done ${command === "clean" ? "cleaning" : "copying"} ${file}`)
})

if (command !== "clean") {
  const newPkg = {
    ...thisPkg,
    version: pkg.version,
    description: pkg.description,
    files: pkg.files,
    dependencies: pkg.dependencies
  }
  fs.writeFileSync("./package.json", JSON.stringify(newPkg))
}
