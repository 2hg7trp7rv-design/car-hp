/**
 * scripts/verify-robots.mjs
 *
 * production で robots.txt が全拒否になっていないか検査する。
 * iPhone-only運用ではローカル確認が難しいため、buildを落として事故を防ぐ。
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

const robotsPath = path.join(ROOT, "public", "robots.txt");
if (!fs.existsSync(robotsPath)) {
  console.error("[verify-robots] robots.txt not found:", robotsPath);
  process.exit(1);
}

const txt = fs.readFileSync(robotsPath, "utf-8");

// production だけ厳格に検査（Previewは全拒否でもOK）
if (isProd) {
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  const hasBlockAll = lines.some((l) => /^Disallow:\s*\/\s*$/.test(l));
  if (hasBlockAll) {
    console.error("\n[verify-robots] ❌ robots.txt blocks all crawling in production.\n");
    console.error(txt);
    process.exit(1);
  }
}

console.log("[verify-robots] ✅ OK");
