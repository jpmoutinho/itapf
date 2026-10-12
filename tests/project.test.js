const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const chromeManifest = require("../manifest.chrome.json");
const firefoxManifest = require("../manifest.firefox.json");
const packageJson = require("../package.json");

test("project versions match", () => {
  assert.equal(chromeManifest.version, firefoxManifest.version);
  assert.equal(chromeManifest.version, packageJson.version);
});

test("project has an MIT license", () => {
  const license = fs.readFileSync("LICENSE", "utf8");
  assert.match(license, /^MIT License/);
  assert.match(license, /ITAPF contributors/);
});
