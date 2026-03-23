const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const BASE_URL = process.env.ADDIN_BASE_URL;

if (!BASE_URL) {
  console.error("Error: ADDIN_BASE_URL environment variable is required.");
  console.error("Usage: ADDIN_BASE_URL=https://your-site.com npm run build:prod");
  process.exit(1);
}

const cleanUrl = BASE_URL.replace(/\/+$/, "");
console.log(`Building for production with base URL: ${cleanUrl}`);

// Build webpack
execSync("npx webpack --mode production", { cwd: path.join(__dirname, ".."), stdio: "inherit" });

// Generate production manifest.xml from template
const manifestPath = path.join(__dirname, "..", "manifest.xml");
const distPath = path.join(__dirname, "..", "dist");
let manifest = fs.readFileSync(manifestPath, "utf-8");
manifest = manifest.replace(/https:\/\/localhost:44366/g, cleanUrl);
fs.writeFileSync(path.join(distPath, "manifest.xml"), manifest);
console.log(`Production manifest.xml written to dist/manifest.xml`);

// Also generate production manifest.json (unified manifest)
const jsonManifestPath = path.join(__dirname, "..", "manifest.json");
if (fs.existsSync(jsonManifestPath)) {
  let jsonManifest = fs.readFileSync(jsonManifestPath, "utf-8");
  jsonManifest = jsonManifest.replace(/https:\/\/localhost:44366/g, cleanUrl);
  fs.writeFileSync(path.join(distPath, "manifest.json"), jsonManifest);
  console.log(`Production manifest.json written to dist/manifest.json`);
}

console.log(`\nDone! Deploy the contents of dist/ to ${cleanUrl}`);
