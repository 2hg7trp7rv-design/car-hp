// scripts/format-data.mjs
// Canonical JSON formatting for data/*.json (keeps array order; sorts object keys; 2-space indent).
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "data");

const TARGET_FILES = [
  "cars.json",
  "columns.json",
  "guides.json",
  "heritage.json",
  "hubGuides.json",
  "monetizeMap.json",
  "news-latest.json",
  "affiliateLinks.demo.json",
  "affiliateLinks.prod.json",
];

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (!isPlainObject(value)) return value;

  const out = {};
  for (const k of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
    out[k] = sortKeysDeep(value[k]);
  }
  return out;
}

function formatJsonFile(file) {
  const fp = path.join(dataDir, file);
  if (!fs.existsSync(fp)) return { file, skipped: true };

  const raw = fs.readFileSync(fp, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${file} (${e.message})`);
  }

  const normalized = sortKeysDeep(parsed);
  const formatted = JSON.stringify(normalized, null, 2) + "\n";

  if (raw === formatted) return { file, changed: false };

  fs.writeFileSync(fp, formatted, "utf8");
  return { file, changed: true };
}

const results = [];
for (const f of TARGET_FILES) {
  results.push(formatJsonFile(f));
}

const changed = results.filter((r) => r.changed).map((r) => r.file);
const skipped = results.filter((r) => r.skipped).map((r) => r.file);

if (changed.length) {
  console.log("Formatted:");
  for (const f of changed) console.log(`- ${f}`);
} else {
  console.log("All target JSON files are already formatted.");
}

if (skipped.length) {
  console.log("\nSkipped (not found):");
  for (const f of skipped) console.log(`- ${f}`);
}
