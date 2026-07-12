import fs from "node:fs/promises";
import path from "node:path";

import {
  isArticleDiscoverable,
  isRasterImageUrl,
  listArticleRecords,
  safeString,
} from "./lib/article-publication.mjs";

const ROOT = process.cwd();
const errors = [];
const records = (await listArticleRecords(ROOT)).filter((record) => isArticleDiscoverable(record.item));

for (const record of records) {
  const slug = safeString(record.item.slug);
  const segment = record.group.type === "GUIDE" ? "guide" : "column";
  const relativeHtml = `.next/server/app/${segment}/${slug}.html`;
  let html = "";
  try {
    html = await fs.readFile(path.join(ROOT, relativeHtml), "utf8");
  } catch (error) {
    errors.push(`${record.file}: generated HTML missing (${relativeHtml}): ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  const expectedImage = safeString(record.item.ogImageUrl);
  if (!isRasterImageUrl(expectedImage)) {
    errors.push(`${record.file}: expected raster ogImageUrl before build verification`);
  } else if (!html.includes(expectedImage)) {
    errors.push(`${record.file}: generated metadata does not contain ogImageUrl ${expectedImage}`);
  }
  if (!html.includes('property="og:image"')) errors.push(`${record.file}: generated HTML is missing og:image metadata`);
  if (html.includes('"@type":"Person"')) errors.push(`${record.file}: generated JSON-LD contains an unverified Person`);
  if (html.includes("reviewedBy")) errors.push(`${record.file}: generated JSON-LD contains reviewedBy`);
  if (!html.includes('"@type":"Organization"')) errors.push(`${record.file}: generated JSON-LD is missing Organization`);
}

if (errors.length > 0) {
  console.error(`[verify-built-article-metadata] ❌ ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[verify-built-article-metadata] ✅ OK (${records.length} generated articles)`);
