// scripts/validate-content.mjs
// Content integrity checks for CAR BOUTIQUE.
//
// Goals (non-breaking):
// - Prevent missing related targets (broken internal circulation)
// - Prevent duplicate slugs within a category
// - Prevent invalid JSON / unexpected shapes
//
// This script is intentionally dependency-free (Node.js only).

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const publicDir = path.join(ROOT, "public");

/** @param {string} p */
function readJson(p) {
  const abs = path.join(ROOT, p);
  const raw = fs.readFileSync(abs, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON: ${p}`);
  }
}

/**
 * Returns true if an asset path like "/images/..." exists under /public.
 * Only checks local absolute paths (starting with "/").
 * @param {string} assetPath
 */
function publicAssetExists(assetPath) {
  if (typeof assetPath !== "string") return true;
  if (!assetPath.startsWith("/")) return true;
  // Ignore query strings
  const clean = assetPath.split("?")[0];
  const fp = path.join(publicDir, clean);
  try {
    return fs.existsSync(fp);
  } catch {
    return false;
  }
}

/**
 * Validate local asset references (heroImage, mainImage, imageUrl, etc.).
 * In non-strict mode it's a warning, because some repos keep images external.
 * In strict mode it becomes an error.
 * @param {string} file
 * @param {string} type
 * @param {string} slug
 * @param {string} field
 * @param {unknown} value
 */
function checkLocalAsset(file, type, slug, field, value) {
  if (typeof value !== "string" || !value.trim()) return;
  if (!value.startsWith("/")) return; // remote URLs are fine
  // We only enforce images/ paths to avoid breaking non-asset fields.
  if (!value.startsWith("/images/")) return;
  if (!publicAssetExists(value)) {
    reqWarn(`${file}: ${type}:${slug} ${field} points to missing public asset: ${value}`);
  }
}

/**
 * ISO-ish date string check (warning; strict => error)
 * @param {string} file
 * @param {string} type
 * @param {string} slug
 * @param {string} field
 * @param {unknown} value
 */
function checkDateLike(file, type, slug, field, value) {
  if (value == null) return;
  if (typeof value !== "string") {
    reqWarn(`${file}: ${type}:${slug} ${field} should be a string date`);
    return;
  }
  const v = value.trim();
  if (!v) {
    reqWarn(`${file}: ${type}:${slug} ${field} is empty`);
    return;
  }
  // Accept YYYY-MM-DD or ISO datetime
  const ok = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(:\d{2})?(?:\.\d+)?(?:Z|[+\-]\d{2}:?\d{2})?)?$/.test(v);
  if (!ok) reqWarn(`${file}: ${type}:${slug} ${field} is not ISO-like: "${v}"`);
}

/** @param {unknown} v */
function isStringArray(v) {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/**
 * Repository 層と同じく「配列 or 単体文字列 or null/undefined」を許容して
 * string[] に正規化する。
 * @param {unknown} value
 * @returns {string[] | null} null は「型不正」扱い
 */
function coerceSlugList(value) {
  if (value == null) return [];
  if (typeof value === "string") {
    const v = value.trim();
    return v ? [v] : [];
  }
  if (isStringArray(value)) {
    return value.map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(value)) {
    // 配列だけど混在している場合は、文字列のみ拾って warning。
    const picked = value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    return picked;
  }
  return null;
}

/** @param {string[]} arr */
function uniq(arr) {
  return Array.from(new Set(arr));
}

/** @param {string} label */
function hr(label) {
  return `\n=== ${label} ===`;
}

const errors = [];
const warnings = [];

const STRICT_VALIDATE = process.env.STRICT_VALIDATE === '1';

function err(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function reqWarn(msg) {
  if (STRICT_VALIDATE) err(msg);
  else warn(msg);
}

/**
 * Basic slug hygiene (warning only). URLs are category-scoped, but format issues still hurt UX/SEO.
 * @param {string} file
 * @param {string} type
 * @param {string} slug
 */
function warnSlugHygiene(file, type, slug) {
  if (!slug) return;
  if (/[A-Z]/.test(slug)) warn(`${file}: ${type}:${slug} contains uppercase (prefer kebab-case lowercase)`);
  if (/\s/.test(slug)) err(`${file}: ${type}:${slug} contains whitespace (invalid slug)`);
  if (!/^[a-z0-9][a-z0-9\-]*[a-z0-9]$/.test(slug)) {
    warn(`${file}: ${type}:${slug} has non-standard characters (recommend [a-z0-9-])`);
  }
  if (slug.includes('--')) warn(`${file}: ${type}:${slug} contains "--" (avoid double hyphen)`);
  if (slug.length > 80) warn(`${file}: ${type}:${slug} is long (${slug.length} chars) — may be hard to share/search`);
}

/**
 * Non-breaking recommended fields per content type (warning only).
 * @param {string} file
 * @param {string} type
 * @param {any} it
 */
function warnRecommendedFields(file, type, it) {
  const slug = typeof it?.slug === 'string' ? it.slug : '(unknown slug)';
  const miss = (k) => it == null || it[k] == null || (typeof it[k] === 'string' && !it[k].trim());
  if (type === 'CAR') {
    if (miss('name')) reqWarn(`${file}: CAR:${slug} missing name`);
    if (miss('maker')) reqWarn(`${file}: CAR:${slug} missing maker`);
    if (it.releaseYear == null) reqWarn(`${file}: CAR:${slug} missing releaseYear`);
    if (miss('summary')) reqWarn(`${file}: CAR:${slug} missing summary`);
    if (miss('heroImage')) reqWarn(`${file}: CAR:${slug} missing heroImage`);
    checkLocalAsset(file, 'CAR', slug, 'heroImage', it.heroImage);
    if (!miss('imageUrl')) checkLocalAsset(file, 'CAR', slug, 'imageUrl', it.imageUrl);
    if (!miss('mainImage')) checkLocalAsset(file, 'CAR', slug, 'mainImage', it.mainImage);
  }
  if (type === 'GUIDE' || type === 'COLUMN') {
    if (miss('title')) reqWarn(`${file}: ${type}:${slug} missing title`);
    if (miss('summary')) reqWarn(`${file}: ${type}:${slug} missing summary`);
    if (miss('body')) reqWarn(`${file}: ${type}:${slug} missing body`);
    if (miss('heroImage')) reqWarn(`${file}: ${type}:${slug} missing heroImage`);
    checkLocalAsset(file, type, slug, 'heroImage', it.heroImage);
    checkDateLike(file, type, slug, 'publishedAt', it.publishedAt);
    checkDateLike(file, type, slug, 'updatedAt', it.updatedAt);
    if (type === 'COLUMN') {
      if (miss('targetKeyword')) reqWarn(`${file}: COLUMN:${slug} missing targetKeyword`);
    }
  }
  if (type === 'HERITAGE') {
    if (miss('titleJa') && miss('title')) reqWarn(`${file}: HERITAGE:${slug} missing titleJa/title`);
    if (miss('seoTitle')) reqWarn(`${file}: HERITAGE:${slug} missing seoTitle`);
    if (miss('status')) reqWarn(`${file}: HERITAGE:${slug} missing status`);
    if (miss('kind')) reqWarn(`${file}: HERITAGE:${slug} missing kind`);
    if (miss('heroImage')) reqWarn(`${file}: HERITAGE:${slug} missing heroImage`);
    if (miss('lead')) reqWarn(`${file}: HERITAGE:${slug} missing lead`);
    if (miss('summary')) reqWarn(`${file}: HERITAGE:${slug} missing summary`);
    checkLocalAsset(file, 'HERITAGE', slug, 'heroImage', it.heroImage);
    checkDateLike(file, 'HERITAGE', slug, 'publishedAt', it.publishedAt);
    // Minimum structure: at least 1 section with title+summary
    const sections = it?.sections;
    if (!Array.isArray(sections) || sections.length === 0) {
      reqWarn(`${file}: HERITAGE:${slug} sections should be a non-empty array`);
    } else {
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (!sec || typeof sec !== 'object') {
          reqWarn(`${file}: HERITAGE:${slug} sections[${i}] should be an object`);
          continue;
        }
        const secMiss = (k) => sec[k] == null || (typeof sec[k] === 'string' && !sec[k].trim());
        if (secMiss('title')) reqWarn(`${file}: HERITAGE:${slug} sections[${i}] missing title`);
        if (secMiss('summary')) reqWarn(`${file}: HERITAGE:${slug} sections[${i}] missing summary`);
      }
    }
  }
}

/**
 * Warn if related references itself (non-fatal).
 * @param {string} type
 * @param {string} slug
 * @param {string[]} list
 * @param {string} field
 */
function warnSelfReference(type, slug, list, field) {
  if (!slug) return;
  if (list.includes(slug)) warn(`${type}:${slug}: ${field} contains self reference`);
}

/**
 * @param {string} file
 * @param {string} expectedType
 */
function loadContentFile(file, expectedType) {
  const data = readJson(file);
  if (!Array.isArray(data)) {
    err(`${file}: expected an array`);
    return [];
  }

  /** @type {any[]} */
  const items = data;
  for (const it of items) {
    if (!it || typeof it !== "object") {
      err(`${file}: item is not an object`);
      continue;
    }
    if (typeof it.slug !== "string" || !it.slug.trim()) {
      err(`${file}: item has invalid slug`);
    }
    // type は repository 層が正規化するため、データ側の欠落は許容。
    // ただし明示されている場合に不一致だと混乱の原因になるので warning にする。
    if (typeof it.type === "string" && it.type !== expectedType) {
      warn(`${file}: ${it.slug ?? "(unknown slug)"} has type=${String(it.type)} (expected ${expectedType}; repository will normalize)`);
    }
    // Use expectedType as the effective type for validation messages/ownership.
    if (typeof it.type !== "string" || !it.type) it.type = expectedType;
    if (typeof it.slug === "string") warnSlugHygiene(file, expectedType, it.slug);
    warnRecommendedFields(file, expectedType, it);
  }
  return items;
}

/**
 * @param {any[]} items
 * @param {string} label
 */
function assertUniqueSlugs(items, label) {
  const seen = new Map();
  for (const it of items) {
    const s = typeof it?.slug === "string" ? it.slug : "";
    if (!s) continue;
    const prev = seen.get(s);
    if (prev) {
      err(`${label}: duplicate slug "${s}" (ids: ${prev} / ${it.id ?? "?"})`);
    } else {
      seen.set(s, it.id ?? "?");
    }
  }
}

/**
 * @param {string} ownerType
 * @param {string} ownerSlug
 * @param {string} fieldName
 * @param {unknown} value
 * @param {Set<string>} targetSlugs
 * @param {string} targetLabel
 */
function validateSlugList(ownerType, ownerSlug, fieldName, value, targetSlugs, targetLabel) {
  if (value == null) return;
  const list = coerceSlugList(value);
  if (list === null) {
    err(`${ownerType}:${ownerSlug}: ${fieldName} must be string[] | string`);
    return;
  }
  const dups = list.length !== uniq(list).length;
  if (dups) {
    warn(`${ownerType}:${ownerSlug}: ${fieldName} contains duplicate slugs`);
  }
  warnSelfReference(ownerType, ownerSlug, list, fieldName);
  for (const s of list) {
    if (!targetSlugs.has(s)) {
      err(`${ownerType}:${ownerSlug}: ${fieldName} references missing ${targetLabel} slug "${s}"`);
    }
  }
}

/**
 * Validate new related.{cars,guides,columns,heritage}
 * @param {any} it
 * @param {{cars:Set<string>,guides:Set<string>,columns:Set<string>,heritage:Set<string>}} idx
 */
function validateNewRelated(it, idx) {
  if (!it?.related) return;
  const rel = it.related;
  if (typeof rel !== "object") {
    err(`${it.type}:${it.slug}: related must be an object`);
    return;
  }

  validateSlugList(it.type, it.slug, "related.cars", rel.cars, idx.cars, "CAR");
  validateSlugList(it.type, it.slug, "related.guides", rel.guides, idx.guides, "GUIDE");
  validateSlugList(it.type, it.slug, "related.columns", rel.columns, idx.columns, "COLUMN");
  validateSlugList(it.type, it.slug, "related.heritage", rel.heritage, idx.heritage, "HERITAGE");
}

/**
 * Validate legacy related*Slugs
 * @param {any} it
 * @param {{cars:Set<string>,guides:Set<string>,columns:Set<string>,heritage:Set<string>}} idx
 */
function validateLegacyRelated(it, idx) {
  validateSlugList(it.type, it.slug, "relatedCarSlugs", it.relatedCarSlugs, idx.cars, "CAR");
  validateSlugList(it.type, it.slug, "relatedGuideSlugs", it.relatedGuideSlugs, idx.guides, "GUIDE");
  validateSlugList(it.type, it.slug, "relatedColumnSlugs", it.relatedColumnSlugs, idx.columns, "COLUMN");
  validateSlugList(it.type, it.slug, "relatedHeritageSlugs", it.relatedHeritageSlugs, idx.heritage, "HERITAGE");
}

/**
 * Warn when both new+legacy exist and diverge.
 * @param {any} it
 */
function warnIfRelatedDiverges(it) {
  if (!it?.related) return;
  // Compare only when both are present.
  const pairs = [
    ["cars", "relatedCarSlugs"],
    ["guides", "relatedGuideSlugs"],
    ["columns", "relatedColumnSlugs"],
    ["heritage", "relatedHeritageSlugs"],
  ];
  for (const [k, legacyKey] of pairs) {
    const newer = it.related?.[k];
    const legacy = it[legacyKey];
    if (!newer || !legacy) continue;
    const a0 = coerceSlugList(newer);
    const b0 = coerceSlugList(legacy);
    if (a0 == null || b0 == null) continue;
    const a = uniq(a0);
    const b = uniq(b0);
    const same = a.length === b.length && a.every((x) => b.includes(x));
    if (!same) {
      warn(`${it.type}:${it.slug}: related.${k} differs from ${legacyKey} (new is preferred; consider migrating)`);
    }
  }
}

/**
 * @param {any} heritageItem
 * @param {{cars:Set<string>,guides:Set<string>,columns:Set<string>}} idx
 */
function validateHeritageSections(heritageItem, idx) {
  const sections = heritageItem?.sections;
  if (sections == null) return;
  if (!Array.isArray(sections)) {
    err(`HERITAGE:${heritageItem.slug}: sections must be an array`);
    return;
  }
  for (const sec of sections) {
    if (!sec || typeof sec !== "object") {
      err(`HERITAGE:${heritageItem.slug}: section must be an object`);
      continue;
    }
    if (sec.carSlugs) validateSlugList("HERITAGE", heritageItem.slug, `sections[].carSlugs`, sec.carSlugs, idx.cars, "CAR");
    if (sec.guideSlugs) validateSlugList("HERITAGE", heritageItem.slug, `sections[].guideSlugs`, sec.guideSlugs, idx.guides, "GUIDE");
    if (sec.columnSlugs) validateSlugList("HERITAGE", heritageItem.slug, `sections[].columnSlugs`, sec.columnSlugs, idx.columns, "COLUMN");
  }
}

// ------------------------------
// Load core data
// ------------------------------
const cars = loadContentFile("data/cars.json", "CAR");
const columns = loadContentFile("data/columns.json", "COLUMN");
const guides = loadContentFile("data/guides.json", "GUIDE");
const heritage = loadContentFile("data/heritage.json", "HERITAGE");

assertUniqueSlugs(cars, "CAR");
assertUniqueSlugs(columns, "COLUMN");
assertUniqueSlugs(guides, "GUIDE");
assertUniqueSlugs(heritage, "HERITAGE");

const idx = {
  cars: new Set(cars.map((x) => x.slug).filter(Boolean)),
  columns: new Set(columns.map((x) => x.slug).filter(Boolean)),
  guides: new Set(guides.map((x) => x.slug).filter(Boolean)),
  heritage: new Set(heritage.map((x) => x.slug).filter(Boolean)),
};

const allItems = [...cars, ...columns, ...guides, ...heritage];

for (const it of allItems) {
  if (!it?.slug || !it?.type) continue;
  validateNewRelated(it, idx);
  validateLegacyRelated(it, idx);
  warnIfRelatedDiverges(it);
}

for (const h of heritage) {
  validateHeritageSections(h, { cars: idx.cars, guides: idx.guides, columns: idx.columns });
}

// ------------------------------
// Report
// ------------------------------
console.log(hr("Content Validation"));
console.log(`CAR: ${cars.length} | COLUMN: ${columns.length} | GUIDE: ${guides.length} | HERITAGE: ${heritage.length}`);

if (warnings.length) {
  console.log(hr(`Warnings (${warnings.length})`));
  for (const w of warnings) console.log(`- ${w}`);
}

if (errors.length) {
  console.log(hr(`Errors (${errors.length})`));
  for (const e of errors) console.log(`- ${e}`);
  process.exit(1);
}

console.log(hr("Result"));
console.log("OK");
