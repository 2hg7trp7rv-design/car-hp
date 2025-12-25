// scripts/check-data-format.mjs
// Fails if data/*.json is not in canonical formatting (keeps array order; sorts object keys; 2-space indent).
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

function expectedFormat(raw, file) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${file} (${e.message})`);
  }
  const normalized = sortKeysDeep(parsed);
  return JSON.stringify(normalized, null, 2) + "\n";
}

const notFormatted = [];
for (const f of TARGET_FILES) {
  const fp = path.join(dataDir, f);
  if (!fs.existsSync(fp)) continue;
  const raw = fs.readFileSync(fp, "utf8");
  const exp = expectedFormat(raw, f);
  if (raw !== exp) notFormatted.push(f);
}

if (notFormatted.length) {
  console.log("JSON formatting check failed. Run: npm run format:data");
  for (const f of notFormatted) console.log(`- ${f}`);
  process.exit(1);
}

console.log("JSON formatting OK.");
