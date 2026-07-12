import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import sharp from "sharp";

import {
  articlePath,
  collectExplicitPublicArticleLinks,
  hasSubstantiveArticleContent,
  isArticleDiscoverable,
  isRasterImageUrl,
  listArticleRecords,
  safeString,
} from "./lib/article-publication.mjs";

const ROOT = process.cwd();
const ALLOWED_DISPLAY_TAGS = new Set([
  "車選び", "中古車", "輸入車", "支払い", "維持費", "メンテナンス", "カスタム", "吸気",
  "足回り", "電装", "安全装置", "保険", "売却", "手続き", "トラブル",
]);
const ALLOWED_AUTHOR_NAMES = new Set(["CAR BOUTIQUE JOURNAL 編集部"]);
const RASTER_EXTENSIONS = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const SOURCE_DIRS = ["app", "components", "lib", "data"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"]);
const errors = [];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

async function listSourceFiles(relativeDir) {
  const absolute = path.join(ROOT, relativeDir);
  if (!fsSync.existsSync(absolute)) return [];
  const output = [];
  const entries = await fs.readdir(absolute, { withFileTypes: true });
  for (const entry of entries) {
    const relative = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) output.push(...await listSourceFiles(relative));
    else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) output.push(relative);
  }
  return output;
}

async function verifyOgImage(record) {
  const image = safeString(record.item?.ogImageUrl);
  if (!image) {
    fail(record.file, "index article requires an explicit raster ogImageUrl");
    return;
  }
  if (!isRasterImageUrl(image)) {
    fail(record.file, `ogImageUrl must be AVIF/JPEG/PNG/WebP, not ${image}`);
    return;
  }
  if (image.startsWith("/")) {
    const diskPath = path.join(ROOT, "public", image.replace(/^\/+/, "").split("?")[0].split("#")[0]);
    if (!fsSync.existsSync(diskPath)) fail(record.file, `ogImageUrl file does not exist: ${image}`);
    const ext = path.extname(diskPath).toLowerCase();
    if (!RASTER_EXTENSIONS.has(ext)) fail(record.file, `ogImageUrl extension is not raster: ${image}`);
    if (fsSync.existsSync(diskPath) && RASTER_EXTENSIONS.has(ext)) {
      try {
        const metadata = await sharp(diskPath).metadata();
        if (metadata.width !== 1200 || metadata.height !== 630) {
          fail(record.file, `ogImageUrl must be 1200x630 (actual ${metadata.width ?? "?"}x${metadata.height ?? "?"}): ${image}`);
        }
      } catch (error) {
        fail(record.file, `ogImageUrl cannot be decoded: ${image} (${error instanceof Error ? error.message : String(error)})`);
      }
    }
  } else if (!/^https:\/\//iu.test(image)) {
    fail(record.file, `ogImageUrl must be a public path or https URL: ${image}`);
  }
}

const records = await listArticleRecords(ROOT);
const discoverablePaths = new Set(records.filter((record) => isArticleDiscoverable(record.item)).map(articlePath));

for (const record of records) {
  const { item, file, group, name } = record;
  const expectedSlug = name.replace(/\.json$/u, "");
  const tag = safeString(item?.displayTag);

  if (item?.type !== group.type) fail(file, `type must be ${group.type}`);
  if (safeString(item?.slug) !== expectedSlug) fail(file, `filename and slug differ (${expectedSlug} != ${safeString(item?.slug)})`);
  if (tag && !ALLOWED_DISPLAY_TAGS.has(tag)) fail(file, `unknown displayTag: ${tag}`);

  const claimsIndex = item?.status === "published" && item?.publicState === "index" && item?.noindex !== true;
  if (claimsIndex && !hasSubstantiveArticleContent(item)) fail(file, "index article has no substantive body/detailSections");

  if (isArticleDiscoverable(item)) {
    if (!tag) fail(file, "discoverable article requires displayTag");
    await verifyOgImage(record);

    for (const target of collectExplicitPublicArticleLinks(item)) {
      if (!discoverablePaths.has(target)) fail(file, `public link points to missing/noindex/bodyless article: ${target}`);
    }
  }

  if (item?.authorProfile != null) {
    if (item.authorProfile?.kind !== "organization") fail(file, "authorProfile.kind must be organization");
    if (!ALLOWED_AUTHOR_NAMES.has(safeString(item.authorProfile?.name))) {
      fail(file, `authorProfile.name is not a verified editorial organization: ${safeString(item.authorProfile?.name) || "(empty)"}`);
    }
  }
}

for (const relativeFile of (await Promise.all(SOURCE_DIRS.map(listSourceFiles))).flat()) {
  const source = await fs.readFile(path.join(ROOT, relativeFile), "utf8");
  if (source.includes("山田太郎")) fail(relativeFile, "placeholder/fake author name is forbidden");
  if (/\breviewedBy\s*:/u.test(source) || /["']reviewedBy["']\s*:/u.test(source)) {
    fail(relativeFile, "reviewedBy must not be emitted without a verified reviewer");
  }
  if (/["']@type["']\s*:\s*["']Person["']/u.test(source)) {
    fail(relativeFile, "Person structured data is forbidden until a real person is verified");
  }
}

if (errors.length > 0) {
  console.error(`[verify-publication-integrity] ❌ ${errors.length} error(s)`);
  for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
  if (errors.length > 120) console.error(`... and ${errors.length - 120} more`);
  process.exit(1);
}

console.log(`[verify-publication-integrity] ✅ OK articles=${records.length}, discoverable=${discoverablePaths.size}`);
