/**
 * scripts/verify-indexing-surface.mjs
 *
 * Search Console の未登録ノイズを増やす事故をビルド前に止めるための検査。
 * - publicState=index の記事が sitemap に入っていること
 * - sitemap に redirect/noindex/draft/空本文の記事URLを入れないこと
 * - 記事本文から redirect 元URLへ内部リンクしないこと
 * - 生成済み robots.txt が本番相当で全拒否になっていないこと
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://carboutiquejournal.com").replace(/\/+$/, "");
const SITE_HOST = new URL(SITE_URL).host;

const ARTICLE_GROUPS = [
  { kind: "cars", dir: "data/articles/cars", prefix: "/cars", sitemap: "public/sitemaps/sitemap-cars.xml" },
  { kind: "guides", dir: "data/articles/guides", prefix: "/guide", sitemap: "public/sitemaps/sitemap-guides.xml" },
  { kind: "columns", dir: "data/articles/columns", prefix: "/column", sitemap: "public/sitemaps/sitemap-columns.xml" },
  { kind: "heritage", dir: "data/articles/heritage", prefix: "/heritage", sitemap: "public/sitemaps/sitemap-heritage.xml" },
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
  return fs
    .readdirSync(abs)
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.posix.join(relDir, name));
}

function safeString(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim() : "";
}

function normalizePath(value) {
  let s = safeString(value);
  if (!s) return "";
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

function isPublished(item) {
  return !item?.status || String(item.status) === "published";
}

function publicState(item) {
  return safeString(item?.publicState).toLowerCase();
}

function isIndexAllowed(item) {
  return Boolean(item) && isPublished(item) && publicState(item) === "index" && item?.noindex !== true;
}

function normalizeList(values) {
  if (!Array.isArray(values)) return [];
  return values.map((v) => safeString(v)).filter(Boolean);
}

function getDecisionAuditBody(item) {
  // decision-v1 記事は body が短くても detailSections 等が本文相当になる。
  const parts = [];
  const visit = (value) => {
    if (typeof value === "string") {
      const s = value.trim();
      if (s) parts.push(s);
      return;
    }
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const entry of Object.values(value)) visit(entry);
  };
  visit(item?.body);
  visit(item?.lead);
  visit(item?.keyPoints);
  visit(item?.checkpoints);
  visit(item?.detailSections);
  visit(item?.faq);
  visit(item?.actionBox);
  return parts.join("\n").trim();
}

function articleHasContent(kind, item) {
  if (!item?.slug) return false;
  if (kind === "cars") {
    const parts = [];
    for (const key of ["summaryLong", "summary", "costImpression", "body", "purchasePriceSafe"]) {
      const s = safeString(item?.[key]);
      if (s) parts.push(s);
    }
    const yearly = item?.maintenanceSimulation && typeof item.maintenanceSimulation === "object"
      ? safeString(item.maintenanceSimulation.yearlyRoughTotal)
      : "";
    if (yearly) parts.push(yearly);
    for (const key of ["bestFor", "notFor", "strengths", "weaknesses", "troubleTrends", "maintenanceNotes"]) {
      parts.push(...normalizeList(item?.[key]));
    }
    return parts.join("\n").trim().length > 0;
  }
  if (safeString(item?.layoutVariant).toLowerCase() === "decision-v1") {
    return getDecisionAuditBody(item).length > 0;
  }
  return safeString(item?.body).length > 0;
}

function stripTrailingPunct(s) {
  let out = String(s ?? "");
  while (out.length > 1 && /[)\]}.;,!:?"']$/.test(out)) out = out.slice(0, -1);
  return out;
}

function extractInternalPaths(text) {
  const s = String(text ?? "");
  const hits = new Set();
  const absRe = /https?:\/\/(?:www\.)?carboutiquejournal\.com\/[^\s)"']+/gi;
  for (const m of s.matchAll(absRe)) hits.add(normalizePath(stripTrailingPunct(m[0])));

  const relRe = /\/(?:cars|guide|column|heritage|compare|start|contact|privacy|site-map)(?:\/[A-Za-z0-9_-]+)*/g;
  for (const m of s.matchAll(relRe)) {
    const idx = typeof m.index === "number" ? m.index : -1;
    if (idx > 0 && /[A-Za-z0-9._-]/.test(s[idx - 1])) continue;
    hits.add(normalizePath(stripTrailingPunct(m[0])));
  }
  hits.delete("");
  return Array.from(hits);
}

// 1) robots.txt が全拒否になっていないこと（ZIP/本番相当）
const robots = readText("public/robots.txt");
if (robots.split(/\r?\n/).some((line) => /^\s*Disallow:\s*\/\s*$/.test(line))) {
  die("public/robots.txt blocks all crawling", ["Disallow: / was found"]);
}

// 2) redirect source の収集
const redirects = fs.existsSync(path.join(ROOT, "data/redirects.json")) ? readJson("data/redirects.json") : [];
const redirectSources = new Set();
const redirectDestinationBySource = new Map();
if (Array.isArray(redirects)) {
  for (const r of redirects) {
    const src = normalizePath(r?.source);
    const dst = normalizePath(r?.destination);
    if (src) redirectSources.add(src);
    if (src && dst) redirectDestinationBySource.set(src, dst);
  }
}

// 3) sitemap locs の正規ホスト/記事URL整合
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
    const p = locToPath(loc);
    if (redirectSources.has(p)) die("redirect source URL exists in sitemap", [`${rel}: ${p} -> ${redirectDestinationBySource.get(p) ?? ""}`]);
    allSitemapPaths.add(p);
  }
}

// 4) publicState=index 記事の sitemap 完全一致
const expectedArticlePaths = new Set();
const actualArticlePaths = new Set();
const itemByPath = new Map();
const dataProblems = [];

for (const group of ARTICLE_GROUPS) {
  for (const rel of listJson(group.dir)) {
    const item = readJson(rel);
    const slug = safeString(item?.slug);
    if (!slug) {
      dataProblems.push(`${rel}: missing slug`);
      continue;
    }
    const p = `${group.prefix}/${slug}`;
    itemByPath.set(p, { ...item, __rel: rel, __kind: group.kind });

    if (item?.noindex === true && publicState(item) === "index") {
      dataProblems.push(`${rel}: publicState=index but noindex=true`);
    }

    if (isIndexAllowed(item)) {
      if (!articleHasContent(group.kind, item)) {
        dataProblems.push(`${rel}: publicState=index but content is empty`);
      } else if (!redirectSources.has(p)) {
        expectedArticlePaths.add(p);
      }
    }
  }

  const xml = readText(group.sitemap);
  for (const loc of extractLocs(xml)) actualArticlePaths.add(locToPath(loc));
}

if (dataProblems.length > 0) die("indexable article data is inconsistent", dataProblems);

const missingFromSitemap = Array.from(expectedArticlePaths).filter((p) => !actualArticlePaths.has(p)).sort();
if (missingFromSitemap.length > 0) die("indexable articles missing from sitemap", missingFromSitemap);

const invalidArticleSitemap = Array.from(actualArticlePaths)
  .filter((p) => p)
  .filter((p) => {
    const item = itemByPath.get(p);
    return !item || !expectedArticlePaths.has(p);
  })
  .sort();
if (invalidArticleSitemap.length > 0) die("non-indexable/unknown article URLs found in article sitemaps", invalidArticleSitemap);

// 5) 記事本文・構造化本文から redirect 元URLへ内部リンクしない
const redirectLinkProblems = [];
for (const group of ARTICLE_GROUPS) {
  for (const rel of listJson(group.dir)) {
    const raw = readText(rel);
    for (const p of extractInternalPaths(raw)) {
      if (redirectSources.has(p)) {
        redirectLinkProblems.push(`${rel}: ${p} -> ${redirectDestinationBySource.get(p) ?? ""}`);
      }
    }
  }
}
if (redirectLinkProblems.length > 0) die("internal links point to redirect sources", redirectLinkProblems);

console.log(
  `[verify-indexing-surface] ✅ OK (index articles=${expectedArticlePaths.size}, sitemap URLs=${allSitemapPaths.size}, redirects=${redirectSources.size})`,
);
