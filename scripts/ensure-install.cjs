const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function isPackageDirBroken(dir) {
  // A package dir is only "broken" if it's empty or has no package.json /
  // an unparseable one. We no longer guess at entry-point resolution
  // (main/exports/module/etc.) since that's too fragile to get right.
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return true; // can't even read it — treat as broken
  }

  if (entries.length === 0) return true;

  const pkgFile = path.join(dir, "package.json");
  if (!fs.existsSync(pkgFile)) return true;

  try {
    JSON.parse(fs.readFileSync(pkgFile, "utf8"));
    return false; // has a valid package.json — trust it
  } catch {
    return true; // package.json exists but is corrupt
  }
}

function removeIfBroken(dir) {
  try {
    const stat = fs.lstatSync(dir);
    if (stat.isSymbolicLink()) {
      // pnpm/yarn often symlink packages — only unlink, never recurse
      // into the real target, or you'll delete something outside node_modules.
      if (!fs.existsSync(dir)) {
        fs.unlinkSync(dir); // dangling symlink
      }
      return;
    }
    if (isPackageDirBroken(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // ignore individual failures (permissions, race conditions, etc.)
    // — we don't want one bad entry to crash the whole setup script.
  }
}

function removeBrokenPackages(folder) {
  if (!fs.existsSync(folder)) return;

  let entries;
  try {
    entries = fs.readdirSync(folder);
  } catch {
    return;
  }

  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const dir = path.join(folder, name);

    if (name.startsWith("@")) {
      // scoped namespace folder — recurse into the packages inside it,
      // don't treat the namespace folder itself as a package
      let scoped;
      try {
        scoped = fs.readdirSync(dir);
      } catch {
        continue;
      }
      for (const scopedName of scoped) {
        removeIfBroken(path.join(dir, scopedName));
      }
      continue;
    }

    removeIfBroken(dir);
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