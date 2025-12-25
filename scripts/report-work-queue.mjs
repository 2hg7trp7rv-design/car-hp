/**
 * report-work-queue.mjs
 * Generates a prioritized work queue from docs/reports/missing-assets.json.
 * Output:
 *  - docs/reports/work-queue.md
 *  - docs/reports/work-queue.json
 *
 * This is informational only (does not fail builds).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "docs", "reports", "missing-assets.json");
const OUT_MD = path.join(ROOT, "docs", "reports", "work-queue.md");
const OUT_JSON = path.join(ROOT, "docs", "reports", "work-queue.json");

function parseRef(ref) {
  const idx = ref.indexOf(":");
  if (idx === -1) return { type: "UNKNOWN", slug: ref };
  return { type: ref.slice(0, idx), slug: ref.slice(idx + 1) };
}

function parseDetail(detail) {
  const idx = detail.indexOf(":");
  if (idx === -1) return { field: detail.trim(), value: "" };
  return { field: detail.slice(0, idx).trim(), value: detail.slice(idx + 1).trim() };
}

const typeWeight = { HERITAGE: 5, COLUMN: 3, GUIDE: 2, CAR: 1, UNKNOWN: 1 };

const raw = JSON.parse(fs.readFileSync(SRC, "utf-8"));
const items = raw.groups?.missing_image ?? [];
const base = raw.groups?.missing_base ?? [];

const occ = [];
for (const it of items) {
  const { type, slug } = parseRef(it.ref);
  const { field, value } = parseDetail(it.detail);
  occ.push({ type, slug, field, path: value, ref: `${type}:${slug}` });
}

const pathCount = new Map();
const pathRefs = new Map();
const pathTypeDist = new Map();
const refPathFields = new Map();

for (const o of occ) {
  pathCount.set(o.path, (pathCount.get(o.path) ?? 0) + 1);
  if (!pathRefs.has(o.path)) pathRefs.set(o.path, new Set());
  pathRefs.get(o.path).add(o.ref);

  if (!pathTypeDist.has(o.path)) pathTypeDist.set(o.path, new Map());
  const m = pathTypeDist.get(o.path);
  m.set(o.type, (m.get(o.type) ?? 0) + 1);

  const k = `${o.ref}@@${o.path}`;
  if (!refPathFields.has(k)) refPathFields.set(k, new Set());
  refPathFields.get(k).add(o.field);
}

function scoreForPath(p) {
  const refs = [...(pathRefs.get(p) ?? [])];
  return refs.reduce((s, r) => s + (typeWeight[r.split(":")[0]] ?? 1), 0);
}

function tierForPath(p) {
  const dist = pathTypeDist.get(p) ?? new Map();
  if ((dist.get("HERITAGE") ?? 0) > 0) return "S";
  const refs = (pathRefs.get(p) ?? new Set()).size;
  if ((dist.get("COLUMN") ?? 0) > 0 && refs >= 2) return "A";
  if ((dist.get("COLUMN") ?? 0) > 0) return "B";
  if ((dist.get("GUIDE") ?? 0) > 0) return "C";
  return "D";
}

const all = [...pathCount.keys()].map((p) => {
  const refs = [...(pathRefs.get(p) ?? [])].sort();
  const distMap = pathTypeDist.get(p) ?? new Map();
  const typeDist = Object.fromEntries(distMap.entries());
  return {
    path: p,
    occurrences: pathCount.get(p),
    uniqueRefs: refs.length,
    score: scoreForPath(p),
    typeDist,
    refs: refs.slice(0, 12).map((r) => {
      const k = `${r}@@${p}`;
      return { ref: r, fields: [...(refPathFields.get(k) ?? [])].sort() };
    }),
  };
});

all.sort((a, b) => (b.score - a.score) || (b.uniqueRefs - a.uniqueRefs) || (b.occurrences - a.occurrences));

const tiers = { S: [], A: [], B: [], C: [], D: [] };
for (const it of all) tiers[tierForPath(it.path)].push(it);

const now = new Date().toISOString();

function mdItem(it, maxRefs = 8) {
  const lines = [];
  lines.push(`- \`${it.path}\`  (score **${it.score}**, refs ${it.uniqueRefs}, occ ${it.occurrences}, types ${JSON.stringify(it.typeDist)})`);
  const shown = it.refs.slice(0, maxRefs);
  for (const r of shown) {
    lines.push(`  - ${r.ref} — ${r.fields.join(", ")}`);
  }
  if (it.uniqueRefs > maxRefs) lines.push(`  - … +${it.uniqueRefs - maxRefs} refs`);
  return lines.join("\n");
}

const summary = {
  missingImageOccurrences: items.length,
  missingImageUniquePaths: all.length,
  missingBaseCount: base.length,
};

let md = "";
md += "# Work Queue: Content / Assets\n\n";
md += `Generated: ${raw.generatedAt ?? ""} (queue generated ${now})\n\n`;
md += "## Summary\n";
md += `- Missing images (occurrences): **${summary.missingImageOccurrences}**\n`;
md += `- Missing images (unique files): **${summary.missingImageUniquePaths}**\n`;
md += `- Missing base fields: **${summary.missingBaseCount}**\n\n`;

md += "## Quick wins (top 20 by impact)\n";
for (const it of all.slice(0, 20)) md += mdItem(it, 6) + "\n";
md += "\n## Tier S — HERITAGE missing images (highest priority)\n";
for (const it of tiers.S) md += mdItem(it, 10) + "\n";
md += "\n## Tier A — COLUMN images referenced by 2+ slugs (high ROI)\n";
for (const it of tiers.A.slice(0, 40)) md += mdItem(it, 8) + "\n";
if (tiers.A.length > 40) md += `- … +${tiers.A.length - 40} more\n`;
md += "\n## Tier B — COLUMN images referenced by 1 slug\n";
for (const it of tiers.B.slice(0, 40)) md += mdItem(it, 6) + "\n";
if (tiers.B.length > 40) md += `- … +${tiers.B.length - 40} more\n`;
md += "\n## Tier C — GUIDE images\n";
for (const it of tiers.C.slice(0, 60)) md += mdItem(it, 6) + "\n";
if (tiers.C.length > 60) md += `- … +${tiers.C.length - 60} more\n`;
md += "\n## Tier D — CAR images\n";
md += `- Count: ${tiers.D.length} unique files. Most appear as heroImage + imageUrl for the same car.\n`;

fs.writeFileSync(OUT_MD, md, "utf-8");

const out = {
  generatedAt: now,
  sourceReport: "docs/reports/missing-assets.json",
  summary,
  tiers,
};
fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");

console.log("Wrote:");
console.log(" -", OUT_MD);
console.log(" -", OUT_JSON);
