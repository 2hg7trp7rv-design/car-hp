import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GUIDES_DIR = path.join(ROOT, "data", "articles", "guides");

const REQUIRED_BASE_FIELDS = [
  "id",
  "slug",
  "type",
  "status",
  "publicState",
  "title",
];

const TITLE_ONLY_ALLOWED_FIELDS = new Set([
  "id",
  "slug",
  "type",
  "status",
  "publicState",
  "noindex",
  "title",
  "titleJa",
]);

const CONTENT_FIELDS = new Set([
  "summary",
  "seoTitle",
  "seoDescription",
  "description",
  "lead",
  "body",
  "category",
  "readMinutes",
  "heroImage",
  "thumbnail",
  "displayTag",
  "eyebrowLabel",
  "breadcrumbTrail",
  "authorProfile",
  "keyPoints",
  "checkpoints",
  "faq",
  "actionBox",
  "detailSections",
  "articleDesign",
  "monetizeKey",
  "monetizeType",
  "affiliateLinks",
  "internalLinks",
  "ctaVariants",
  "layoutVariant",
  "parentPillarId",
  "relatedClusterIds",
  "primaryQuery",
  "updateReason",
  "sources",
  "tags",
  "intentTags",
  "relatedGuideSlugs",
  "relatedColumnSlugs",
  "canonicalUrl",
  "ogImageUrl",
  "publishedAt",
  "updatedAt",
  "createdAt",
]);

const errors = [];
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const hasContentValue = (value) => {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

if (fsSync.existsSync(GUIDES_DIR)) {
  const names = (await fs.readdir(GUIDES_DIR)).filter((name) => name.endsWith(".json")).sort();
  for (const name of names) {
    const file = path.posix.join("data/articles/guides", name);
    let article;
    try {
      article = JSON.parse(await fs.readFile(path.join(GUIDES_DIR, name), "utf8"));
    } catch (error) {
      errors.push(`${file}: JSONを読み込めません: ${error.message}`);
      continue;
    }

    for (const field of REQUIRED_BASE_FIELDS) {
      if (!(field in article)) errors.push(`${file}: ${field} が必要です`);
    }
    if (article.type !== "GUIDE") errors.push(`${file}: type は GUIDE が必要です`);
    if (!nonEmpty(article.slug)) errors.push(`${file}: slug が空です`);
    if (!nonEmpty(article.title)) errors.push(`${file}: title が空です`);

    const isTitleOnlyGuide = article.publicState === "noindex" &&
      !Array.from(CONTENT_FIELDS).some((field) => hasContentValue(article[field]));

    if (isTitleOnlyGuide) {
      for (const field of Object.keys(article)) {
        if (!TITLE_ONLY_ALLOWED_FIELDS.has(field)) {
          errors.push(`${file}: title-only guide に ${field} を残さないでください`);
        }
      }
      continue;
    }

    if (article.publicState === "index") {
      const hasBody = nonEmpty(article.body) || Array.isArray(article.detailSections) || article?.articleDesign?.version;
      if (!hasBody) errors.push(`${file}: index guide には本文またはdetailSectionsが必要です`);
    }
  }
}

if (errors.length > 0) {
  console.error("[verify-guide-decision-json] ❌");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("[verify-guide-decision-json] ✅ OK");
