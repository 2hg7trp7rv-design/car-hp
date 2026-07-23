import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { isArticleDiscoverable } from "./lib/article-publication.mjs";

const ROOT = process.cwd();
const DEFAULT_SITE_URL = "https://carboutiquejournal.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

const escapeXml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&apos;");

const toDate10 = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
};

const normalizePath = (value) => {
  let s = String(value ?? "").trim();
  if (!s) return "";
  s = s.split("#")[0].split("?")[0];
  if (!s.startsWith("/")) return "";
  s = s.replace(/\/+$/g, "");
  return s || "/";
};

async function readJsonFile(abs) {
  const raw = await fs.readFile(abs, "utf8");
  return JSON.parse(raw);
}

async function readArticleDir(relDir) {
  const absDir = path.join(ROOT, relDir);
  if (!fsSync.existsSync(absDir)) return [];
  const names = (await fs.readdir(absDir)).filter((name) => name.endsWith(".json")).sort();
  const out = [];
  for (const name of names) {
    const abs = path.join(absDir, name);
    const item = await readJsonFile(abs);
    if (item && typeof item === "object") out.push({ ...item, __file: path.posix.join(relDir, name) });
  }
  return out;
}

function articleLastmod(item) {
  return toDate10(item?.updatedAt) ?? toDate10(item?.publishedAt) ?? toDate10(item?.createdAt);
}

function urlEntry(pathname, lastmod) {
  const loc = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
    "  </url>",
  ].filter(Boolean).join("\n");
}

function sitemapUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

function sitemapIndex(files) {
  const body = files.map((file) => [
    "  <sitemap>",
    `    <loc>${escapeXml(`${SITE_URL}/sitemaps/${file}`)}</loc>`,
    "  </sitemap>",
  ].join("\n")).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

async function main() {
  const outDir = path.join(ROOT, "public", "sitemaps");
  await fs.mkdir(outDir, { recursive: true });

  const redirectsPath = path.join(ROOT, "data", "redirects.json");
  const redirects = fsSync.existsSync(redirectsPath) ? JSON.parse(await fs.readFile(redirectsPath, "utf8")) : [];
  const redirectSources = new Set(Array.isArray(redirects) ? redirects.map((r) => normalizePath(r?.source)).filter(Boolean) : []);

  const staticPaths = [
    "/",
    "/guide",
    "/column",
    "/site-map",
    "/decide",
    "/contact",
    "/legal",
    "/legal/about",
    "/legal/ads-affiliate-policy",
    "/legal/copyright",
    "/legal/disclaimer",
    "/legal/editorial-policy",
    "/legal/privacy",
    "/legal/sources-factcheck",
  ].filter((p) => !redirectSources.has(p));

  const guides = (await readArticleDir("data/articles/guides"))
    .filter((item) => isArticleDiscoverable(item))
    .map((item) => ({ path: `/guide/${item.slug}`, lastmod: articleLastmod(item) }))
    .filter((entry) => !redirectSources.has(entry.path));

  const columns = (await readArticleDir("data/articles/columns"))
    .filter((item) => isArticleDiscoverable(item))
    .map((item) => ({ path: `/column/${item.slug}`, lastmod: articleLastmod(item) }))
    .filter((entry) => !redirectSources.has(entry.path));

  const files = [
    ["sitemap-static.xml", staticPaths.map((p) => urlEntry(p, null))],
    ["sitemap-guides.xml", guides.map((entry) => urlEntry(entry.path, entry.lastmod))],
    ["sitemap-columns.xml", columns.map((entry) => urlEntry(entry.path, entry.lastmod))],
  ];

  for (const [file, entries] of files) {
    await fs.writeFile(path.join(outDir, file), sitemapUrlset(entries), "utf8");
  }

  await fs.writeFile(path.join(ROOT, "public", "sitemap.xml"), sitemapIndex(files.map(([file]) => file)), "utf8");
  await fs.writeFile(path.join(outDir, "sitemap-index.xml"), sitemapIndex(files.map(([file]) => file)), "utf8");

  console.log(`[sitemaps] generated: static=${staticPaths.length}, guides=${guides.length}, columns=${columns.length}`);
}

await main();
