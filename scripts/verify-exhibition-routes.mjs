/**
 * scripts/verify-exhibition-routes.mjs
 *
 * Purpose:
 * - Ensure data/exhibit/routes.json is valid
 * - Prevent broken internal links in the curated "Exhibition" routes
 *
 * Dependency-free (Node fs/path only) to run in Vercel build.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const DATA_DIR = path.join(ROOT, "data");

function die(msg) {
  console.error("[verify-exhibition-routes] ❌", msg);
  process.exit(1);
}

function readJson(filePath) {
  const txt = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(txt);
  } catch {
    die(`Invalid JSON: ${path.relative(ROOT, filePath)}`);
  }
}

function walk(dirAbs, out = []) {
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const ent of ents) {
    const abs = path.join(dirAbs, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walk(abs, out);
    } else {
      out.push(abs);
    }
  }
  return out;
}

function listJsonFiles(dirAbs) {
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs)
    .filter((n) => n.endsWith(".json"))
    .map((n) => path.join(dirAbs, n));
}

function stripTrailingSlash(p) {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

function normalizePath(p) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  // remove query/hash for validation
  const base = s.replace(/[?#].*$/, "");
  return stripTrailingSlash(base);
}

// Maker key normalization (aligned with verify-internal-links.mjs)
function toSlug(s) {
  const x = String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return x;
}

function normalizeMakerLabel(label) {
  const s = String(label ?? "").trim();
  if (!s) return "";
  if (/[A-Za-z]/.test(s)) return s.toUpperCase();
  return s;
}

function normalizeMakerKey(maker) {
  return toSlug(normalizeMakerLabel(maker));
}

// BodyType/segment keys (optional for future routes)
function normalizeBodyTypeKey(bodyType) {
  return toSlug(String(bodyType ?? "").trim());
}

function normalizeSegmentKey(segment) {
  return toSlug(String(segment ?? "").trim());
}

function buildStaticRoutes() {
  const files = walk(APP_DIR);
  const routes = new Set();

  for (const f of files) {
    const rel = path.relative(APP_DIR, f).replace(/\\/g, "/");
    if (!rel.endsWith("/page.tsx") && rel !== "page.tsx") continue;

    const route = rel === "page.tsx" ? "/" : "/" + rel.replace(/\/page\.tsx$/, "");

    // Exclude dynamic segments and route groups
    if (route.includes("[")) continue;

    // Exclude private routes (/_internal etc)
    const segs = route.split("/").filter(Boolean);
    if (segs.some((seg) => seg.startsWith("_"))) continue;

    routes.add(route);
  }

  return routes;
}

function buildContentIndexes() {
  const carsDir = path.join(DATA_DIR, "articles", "cars");
  const guidesDir = path.join(DATA_DIR, "articles", "guides");
  const columnsDir = path.join(DATA_DIR, "articles", "columns");
  const heritageDir = path.join(DATA_DIR, "articles", "heritage");

  const carSlugs = new Set();
  const guideSlugs = new Set();
  const columnSlugs = new Set();
  const heritageSlugs = new Set();

  const makerKeys = new Set();
  const bodyTypeKeys = new Set();
  const segmentKeys = new Set();

  for (const fp of listJsonFiles(carsDir)) {
    const obj = readJson(fp);
    if (obj?.slug) carSlugs.add(String(obj.slug));

    const makerKey = String(obj?.makerKey ?? "").trim() || normalizeMakerKey(obj?.maker);
    if (makerKey) makerKeys.add(makerKey);

    const bt = String(obj?.bodyTypeKey ?? "").trim() || normalizeBodyTypeKey(obj?.bodyType);
    if (bt) bodyTypeKeys.add(bt);

    const seg = String(obj?.segmentKey ?? "").trim() || normalizeSegmentKey(obj?.segment);
    if (seg) segmentKeys.add(seg);
  }

  for (const fp of listJsonFiles(guidesDir)) {
    const obj = readJson(fp);
    if (obj?.slug) guideSlugs.add(String(obj.slug));
  }
  for (const fp of listJsonFiles(columnsDir)) {
    const obj = readJson(fp);
    if (obj?.slug) columnSlugs.add(String(obj.slug));
  }
  for (const fp of listJsonFiles(heritageDir)) {
    const obj = readJson(fp);
    if (obj?.slug) heritageSlugs.add(String(obj.slug));
  }

  return {
    carSlugs,
    guideSlugs,
    columnSlugs,
    heritageSlugs,
    makerKeys,
    bodyTypeKeys,
    segmentKeys,
  };
}

function isValidHref(p, ctx) {
  const s = normalizePath(p);
  if (!s) return false;
  if (!s.startsWith("/")) return false;
  if (s.includes(" ")) return false;

  if (ctx.staticRoutes.has(s)) return true;

  // Content detail pages
  const m = s.match(/^\/(cars|guide|column|heritage)\/([^/]+)$/);
  if (m) {
    const kind = m[1];
    const slug = decodeURIComponent(m[2]);
    if (kind === "cars") return ctx.carSlugs.has(slug);
    if (kind === "guide") return ctx.guideSlugs.has(slug);
    if (kind === "column") return ctx.columnSlugs.has(slug);
    if (kind === "heritage") return ctx.heritageSlugs.has(slug);
  }

  // Taxonomy hubs
  const makers = s.match(/^\/cars\/makers\/([^/]+)$/);
  if (makers) {
    const key = decodeURIComponent(makers[1]);
    return ctx.makerKeys.has(key);
  }
  const bodyTypes = s.match(/^\/cars\/body-types\/([^/]+)$/);
  if (bodyTypes) {
    const key = decodeURIComponent(bodyTypes[1]);
    return ctx.bodyTypeKeys.has(key);
  }
  const segments = s.match(/^\/cars\/segments\/([^/]+)$/);
  if (segments) {
    const key = decodeURIComponent(segments[1]);
    return ctx.segmentKeys.has(key);
  }

  return false;
}

// -------------------------
// Main
// -------------------------

const routesPath = path.join(DATA_DIR, "exhibit", "routes.json");
if (!fs.existsSync(routesPath)) {
  die("data/exhibit/routes.json not found");
}

const routes = readJson(routesPath);
if (!Array.isArray(routes)) {
  die("data/exhibit/routes.json must be an array");
}

const staticRoutes = buildStaticRoutes();
const idx = buildContentIndexes();

const ctx = {
  staticRoutes,
  ...idx,
};

const ids = new Set();
const errors = [];

for (const r of routes) {
  const id = String(r?.id ?? "").trim();
  const title = String(r?.title ?? "").trim();
  const lead = String(r?.lead ?? "").trim();
  const duration = String(r?.duration ?? "").trim();
  const steps = Array.isArray(r?.steps) ? r.steps : [];

  if (!id) errors.push("Route missing id");
  if (!title) errors.push(`Route(${id || "?"}) missing title`);
  if (!lead) errors.push(`Route(${id || "?"}) missing lead`);
  if (!duration) errors.push(`Route(${id || "?"}) missing duration`);

  if (id) {
    if (ids.has(id)) errors.push(`Duplicate route id: ${id}`);
    ids.add(id);
  }

  if (steps.length < 2) {
    errors.push(`Route(${id || "?"}) must have at least 2 steps`);
  }

  for (const s of steps) {
    const href = String(s?.href ?? "").trim();
    const label = String(s?.label ?? "").trim();

    if (!href) {
      errors.push(`Route(${id || "?"}) has a step missing href`);
      continue;
    }
    if (!label) {
      errors.push(`Route(${id || "?"}) step(${href}) missing label`);
    }

    if (!isValidHref(href, ctx)) {
      errors.push(`Route(${id || "?"}) invalid href: ${href}`);
    }
  }
}

if (errors.length) {
  console.error("\n[verify-exhibition-routes] ❌ Invalid exhibition routes:\n");
  for (const e of errors) console.error("-", e);
  console.error("\nFix data/exhibit/routes.json and retry.\n");
  process.exit(1);
}

console.log(`[verify-exhibition-routes] ✅ OK (routes=${routes.length})`);
