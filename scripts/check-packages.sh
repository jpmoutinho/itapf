#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

version="$(node -p "require('./manifest.chrome.json').version")"
firefox_version="$(node -p "require('./manifest.firefox.json').version")"

if [ "$version" != "$firefox_version" ]; then
  echo "Chrome and Firefox manifest versions do not match." >&2
  exit 1
fi

for browser in chrome firefox; do
  package_dir="dist/$browser"
  archive="dist/itapf-$browser-$version.zip"

  test -d "$package_dir"
  test -f "$archive"
  unzip -tq "$archive"
  unzip -p "$archive" manifest.json | cmp - "manifest.$browser.json"
  unzip -p "$archive" LICENSE | cmp - LICENSE

  node - "$package_dir" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2];
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const referencedFiles = [
  manifest.action.default_popup,
  ...Object.values(manifest.action.default_icon),
  ...Object.values(manifest.icons),
  ...manifest.content_scripts.flatMap(script => [...(script.css || []), ...(script.js || [])]),
  "LICENSE",
  "PRIVACY.md"
];

for (const file of new Set(referencedFiles)) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Package is missing ${file}`);
  }
}
NODE
done

echo "Chrome and Firefox packages are valid."
