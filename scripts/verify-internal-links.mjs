// scripts/verify-internal-links.mjs
//
// Goal:
// - Prevent internal 404s by validating that internal links mentioned in JSON bodies exist.
// - Validate redirect destinations to avoid redirect-to-404.
//
// Notes:
// - This script is intentionally dependency-free.
// - It scans `data/articles/**.json` (body field) and looks for internal URLs/paths.

import fs from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = process.cwd();
const APP_DIR = path.join(REPO_ROOT, "app");
const DATA_DIR = path.join(REPO_ROOT, "data");

const DOMAIN_RE = /^https?:\/\/(?:www\.)?carboutiquejournal\.com(\/.*)$/i;

// -------------------------
// Taxonomy helpers (copied from lib/taxonomy/*, adapted to pure JS)
// -------------------------

function toSlug(input) {
  const v = String(input ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();

  if (!v) return "";

  return v
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function fnv1a32(input) {
  let hash = 0x811c9dc5;
  const s = String(input ?? "");
  for (let i = 0; i < s.length; i += 1) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function toStableKey(input, prefix) {
  const h = fnv1a32(input);
  const core = h.toString(36);
  const p = String(prefix ?? "key")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase() || "key";
  return `${p}-${core}`;
}

function safeString(value) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
}

// BodyType
const BODY_TYPE_KEY_OVERRIDES = {
  "セダン": "sedan",
  "クーペ": "coupe",
  "オープンカー": "open",
  "SUV/クロスオーバー": "suv-crossover",
  "SUV": "suv-crossover",
  "ハッチバック": "hatchback",
  "軽スポーツ": "kei-sports",
  "軽オープン": "kei-open",
  "軽ハッチバック": "kei-hatchback",
};

function normalizeBodyTypeLabel(raw) {
  const v = safeString(raw);
  if (!v) return "";
  // currently minimal (repo normalizer is simple); keep NFKC+trim
  return v;
}

function getBodyTypeKey(rawLabel) {
  const label = normalizeBodyTypeLabel(rawLabel);
  if (!label) return "";

  const override = BODY_TYPE_KEY_OVERRIDES[label];
  if (override) return override;

  const slug = toSlug(label);
  if (slug) return slug;

  return toStableKey(label, "bt");
}

// Segment
function normalizeSegmentLabel(raw) {
  const v = safeString(raw);
  if (!v) return "";
  let s = v.replace(/\s+/g, " ");
  s = s.replace(/\s*\/\s*/g, " / ");
  return s;
}

const SEGMENT_KEY_OVERRIDES = {
  "GT": "gt",
  "クラシックGT": "classic-gt",
  "クラシックスポーツ": "classic-sports",
  "クーペ": "coupe",
  "グランドツアラー": "grand-tourer",
  "スポーツ": "sports",
  "スポーツセダン": "sports-sedan",
  "スーパーカー": "supercar",
  "スーパースポーツ": "super-sports",
  "スーパースポーツ / HPEV": "super-sports-hpev",
  "ハイパーカー": "hypercar",
  "フラッグシップ": "flagship",
  "フラッグシップGT / スポーツ": "flagship-gt-sports",
  "プレミアムGT": "premium-gt",
  "プレミアムSUV": "premium-suv",
  "プレミアムスポーツ": "premium-sports",
  "プレミアムセダン": "premium-sedan",
  "ホットハッチ": "hot-hatch",
  "ホモロゲーション": "homologation",
  "ライトウェイト": "lightweight",
  "ライトスポーツ": "light-sports",
  "ラグジュアリーセダン": "luxury-sedan",
  "ラリー系スポーツ": "rally-sports",
  "軽スポーツ": "kei-sports",
};

function getSegmentKey(rawLabel) {
  const label = normalizeSegmentLabel(rawLabel);
  if (!label) return "";

  const override = SEGMENT_KEY_OVERRIDES[label];
  if (override) return override;

  const slug = toSlug(label);
  if (slug) return slug;

  return toStableKey(label, "seg");
}

// Maker
function normalizeMakerLabel(raw) {
  const v = safeString(raw);
  if (!v) return "";
  if (/[A-Za-z]/.test(v)) return v.toUpperCase();
  return v;
}

function normalizeMakerKey(raw) {
  const label = normalizeMakerLabel(raw);
  if (!label) return "";
  return toSlug(label);
}

// -------------------------
// IO helpers
// -------------------------

async function readJson(filePath) {
  const txt = await fs.readFile(filePath, "utf8");
  return JSON.parse(txt);
}

async function listJsonFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (ent.isFile() && ent.name.endsWith(".json")) {
      files.push(path.join(dirPath, ent.name));
    }
  }
  return files;
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    const p = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walk(p)));
    } else {
      out.push(p);
    }
  }
  return out;
}

function normalizePath(p) {
  if (!p) return "";
  let s = String(p).trim();
  if (!s) return "";

  // Absolute internal URL -> path
  const m = s.match(DOMAIN_RE);
  if (m && m[1]) s = m[1];

  // Keep only path (strip query/hash)
  s = s.split("#")[0];
  s = s.split("?")[0];

  // Ensure leading slash
  if (!s.startsWith("/")) return "";

  // Collapse multiple slashes
  s = s.replace(/\/+/g, "/");

  // Remove trailing slash (except root)
  if (s.length > 1) s = s.replace(/\/+$/, "");

  return s;
}

function stripTrailingPunct(s) {
  let out = String(s ?? "");
  while (out.length > 1 && /[\)\]\}\.,;:!\?"']$/.test(out)) {
    out = out.slice(0, -1);
  }
  return out;
}

function extractInternalPaths(text) {
  const s = String(text ?? "");
  const hits = new Set();

  // 1) Absolute internal URLs
  const absRe = /https?:\/\/(?:www\.)?carboutiquejournal\.com\/[^\s)"']+/gi;
  for (const m of s.matchAll(absRe)) {
    const raw = stripTrailingPunct(m[0]);
    hits.add(normalizePath(raw));
  }

  // 2) Relative paths for our main routes
  const relRe = /\/(?:cars|guide|column|heritage|news|compare|start|contact|privacy|site-map)(?:\/[A-Za-z0-9_-]+)*/g;
  for (const m of s.matchAll(relRe)) {
    const idx = typeof m.index === "number" ? m.index : -1;

    // Avoid false positives inside external URLs (e.g. https://example.com/news/123)
    if (idx > 0) {
      const prev = s[idx - 1];
      if (/[A-Za-z0-9._-]/.test(prev)) continue;
    }

    const raw = stripTrailingPunct(m[0]);
    hits.add(normalizePath(raw));
  }

  // Remove empties
  hits.delete("");

  return Array.from(hits);
}

// -------------------------
// Main
// -------------------------

async function main() {
  // Static routes from app/**/page.tsx (excluding dynamic segments and private routes)
  const files = await walk(APP_DIR);
  const staticRoutes = new Set();

  for (const f of files) {
    const rel = path.relative(APP_DIR, f).replace(/\\/g, "/");
    if (!rel.endsWith("/page.tsx") && rel !== "page.tsx") continue;

    const route = rel === "page.tsx" ? "/" : "/" + rel.replace(/\/page\.tsx$/, "");

    // Exclude dynamic and route groups
    if (route.includes("[")) continue;

    // Exclude private routes (/_internal etc)
    const segments = route.split("/").filter(Boolean);
    if (segments.some((seg) => seg.startsWith("_"))) continue;

    staticRoutes.add(route);
  }

  // Content slugs
  const carsDir = path.join(DATA_DIR, "articles", "cars");
  const guidesDir = path.join(DATA_DIR, "articles", "guides");
  const columnsDir = path.join(DATA_DIR, "articles", "columns");
  const heritageDir = path.join(DATA_DIR, "articles", "heritage");

  const carFiles = await listJsonFiles(carsDir);
  const guideFiles = await listJsonFiles(guidesDir);
  const columnFiles = await listJsonFiles(columnsDir);
  const heritageFiles = await listJsonFiles(heritageDir);

  const carSlugs = new Set();
  const guideSlugs = new Set();
  const columnSlugs = new Set();
  const heritageSlugs = new Set();

  const makerKeys = new Set();
  const bodyTypeKeys = new Set();
  const segmentKeys = new Set();

  const cars = [];

  for (const fp of carFiles) {
    const obj = await readJson(fp);
    if (obj?.slug) carSlugs.add(String(obj.slug));

    // maker
    const makerKey = String(obj?.makerKey ?? "").trim() || normalizeMakerKey(obj?.maker);
    if (makerKey) makerKeys.add(makerKey);

    // bodyType / segment
    const bt = getBodyTypeKey(obj?.bodyType);
    if (bt) bodyTypeKeys.add(bt);

    const seg = getSegmentKey(obj?.segment);
    if (seg) segmentKeys.add(seg);

    cars.push(obj);
  }

  for (const fp of guideFiles) {
    const obj = await readJson(fp);
    if (obj?.slug) guideSlugs.add(String(obj.slug));
  }

  for (const fp of columnFiles) {
    const obj = await readJson(fp);
    if (obj?.slug) columnSlugs.add(String(obj.slug));
  }

  for (const fp of heritageFiles) {
    const obj = await readJson(fp);
    if (obj?.slug) heritageSlugs.add(String(obj.slug));
  }

  // News ids (optional)
  const newsIds = new Set();
  try {
    const newsList = await readJson(path.join(DATA_DIR, "news-latest.json"));
    if (Array.isArray(newsList)) {
      for (const n of newsList) {
        if (n?.id) newsIds.add(String(n.id));
      }
    }
  } catch {
    // ignore
  }

  // Redirects
  const redirectSources = new Set();
  const redirectDestinations = [];
  try {
    const redirects = await readJson(path.join(DATA_DIR, "redirects.json"));
    if (Array.isArray(redirects)) {
      for (const r of redirects) {
        const src = normalizePath(r?.source);
        const dstRaw = r?.destination;
        const dst = typeof dstRaw === "string" ? normalizePath(dstRaw) : "";
        if (src) redirectSources.add(src);
        if (src && dst) redirectDestinations.push({ source: src, destination: dst });
      }
    }
  } catch {
    // ignore
  }

  const validContentPaths = new Set();

  for (const slug of carSlugs) validContentPaths.add(`/cars/${slug}`);
  for (const slug of guideSlugs) validContentPaths.add(`/guide/${slug}`);
  for (const slug of columnSlugs) validContentPaths.add(`/column/${slug}`);
  for (const slug of heritageSlugs) validContentPaths.add(`/heritage/${slug}`);
  for (const id of newsIds) validContentPaths.add(`/news/${id}`);

  // Known dynamic hubs (taxonomy)
  // - makers/body-types/segments values must be valid keys
  // We validate them on-demand when we see links.

  // Validate redirect destinations now (fail fast)
  const redirectErrors = [];
  for (const { source, destination } of redirectDestinations) {
    if (destination.startsWith("/")) {
      let ok =
        staticRoutes.has(destination) ||
        validContentPaths.has(destination) ||
        redirectSources.has(destination);

      if (!ok) {
        const makerM = destination.match(/^\/cars\/makers\/([^/]+)$/);
        const bodyTypeM = destination.match(/^\/cars\/body-types\/([^/]+)$/);
        const segmentM = destination.match(/^\/cars\/segments\/([^/]+)$/);
        if (makerM && makerKeys.has(makerM[1])) ok = true;
        if (bodyTypeM && bodyTypeKeys.has(bodyTypeM[1])) ok = true;
        if (segmentM && segmentKeys.has(segmentM[1])) ok = true;
      }
      if (!ok) {
        redirectErrors.push({ source, destination });
      }
    }
  }

  if (redirectErrors.length > 0) {
    console.error("\n[verify-internal-links] Redirect destinations invalid (redirect-to-404 risk):");
    for (const e of redirectErrors.slice(0, 50)) {
      console.error(` - ${e.source} -> ${e.destination}`);
    }
    console.error(`Total: ${redirectErrors.length}`);
    process.exit(1);
  }

  // Scan bodies
  const errors = [];

  const contentGroups = [
    { kind: "cars", files: carFiles },
    { kind: "guides", files: guideFiles },
    { kind: "columns", files: columnFiles },
    { kind: "heritage", files: heritageFiles },
  ];

  for (const group of contentGroups) {
    for (const fp of group.files) {
      const obj = await readJson(fp);
      const body = obj?.body;
      if (typeof body !== "string" || !body.trim()) continue;

      const paths = extractInternalPaths(body);
      for (const p of paths) {
        if (!p) continue;

        // Allow redirect sources
        if (redirectSources.has(p)) continue;

        // Static routes
        if (staticRoutes.has(p)) continue;

        // Content routes
        if (validContentPaths.has(p)) continue;

        // Taxonomy dynamic hubs
        // /cars/makers/<key>
        const makerM = p.match(/^\/cars\/makers\/([^/]+)$/);
        if (makerM) {
          const key = makerM[1];
          if (makerKeys.has(key)) continue;
          errors.push({ file: fp, path: p, reason: `unknown maker key: ${key}` });
          continue;
        }

        // /cars/body-types/<key>
        const bodyTypeM = p.match(/^\/cars\/body-types\/([^/]+)$/);
        if (bodyTypeM) {
          const key = bodyTypeM[1];
          if (bodyTypeKeys.has(key)) continue;
          errors.push({ file: fp, path: p, reason: `unknown bodyType key: ${key}` });
          continue;
        }

        // /cars/segments/<key>
        const segmentM = p.match(/^\/cars\/segments\/([^/]+)$/);
        if (segmentM) {
          const key = segmentM[1];
          if (segmentKeys.has(key)) continue;
          errors.push({ file: fp, path: p, reason: `unknown segment key: ${key}` });
          continue;
        }

        // If we reach here, it's an unknown internal path
        errors.push({ file: fp, path: p, reason: "not found" });
      }
    }
  }

  if (errors.length > 0) {
    console.error("\n[verify-internal-links] Broken internal links detected:");
    for (const e of errors.slice(0, 60)) {
      const rel = path.relative(REPO_ROOT, e.file).replace(/\\/g, "/");
      console.error(` - ${rel}: ${e.path} (${e.reason})`);
    }
    console.error(`Total: ${errors.length}`);
    process.exit(1);
  }

  console.log(
    `[verify-internal-links] OK. staticRoutes=${staticRoutes.size}, cars=${carSlugs.size}, guides=${guideSlugs.size}, columns=${columnSlugs.size}, heritage=${heritageSlugs.size}`,
  );
}

main().catch((err) => {
  console.error("\n[verify-internal-links] Failed with exception:");
  console.error(err);
  process.exit(1);
});
