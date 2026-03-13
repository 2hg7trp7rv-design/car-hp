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

  // Soft check: avoid obviously wrong base URL in contained locs.
  // (We don't parse the full XML to keep this script dependency-free.)
  if (body.includes("<loc>http://")) {
    die(`Referenced sitemap contains http:// loc (should be https): public/${relPath}`);
  }
}

console.log(`[verify-sitemaps] ✅ OK (${locs.length} referenced sitemaps)`);
