import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STRICT_QUALITY = process.env.CBJ_STRICT_QUALITY === "1";

const ARTICLE_GROUPS = [
  { type: "GUIDE", dir: "data/articles/guides", prefix: "/guide" },
  { type: "COLUMN", dir: "data/articles/columns", prefix: "/column" },
];

const asString = (value) => typeof value === "string" ? value.trim() : "";

function collectText(value, out = []) {
  if (value == null) return out;
  if (typeof value === "string") {
    const s = value.trim();
    if (s) out.push(s);
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

async function listJsonFiles(relDir) {
  const abs = path.join(ROOT, relDir);
  if (!fsSync.existsSync(abs)) return [];
  const names = (await fs.readdir(abs)).filter((name) => name.endsWith(".json")).sort();
  return names.map((name) => path.posix.join(relDir, name));
}

async function readJson(rel) {
  return JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
}

function isPublished(item) {
  return String(item?.status ?? "") === "published";
}

function publicState(item) {
  return asString(item?.publicState).toLowerCase();
}

function contentText(item) {
  return collectText({
    body: item?.body,
    lead: item?.lead,
    summary: item?.summary,
    keyPoints: item?.keyPoints,
    checkpoints: item?.checkpoints,
    detailSections: item?.detailSections,
    faq: item?.faq,
    actionBox: item?.actionBox,
    articleDesign: item?.articleDesign,
  }).join("\n").trim();
}

const report = {
  generatedAt: new Date().toISOString(),
  summary: { total: 0, byType: {}, index: 0, noindex: 0, draft: 0, redirect: 0, errors: 0, warnings: 0 },
  items: [],
};

for (const group of ARTICLE_GROUPS) {
  const files = await listJsonFiles(group.dir);
  report.summary.byType[group.type] = files.length;
  for (const file of files) {
    let item;
    const errors = [];
    const warnings = [];
    try {
      item = await readJson(file);
    } catch (error) {
      errors.push(`JSON parse failed: ${error.message}`);
      item = {};
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push("article file must contain exactly one JSON object");
      item = {};
    }

    const slug = asString(item?.slug);
    const title = asString(item?.title);
    const state = publicState(item);
    const text = contentText(item);
    const bodyLen = text.length;
    const url = slug ? `${group.prefix}/${slug}` : group.prefix;

    if (!slug) errors.push("missing slug");
    if (!title) errors.push("missing title");
    if (!Object.prototype.hasOwnProperty.call(item, "status")) errors.push("missing status");
    if (!Object.prototype.hasOwnProperty.call(item, "publicState")) errors.push("missing publicState");
    if (!Object.prototype.hasOwnProperty.call(item, "noindex")) errors.push("missing noindex");
    else if (typeof item.noindex !== "boolean") errors.push("noindex must be boolean");
    if (!isPublished(item)) warnings.push("status is not published");
    if (!["index", "noindex", "draft", "redirect"].includes(state)) errors.push(`invalid publicState: ${state}`);
    if (state === "index" && bodyLen === 0) errors.push("index article has no public body");
    const isIntentionalTitleOnlyGuide = group.type === "GUIDE" && state === "noindex" && bodyLen === 0;
    if (state === "noindex" && bodyLen === 0 && !isIntentionalTitleOnlyGuide) {
      warnings.push("noindex article has title/metadata only");
    }
    if (STRICT_QUALITY && state === "index" && bodyLen < 1200) warnings.push("index article body is short");

    report.summary.total += 1;
    if (state in report.summary) report.summary[state] += 1;
    report.summary.errors += errors.length;
    report.summary.warnings += warnings.length;
    report.items.push({ type: group.type, url, file, publicState: state, metrics: { bodyLen }, errors, warnings });
  }
}

const outPath = path.join(ROOT, "src", "generated", "audit.generated.json");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(report, null, 2) + "\n", "utf8");

if (report.summary.errors > 0) {
  console.error(`[content-audit] ❌ errors=${report.summary.errors}`);
  for (const item of report.items.filter((entry) => entry.errors.length > 0)) {
    console.error(`- ${item.file}: ${item.errors.join("; ")}`);
  }
  process.exit(1);
}

console.log(`[content-audit] ✅ OK total=${report.summary.total}, index=${report.summary.index}, noindex=${report.summary.noindex}, warnings=${report.summary.warnings}`);
