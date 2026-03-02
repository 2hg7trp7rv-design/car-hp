/**
 * scripts/verify-env.mjs
 *
 * 目的:
 * - iPhone-only運用での「本番URLの設定漏れ」をビルドで止める
 * - canonical / sitemap / OGP のURLが間違うと、Search Consoleの重複/評価分散/リダイレクト事故の原因になる
 *
 * 方針:
 * - Preview/Dev では厳格にしない（作業を止めない）
 * - Production では NEXT_PUBLIC_SITE_URL の設定を必須化
 */

const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const NODE_ENV = (process.env.NODE_ENV || "").toLowerCase();
const isProd = VERCEL_ENV ? VERCEL_ENV === "production" : NODE_ENV === "production";

const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim();

function fail(msg) {
  console.error("\n[verify-env] ❌ " + msg + "\n");
  process.exit(1);
}

function ok(msg) {
  console.log("[verify-env] ✅ " + msg);
}

if (!isProd) {
  ok("skip (non-production)");
  process.exit(0);
}

if (!raw) {
  fail("NEXT_PUBLIC_SITE_URL is required in production (example: https://carboutiquejournal.com)");
}

let url;
try {
  url = new URL(raw);
} catch (e) {
  fail(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
}

if (url.protocol !== "https:") {
  fail(`NEXT_PUBLIC_SITE_URL must use https: "${raw}"`);
}

if (url.pathname && url.pathname !== "/" ) {
  fail(`NEXT_PUBLIC_SITE_URL must be a bare origin (no path): "${raw}"`);
}

const host = url.hostname.toLowerCase();

if (host.endsWith(".vercel.app")) {
  fail(`NEXT_PUBLIC_SITE_URL must not be a vercel.app domain in production: "${raw}"`);
}

if (host === "localhost" || host === "127.0.0.1") {
  fail(`NEXT_PUBLIC_SITE_URL must not point to localhost in production: "${raw}"`);
}

// 末尾スラッシュを除いて設定する運用だが、念のため警告止まりにする
if (raw.endsWith("/")) {
  console.warn("[verify-env] ⚠️ NEXT_PUBLIC_SITE_URL ends with '/', prefer no trailing slash:", raw);
}

ok("production env looks sane");
