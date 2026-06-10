/**
 * Verify local public image references used by active source files.
 *
 * This catches the class of regression where an image is deleted from /public
 * but a page, component, or content JSON still points at that deleted file.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

const SCAN_DIRS = ["app", "components", "lib", "data/articles", "data/cars"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css", ".scss", ".html", ".xml"]);
const ASSET_EXTENSION_RE = /\.(?:jpg|jpeg|png|webp|avif|gif|svg|ico)(?:[?#][^\s"'`<>)]*)?$/i;
const LOCAL_ASSET_RE = /(?<![\w-])(\/[^\s"'`<>)]*\.(?:jpg|jpeg|png|webp|avif|gif|svg|ico))(?:[?#][^\s"'`<>)]*)?/gi;

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "docs"].includes(entry.name)) continue;
      out.push(...walkFiles(abs));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(abs);
    }
  }
  return out;
}

function walkAllFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkAllFiles(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

function publicAssetSet() {
  const out = new Set();
  for (const file of walkAllFiles(PUBLIC_DIR)) {
    const rel = path.relative(PUBLIC_DIR, file).split(path.sep).join("/");
    out.add(`/${rel}`);
  }
  return out;
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

const publicAssets = publicAssetSet();
const failures = [];

for (const scanDir of SCAN_DIRS) {
  const absDir = path.join(ROOT, scanDir);
  for (const file of walkFiles(absDir)) {
    const text = fs.readFileSync(file, "utf8");
    const relFile = path.relative(ROOT, file).split(path.sep).join("/");

    for (const match of text.matchAll(LOCAL_ASSET_RE)) {
      const raw = match[1];
      if (!raw) continue;
      if (raw.startsWith("//")) continue; // protocol-relative external URL
      if (raw.includes("${")) continue;
      if (!ASSET_EXTENSION_RE.test(raw)) continue;

      const clean = raw.split(/[?#]/)[0];
      if (!publicAssets.has(clean)) {
        failures.push(`${relFile}:${lineNumber(text, match.index ?? 0)} -> ${clean}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("[verify-public-asset-references] ❌ missing local public assets:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`[verify-public-asset-references] ✅ OK (${publicAssets.size} public files indexed)`);
