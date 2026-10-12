#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

version="$(node -p "require('./manifest.chrome.json').version")"
firefox_version="$(node -p "require('./manifest.firefox.json').version")"

if [ "$version" != "$firefox_version" ]; then
  echo "Chrome and Firefox manifest versions do not match." >&2
  exit 1
fi

rm -rf dist
mkdir -p dist

for browser in chrome firefox; do
  target="dist/$browser"
  mkdir -p "$target"
  cp -R src icons PRIVACY.md LICENSE "$target/"
  cp "manifest.$browser.json" "$target/manifest.json"
  (cd "$target" && zip -qr "../itapf-$browser-$version.zip" .)
done

echo "Built Chrome and Firefox packages in dist/."
