/**
 * scripts/verify-sitemaps.mjs
 *
 * Minimal sanity checks to prevent:
 * - sitemap.xml missing
 * - sitemap index referencing missing files
 * - accidental non-canonical host in sitemap URLs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://carboutiquejournal.com")
  .replace(/\/+$/g, "");

function die(msg) {
  console.error("[verify-sitemaps] ❌", msg);
  process.exit(1);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

function extractLocs(xmlText) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xmlText))) {
    locs.push(String(m[1]).trim());
  }
  return locs;
}

function extractLastmods(xmlText) {
  const lastmods = [];
  const re = /<lastmod>([^<]+)<\/lastmod>/g;
  let m;
  while ((m = re.exec(xmlText))) {
    lastmods.push(String(m[1]).trim());
  }
  return lastmods;
}

const DISALLOWED_SITEMAP_PATHS = [
  "/search",
  "/start",
  "/exhibition",
  "/canvas",
  "/compare",
  "/_internal",
  "/api",
  "/_next",
];

function assertAllowedUrl(loc, context) {
  const url = new URL(loc);
  for (const bad of DISALLOWED_SITEMAP_PATHS) {
    if (url.pathname === bad || url.pathname.startsWith(`${bad}/`)) {
      die(`Disallowed URL in ${context}: ${loc}`);
    }
  }
  if (/\.(css|js|map|png|jpe?g|webp|svg|ico)$/i.test(url.pathname)) {
    die(`Static asset URL in ${context}: ${loc}`);
  }
}

const indexPath = path.join(PUBLIC_DIR, "sitemap.xml");
if (!fs.existsSync(indexPath)) {
  die("public/sitemap.xml not found");
}

const indexXml = readText(indexPath);
if (!indexXml.includes("<sitemapindex")) {
  die("sitemap.xml is not a sitemapindex");
}

const locs = extractLocs(indexXml);
if (locs.length === 0) {
  die("sitemap.xml has no <loc> entries");
}

for (const loc of locs) {
  let url;
  try {
    url = new URL(loc);
  } catch {
    die(`Invalid sitemap <loc> URL: ${loc}`);
  }

  const expectedHost = new URL(SITE_URL).host;
  if (url.host !== expectedHost) {
    die(`Non-canonical host in sitemap index: ${url.host} (expected ${expectedHost}) -> ${loc}`);
  }

  const relPath = url.pathname.replace(/^\//, "");
  const fileOnDisk = path.join(PUBLIC_DIR, relPath);
  if (!fs.existsSync(fileOnDisk)) {
    die(`Referenced sitemap file missing: public/${relPath}`);
  }

  const body = readText(fileOnDisk).trim();
  if (body.length < 50) {
    die(`Referenced sitemap file looks empty: public/${relPath}`);
  }
  if (!body.includes("<urlset") && !body.includes("<sitemapindex")) {
    die(`Referenced sitemap file is not XML sitemap: public/${relPath}`);
  }

  const childLocs = extractLocs(body);
  for (const childLoc of childLocs) {
    assertAllowedUrl(childLoc, `public/${relPath}`);
  }

  const childLastmods = extractLastmods(body);
  const uniqueLastmods = new Set(childLastmods);
  if (childLastmods.length > 20 && uniqueLastmods.size === 1) {
    const onlyDate = childLastmods[0];
    const today = new Date().toISOString().slice(0, 10);
    if (onlyDate === today) {
      die(`Referenced sitemap appears to use build-day lastmod for ${childLastmods.length} URLs: public/${relPath}`);
    }
    console.warn(`[verify-sitemaps] ⚠️ ${relPath} has one repeated lastmod (${onlyDate}); verify that this comes from source data, not build time.`);
  }

  // Soft check: avoid obviously wrong base URL in contained locs.
  // (We don't parse the full XML to keep this script dependency-free.)
  if (body.includes("<loc>http://")) {
    die(`Referenced sitemap contains http:// loc (should be https): public/${relPath}`);
  }
}

console.log(`[verify-sitemaps] ✅ OK (${locs.length} referenced sitemaps)`);
