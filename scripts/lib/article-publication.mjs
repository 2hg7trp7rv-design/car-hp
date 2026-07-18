import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

export const ARTICLE_GROUPS = [
  { type: "GUIDE", dir: "data/articles/guides", prefix: "/guide" },
  { type: "COLUMN", dir: "data/articles/columns", prefix: "/column" },
];

export function safeString(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim() : "";
}

export function hasSubstantiveArticleContent(item) {
  if (safeString(item?.body)) return true;
  return Array.isArray(item?.detailSections) && item.detailSections.some((section) =>
    safeString(section?.title) &&
    Array.isArray(section?.blocks) &&
    section.blocks.some(Boolean));
}

export function isArticleDiscoverable(item) {
  return Boolean(
    safeString(item?.slug) &&
    safeString(item?.title) &&
    item?.status === "published" &&
    item?.publicState === "index" &&
    item?.noindex === false &&
    hasSubstantiveArticleContent(item),
  );
}

export async function listArticleRecords(root = process.cwd()) {
  const records = [];
  for (const group of ARTICLE_GROUPS) {
    const absoluteDir = path.join(root, group.dir);
    if (!fsSync.existsSync(absoluteDir)) continue;
    const names = (await fs.readdir(absoluteDir)).filter((name) => name.endsWith(".json")).sort();
    for (const name of names) {
      const file = path.posix.join(group.dir, name);
      const raw = await fs.readFile(path.join(root, file), "utf8");
      records.push({ group, file, name, item: JSON.parse(raw) });
    }
  }
  return records;
}

export function articlePath(record) {
  const slug = safeString(record?.item?.slug);
  return slug ? `${record.group.prefix}/${slug}` : record.group.prefix;
}

export function normalizeInternalArticlePath(value) {
  let candidate = safeString(value);
  if (!candidate) return "";

  const absolute = candidate.match(/^https?:\/\/(?:www\.)?carboutiquejournal\.com(\/.*)$/iu);
  if (absolute) candidate = absolute[1];
  candidate = candidate.split("#")[0].split("?")[0];
  if (!/^\/(guide|column)\/[A-Za-z0-9_-]+\/?$/u.test(candidate)) return "";
  return candidate.replace(/\/+$/u, "");
}

function collectStrings(value, output = []) {
  if (value == null) return output;
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStrings(entry, output);
    return output;
  }
  if (typeof value === "object") {
    for (const entry of Object.values(value)) collectStrings(entry, output);
  }
  return output;
}

/**
 * Planning relationships are intentionally excluded. This scans fields that
 * are rendered to readers, including action hrefs and Markdown links.
 */
export function collectExplicitPublicArticleLinks(item) {
  const publicContent = {
    body: item?.body,
    lead: item?.lead,
    keyPoints: item?.keyPoints,
    checkpoints: item?.checkpoints,
    faq: item?.faq,
    actionBox: item?.actionBox,
    breadcrumbTrail: item?.breadcrumbTrail,
    detailSections: item?.detailSections,
    articleDesign: item?.articleDesign,
  };

  const links = new Set();
  for (const text of collectStrings(publicContent)) {
    const markdownOrHtml = /(?:\]\(|href\s*=\s*["'])(https?:\/\/(?:www\.)?carboutiquejournal\.com)?(\/(?:guide|column)\/[A-Za-z0-9_-]+)(?:[?#][^\s)"']*)?/giu;
    for (const match of text.matchAll(markdownOrHtml)) {
      const normalized = normalizeInternalArticlePath(match[2]);
      if (normalized) links.add(normalized);
    }

    const bare = /(^|[^A-Za-z0-9_.-])(https?:\/\/(?:www\.)?carboutiquejournal\.com)?(\/(?:guide|column)\/[A-Za-z0-9_-]+)(?=$|[^A-Za-z0-9_/?#-])/giu;
    for (const match of text.matchAll(bare)) {
      const normalized = normalizeInternalArticlePath(match[3]);
      if (normalized) links.add(normalized);
    }
  }
  return [...links];
}

export function isRasterImageUrl(value) {
  const image = safeString(value).split("#")[0].split("?")[0];
  return /\.(?:avif|jpe?g|png|webp)$/iu.test(image);
}
