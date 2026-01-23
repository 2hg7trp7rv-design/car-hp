import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_SITE_URL = "https://carboutiquejournal.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

// Vercel: production / preview / development
const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const NODE_ENV = (process.env.NODE_ENV || "").toLowerCase();
const isProd = VERCEL_ENV ? VERCEL_ENV === "production" : NODE_ENV === "production";

// Preview/Dev は原則インデックスさせない（誤インデックス事故の防止）
const disallowAll = !isProd;

const lines = [];
lines.push("User-agent: *");

if (disallowAll) {
  lines.push("Disallow: /");
  lines.push("");
  // NOTE: disallowAll の場合は sitemap を出さなくても良いが、
  // 手元確認や一部ツール互換のために残しておく。
  lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push("");
} else {
  lines.push("Allow: /");
  lines.push("Disallow: /api/");
  lines.push("Disallow: /_internal/");
  // サイト内検索/比較ツールは noindex だが、クロールも抑制する
  lines.push("Disallow: /search");
  lines.push("Disallow: /compare");
  lines.push("");
  // /sitemap.xml のみ掲示（重複/ノイズを避ける）
  lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push("");
}

const body = lines.join("\n");
const outPath = path.join(ROOT, "public", "robots.txt");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, body, "utf-8");

console.log(`[robots] generated: ${outPath} (prod=${isProd})`);
