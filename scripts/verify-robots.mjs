/**
 * scripts/verify-robots.mjs
 *
 * production で robots.txt が全拒否になっていないか検査する。
 * iPhone-only運用ではローカル確認が難しいため、buildを落として事故を防ぐ。
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// generate-robots.mjs と判定ロジックを揃える。
// VERCEL_ENV が無いZIP納品/ローカル生成物は、本番投入される可能性があるため厳格に見る。
const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const NODE_ENV = (process.env.NODE_ENV || "").toLowerCase();
const isExplicitPreviewOrDev =
  (VERCEL_ENV && VERCEL_ENV !== "production") ||
  (!VERCEL_ENV && NODE_ENV === "development");
const shouldBeCrawlable = !isExplicitPreviewOrDev;

const robotsPath = path.join(ROOT, "public", "robots.txt");
if (!fs.existsSync(robotsPath)) {
  console.error("[verify-robots] robots.txt not found:", robotsPath);
  process.exit(1);
}

const txt = fs.readFileSync(robotsPath, "utf-8");

// 本番相当の生成物だけ厳格に検査（Preview/Developmentは全拒否でもOK）
if (shouldBeCrawlable) {
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  const hasBlockAll = lines.some((l) => /^Disallow:\s*\/\s*$/.test(l));
  if (hasBlockAll) {
    console.error("\n[verify-robots] ❌ robots.txt blocks all crawling in production.\n");
    console.error(txt);
    process.exit(1);
  }
}

console.log("[verify-robots] ✅ OK");
