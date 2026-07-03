import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_SITE_URL = "https://carboutiquejournal.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

// Vercel: production / preview / development
const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const NODE_ENV = (process.env.NODE_ENV || "").toLowerCase();

// Index事故防止の方針:
// - Vercel Preview / Development は全拒否でよい。
// - Vercel Production は必ず許可。
// - ローカルやZIP納品時など、VERCEL_ENV が無い状態は本番robotsを生成する。
//   ここを全拒否にすると、生成済み public/robots.txt がそのまま混入した場合に
//   Search Console のクロール拒否原因になるため。
const isExplicitPreviewOrDev =
  (VERCEL_ENV && VERCEL_ENV !== "production") ||
  (!VERCEL_ENV && NODE_ENV === "development");

const disallowAll = Boolean(isExplicitPreviewOrDev);

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
  // /search や /_internal はページ/ミドルウェア側で noindex/404 を返す。
  // robots.txt で Disallow すると、クローラーが noindex を読めず URL だけが残るケースがあるため、
  // HTML側の制御を読ませるURLはここではブロックしない。
  // /_next/static/ もJS/CSSレンダリングを阻害しないためブロックしない。
  lines.push("");
  // /sitemap.xml のみ掲示（重複/ノイズを避ける）
  lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push("");
}

const body = lines.join("\n");
const outPath = path.join(ROOT, "public", "robots.txt");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, body, "utf-8");

console.log(`[robots] generated: ${outPath} (disallowAll=${disallowAll})`);
