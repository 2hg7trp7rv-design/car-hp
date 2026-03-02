/**
 * scripts/generate-public-assets.mjs
 *
 * Build-time manifest of all files under /public.
 *
 * Why:
 * - Prevent accidental 404s caused by content JSON pointing at missing local images.
 * - Allow UI components to “safely” decide whether a local asset can be used.
 *
 * Output:
 * - data/_internal/public-assets.json
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "data", "_internal");
const OUT_FILE = path.join(OUT_DIR, "public-assets.json");

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walk(abs));
    } else if (ent.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

if (!fs.existsSync(PUBLIC_DIR)) {
  console.error("[generate-public-assets] public/ not found:", PUBLIC_DIR);
  process.exit(1);
}

const absFiles = walk(PUBLIC_DIR);

const paths = absFiles
  .map((abs) => {
    const rel = path.relative(PUBLIC_DIR, abs).split(path.sep).join("/");
    return `/${rel}`;
  })
  // Exclude source maps if any (rare in public, but safe)
  .filter((p) => !p.endsWith(".map"))
  .sort();

fs.mkdirSync(OUT_DIR, { recursive: true });

const payload = {
  generatedAt: new Date().toISOString(),
  count: paths.length,
  paths,
};

fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");

console.log(`[generate-public-assets] ✅ wrote ${paths.length} paths -> ${path.relative(ROOT, OUT_FILE)}`);
