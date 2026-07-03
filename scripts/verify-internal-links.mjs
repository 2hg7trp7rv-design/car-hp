import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ARTICLE_GROUPS = [
  { dir: "data/articles/guides", prefix: "/guide" },
  { dir: "data/articles/columns", prefix: "/column" },
];

const errors = [];

function normalizePath(value) {
  let s = String(value ?? "").trim();
  if (!s) return "";
  const abs = s.match(/^https?:\/\/(?:www\.)?carboutiquejournal\.com(\/.*)$/i);
  if (abs) s = abs[1];
  s = s.split("#")[0].split("?")[0];
  if (!s.startsWith("/")) return "";
  s = s.replace(/\/+/g, "/");
  if (s.length > 1) s = s.replace(/\/+$/g, "");
  return s;
}

function stripTrailing(value) {
  let out = String(value ?? "");
  while (out.length > 1 && /[)\]}.;,!:?"']$/.test(out)) out = out.slice(0, -1);
  return out;
}

function collectText(value, out = []) {
  if (value == null) return out;
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, out);
    return out;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) collectText(item, out);
  }
  return out;
}

function extractInternalPaths(text) {
  const source = String(text ?? "");
  const paths = new Set();
  const absolute = /https?:\/\/(?:www\.)?carboutiquejournal\.com\/[^\s)"'<>]+/gi;
  for (const match of source.matchAll(absolute)) {
    const p = normalizePath(stripTrailing(match[0]));
    if (p) paths.add(p);
  }
  const relative = /\/(?:guide|column|contact|legal|privacy|site-map|search)(?:\/[A-Za-z0-9_-]+)*/g;
  for (const match of source.matchAll(relative)) {
    const idx = typeof match.index === "number" ? match.index : -1;
    if (idx > 0 && /[A-Za-z0-9._-]/.test(source[idx - 1])) continue;
    const p = normalizePath(stripTrailing(match[0]));
    if (p) paths.add(p);
  }
  return [...paths];
}

async function listJsonFiles(relDir) {
  const abs = path.join(ROOT, relDir);
  if (!fsSync.existsSync(abs)) return [];
  const names = (await fs.readdir(abs)).filter((name) => name.endsWith(".json")).sort();
  return names.map((name) => path.posix.join(relDir, name));
}

async function readJson(rel) {
  return JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
}

function listStaticRoutes() {
  const routes = new Set(["/", "/guide", "/column", "/contact", "/site-map", "/search"]);
  const appDir = path.join(ROOT, "app");
  const walk = (dir) => {
    if (!fsSync.existsSync(dir)) return;
    for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("[") || entry.name.startsWith("_") || entry.name === "api") continue;
        walk(abs);
      } else if (entry.isFile() && entry.name === "page.tsx") {
        const rel = path.relative(appDir, path.dirname(abs)).split(path.sep).join("/");
        if (!rel || rel === ".") routes.add("/");
        else if (rel !== "article-system-preview") routes.add(`/${rel}`);
      }
    }
  };
  walk(appDir);
  return routes;
}

const validPaths = listStaticRoutes();
const filesToScan = [];

for (const group of ARTICLE_GROUPS) {
  const files = await listJsonFiles(group.dir);
  for (const file of files) {
    const item = await readJson(file);
    if (item?.slug) validPaths.add(`${group.prefix}/${item.slug}`);
    filesToScan.push(file);
  }
}

for (const file of filesToScan) {
  let item;
  try {
    item = await readJson(file);
  } catch (error) {
    errors.push(`${file}: JSONを読み込めません: ${error.message}`);
    continue;
  }
  const text = collectText(item).join("\n");
  for (const href of extractInternalPaths(text)) {
    if (!validPaths.has(href)) errors.push(`${file}: unresolved internal link ${href}`);
  }
}

if (errors.length > 0) {
  console.error("[verify-internal-links] ❌");
  for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
  if (errors.length > 120) console.error(`... and ${errors.length - 120} more`);
  process.exit(1);
}

console.log(`[verify-internal-links] ✅ OK. validPaths=${validPaths.size}, scanned=${filesToScan.length}`);
