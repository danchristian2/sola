const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function removeBrokenPackages(folder) {
  if (!fs.existsSync(folder)) return;
  for (const name of fs.readdirSync(folder)) {
    if (name.startsWith(".")) continue;
    const dir = path.join(folder, name);
    const pkgFile = path.join(dir, "package.json");
    if (!fs.existsSync(pkgFile)) {
      fs.rmSync(dir, { recursive: true, force: true });
      continue;
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
      const main = pkg.main || "index.js";
      if (!fs.existsSync(path.join(dir, main)) && !fs.existsSync(path.join(dir, "index.js"))) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
}

removeBrokenPackages(path.join(root, "server/node_modules"));
removeBrokenPackages(path.join(root, "client/node_modules"));

const ready =
  exists("node_modules/concurrently") &&
  (exists("node_modules/tsx") || exists("server/node_modules/tsx")) &&
  (exists("node_modules/vite") || exists("client/node_modules/vite")) &&
  (exists("node_modules/mongoose/index.js") || exists("server/node_modules/mongoose/index.js"));

if (ready) {
  process.exit(0);
}

console.log("Installing SOLA packages. This only happens once...");
execSync("npm install", { cwd: root, stdio: "inherit", env: process.env });
