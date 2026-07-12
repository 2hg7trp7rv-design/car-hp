import fs from "node:fs";
import path from "node:path";
import { isArticleDiscoverable } from "./lib/article-publication.mjs";

const ROOT = process.cwd();
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://carboutiquejournal.com").replace(/\/+$/, "");
const SITE_HOST = new URL(SITE_URL).host;

const REMOVED_ROUTE_PREFIXES = ["/" + "ca" + "rs", "/" + "her" + "itage"];

const ARTICLE_GROUPS = [
  { kind: "guides", dir: "data/articles/guides", prefix: "/guide", sitemap: "public/sitemaps/sitemap-guides.xml" },
  { kind: "columns", dir: "data/articles/columns", prefix: "/column", sitemap: "public/sitemaps/sitemap-columns.xml" },
];

function die(title, details = []) {
  console.error(`\n[verify-indexing-surface] ❌ ${title}`);
  for (const line of details.slice(0, 80)) console.error(` - ${line}`);
  if (details.length > 80) console.error(` ... and ${details.length - 80} more`);
  process.exit(1);
}

function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function readJson(rel) {
  return JSON.parse(readText(rel));
}

function listJson(relDir) {
  const abs = path.join(ROOT, relDir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((name) => name.endsWith(".json")).sort().map((name) => path.posix.join(relDir, name));
}

function safeString(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim() : "";
}

function normalizePath(value) {
  let s = safeString(value);
  const m = s.match(/^https?:\/\/(?:www\.)?carboutiquejournal\.com(\/.*)$/i);
  if (m) s = m[1];
  s = s.split("#")[0].split("?")[0];
  if (!s.startsWith("/")) return "";
  s = s.replace(/\/+/g, "/");
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s;
}

function extractLocs(xml) {
  const out = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  return out;
}

function locToPath(loc) {
  const url = new URL(loc);
  return normalizePath(url.pathname);
}

const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const NODE_ENV = (process.env.NODE_ENV || "").toLowerCase();
const isExplicitPreviewOrDev = (VERCEL_ENV && VERCEL_ENV !== "production") || (!VERCEL_ENV && NODE_ENV === "development");
if (!isExplicitPreviewOrDev) {
  const robots = readText("public/robots.txt");
  if (robots.split(/\r?\n/).some((line) => /^\s*Disallow:\s*\/\s*$/.test(line))) die("public/robots.txt blocks all crawling", ["Disallow: / was found"]);
}

const forbidden = [];
for (const rel of ["public/sitemap.xml", ...fs.readdirSync(path.join(ROOT, "public/sitemaps")).filter((name) => name.endsWith(".xml")).map((name) => `public/sitemaps/${name}`)]) {
  const xml = readText(rel);
  if (REMOVED_ROUTE_PREFIXES.some((prefix) => xml.includes(`${prefix}/`) || xml.includes(`${prefix}<`) || xml.includes(`${prefix}</loc>`))) forbidden.push(rel);
}
if (forbidden.length) die("removed sections still appear in sitemap XML", forbidden);

const sitemapIndex = readText("public/sitemap.xml");
const allSitemapPaths = new Set();
for (const loc of extractLocs(sitemapIndex)) {
  const url = new URL(loc);
  if (url.host !== SITE_HOST) die("non-canonical host in sitemap index", [`${url.host} != ${SITE_HOST}: ${loc}`]);
}

for (const file of fs.readdirSync(path.join(ROOT, "public/sitemaps")).filter((name) => name.endsWith(".xml"))) {
  const rel = `public/sitemaps/${file}`;
  const xml = readText(rel);
  for (const loc of extractLocs(xml)) {
    const url = new URL(loc);
    if (url.protocol !== "https:") die("non-https URL in sitemap", [loc]);
    if (url.host !== SITE_HOST) die("non-canonical host in sitemap", [loc]);
    allSitemapPaths.add(locToPath(loc));
  }
}

const missing = [];
const unexpected = [];
for (const group of ARTICLE_GROUPS) {
  if (!fs.existsSync(path.join(ROOT, group.sitemap))) die("expected sitemap shard missing", [group.sitemap]);
  const files = listJson(group.dir);
  for (const file of files) {
    const item = readJson(file);
    if (!item?.slug) continue;
    const p = `${group.prefix}/${item.slug}`;
    const shouldIndex = isArticleDiscoverable(item);
    const inSitemap = allSitemapPaths.has(p);
    if (shouldIndex && !inSitemap) missing.push(`${file} -> ${p}`);
    if (!shouldIndex && inSitemap) unexpected.push(`${file} -> ${p}`);
  }
}

if (missing.length) die("indexable article missing from sitemap", missing);
if (unexpected.length) die("non-indexable article exists in sitemap", unexpected);

console.log(`[verify-indexing-surface] ✅ OK. sitemapPaths=${allSitemapPaths.size}`);
