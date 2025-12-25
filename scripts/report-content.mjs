// scripts/report-content.mjs
// Human/assistant-friendly report (non-breaking).
// - Prints content counts and grouped “needs attention” items.
// - Optional: write JSON / Markdown reports.
// - Always exits 0 (informational).
//
// Usage:
//   npm run report:content
//   node scripts/report-content.mjs --full
//   node scripts/report-content.mjs --md docs/reports/missing-assets.md --json docs/reports/missing-assets.json

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const PUBLIC_DIR = path.join(ROOT, "public");

function parseArgs(argv) {
  const args = { full: false, md: null, json: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--full") {
      args.full = true;
      continue;
    }
    if (a === "--md") {
      args.md = argv[i + 1] || null;
      i++;
      continue;
    }
    if (a === "--json") {
      args.json = argv[i + 1] || null;
      i++;
      continue;
    }
  }
  return args;
}

function readJson(file) {
  const full = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(full, "utf-8");
  return JSON.parse(raw);
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function existsPublic(assetPath) {
  if (typeof assetPath !== "string") return true;
  if (!assetPath.startsWith("/images/")) return true; // only local images
  const full = path.join(PUBLIC_DIR, assetPath.replace(/^\//, ""));
  return fs.existsSync(full);
}

function pickMissing(item, required) {
  const missing = [];
  for (const key of required) {
    const v = item[key];
    if (v === undefined || v === null || (typeof v === "string" && !v.trim())) missing.push(key);
  }
  return missing;
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function main() {
  const args = parseArgs(process.argv);

  const cars = readJson("cars.json");
  const columns = readJson("columns.json");
  const guides = readJson("guides.json");
  const heritage = readJson("heritage.json");

  const all = [
    { file: "cars.json", type: "CAR", items: cars },
    { file: "columns.json", type: "COLUMN", items: columns },
    { file: "guides.json", type: "GUIDE", items: guides },
    { file: "heritage.json", type: "HERITAGE", items: heritage },
  ];

  const counts = Object.fromEntries(all.map((g) => [g.type, g.items.length]));

  console.log("=== CAR BOUTIQUE content report ===");
  for (const g of all) console.log(`- ${g.type}: ${g.items.length}`);

  // Note:
  // - cars.json is normalized by lib/repository/cars-repository.ts (type/status/title are injected),
  //   so raw JSON does not always carry BaseContentMeta fields.
  const baseReqByType = {
    CAR: ["id", "slug", "name", "maker"],
    COLUMN: ["id", "slug", "type", "status", "title"],
    GUIDE: ["id", "slug", "type", "status", "title"],
    HERITAGE: ["id", "slug", "type", "status", "title"],
  };

  const byTypeReq = {
    CAR: [],
    COLUMN: ["body"],
    GUIDE: ["body"],
    HERITAGE: ["lead", "sections"],
  };

  /** @type {{kind:string, ref:string, detail:string}[]} */
  const needs = [];

  // Slug maps for reference checks
  const slugMap = {
    CAR: new Set(cars.map((x) => x.slug)),
    COLUMN: new Set(columns.map((x) => x.slug)),
    GUIDE: new Set(guides.map((x) => x.slug)),
    HERITAGE: new Set(heritage.map((x) => x.slug)),
  };

  const relatedFields = [
    { field: "relatedCarSlugs", type: "CAR" },
    { field: "relatedColumnSlugs", type: "COLUMN" },
    { field: "relatedGuideSlugs", type: "GUIDE" },
    { field: "relatedHeritageSlugs", type: "HERITAGE" },
  ];

  // Missing images: map assetPath -> [{ref,key}]
  /** @type {Map<string, {ref:string, key:string}[]>} */
  const missingImages = new Map();

  for (const g of all) {
    const baseReq = baseReqByType[g.type] || [];
    const req = byTypeReq[g.type] || [];

    for (const item of g.items) {
      const ref = `${g.type}:${item.slug || "(no-slug)"}`;

      const missBase = pickMissing(item, baseReq);
      if (missBase.length) needs.push({ kind: "missing_base", ref, detail: missBase.join(", ") });

      const miss = pickMissing(item, req);
      if (miss.length) needs.push({ kind: "missing_required", ref, detail: miss.join(", ") });

      // image existence check (best-effort)
      for (const k of ["heroImage", "imageUrl", "ogImageUrl"]) {
        const v = item[k];
        if (typeof v === "string" && v.startsWith("/images/") && !existsPublic(v)) {
          needs.push({ kind: "missing_image", ref, detail: `${k}: ${v}` });
          if (!missingImages.has(v)) missingImages.set(v, []);
          missingImages.get(v).push({ ref, key: k });
        }
      }

      // related slugs existence (best-effort)
      for (const rf of relatedFields) {
        for (const s of asArray(item[rf.field])) {
          if (typeof s !== "string") continue;
          if (!slugMap[rf.type]?.has(s)) {
            needs.push({ kind: "broken_related", ref, detail: `${rf.field} -> ${rf.type}:${s}` });
          }
        }
      }
    }
  }

  console.log("\n=== Needs attention (grouped) ===");
  if (!needs.length) {
    console.log("No issues found.");
  } else {
    const groups = new Map();
    for (const n of needs) {
      if (!groups.has(n.kind)) groups.set(n.kind, []);
      groups.get(n.kind).push(n);
    }

    for (const [kind, arr] of groups.entries()) {
      console.log(`\n[${kind}] ${arr.length}`);
      const cap = args.full ? arr.length : 40;
      for (const n of arr.slice(0, cap)) console.log(`- ${n.ref} :: ${n.detail}`);
      if (!args.full && arr.length > cap) console.log(`... and ${arr.length - cap} more`);
    }
  }

  console.log("\nNote: This report is informational and does not fail builds.");

  // Optional: JSON output
  if (args.json) {
    const jsonPath = path.isAbsolute(args.json) ? args.json : path.join(ROOT, args.json);
    ensureDirForFile(jsonPath);

    const groupsObj = {};
    for (const n of needs) {
      if (!groupsObj[n.kind]) groupsObj[n.kind] = [];
      groupsObj[n.kind].push(n);
    }

    const missingImagesObj = {};
    for (const [p, refs] of missingImages.entries()) missingImagesObj[p] = refs;

    fs.writeFileSync(
      jsonPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          counts,
          groups: groupsObj,
          missingImages: {
            uniquePaths: Object.keys(missingImagesObj).length,
            refsByPath: missingImagesObj,
          },
        },
        null,
        2
      ),
      "utf-8"
    );
  }

  // Optional: Markdown output (focus on missing images, then other issues)
  if (args.md) {
    const mdPath = path.isAbsolute(args.md) ? args.md : path.join(ROOT, args.md);
    ensureDirForFile(mdPath);

    const byKindCount = new Map();
    for (const n of needs) byKindCount.set(n.kind, (byKindCount.get(n.kind) || 0) + 1);

    const lines = [];
    lines.push(`# Content attention report`);
    lines.push("");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");
    lines.push("## Content counts");
    lines.push("");
    lines.push(`- CAR: ${counts.CAR}`);
    lines.push(`- COLUMN: ${counts.COLUMN}`);
    lines.push(`- GUIDE: ${counts.GUIDE}`);
    lines.push(`- HERITAGE: ${counts.HERITAGE}`);
    lines.push("");

    const uniqueMissingImagePaths = missingImages.size;
    const missingImageRefsTotal = byKindCount.get("missing_image") || 0;

    lines.push("## Missing images (local /images/* not found in public)");
    lines.push("");
    lines.push(`- Missing image refs: ${missingImageRefsTotal}`);
    lines.push(`- Unique missing image paths: ${uniqueMissingImagePaths}`);
    lines.push("");

    if (uniqueMissingImagePaths === 0) {
      lines.push("No missing local images detected.");
    } else {
      // Sort by path
      const paths = Array.from(missingImages.keys()).sort();
      for (const p of paths) {
        lines.push(`### ${mdEscape(p)}`);
        const refs = missingImages.get(p) || [];
        // dedupe (same ref+key can appear once)
        const dedup = new Map();
        for (const r of refs) dedup.set(`${r.ref}::${r.key}`, r);
        for (const r of Array.from(dedup.values())) {
          lines.push(`- ${mdEscape(r.ref)} (${mdEscape(r.key)})`);
        }
        lines.push("");
      }
    }

    // Other issues summary
    lines.push("## Other issues (counts)");
    lines.push("");
    const otherKinds = Array.from(byKindCount.entries())
      .filter(([k]) => k !== "missing_image")
      .sort((a, b) => b[1] - a[1]);

    if (!otherKinds.length) {
      lines.push("No other issues detected.");
    } else {
      for (const [k, c] of otherKinds) lines.push(`- ${mdEscape(k)}: ${c}`);
      lines.push("");

      // Append full lists for each kind (excluding missing_image which is already expanded)
      const groupMap = new Map();
      for (const n of needs) {
        if (n.kind === "missing_image") continue;
        if (!groupMap.has(n.kind)) groupMap.set(n.kind, []);
        groupMap.get(n.kind).push(n);
      }

      for (const [k, arr] of groupMap.entries()) {
        lines.push(`### ${mdEscape(k)}`);
        lines.push("");
        for (const n of arr) lines.push(`- ${mdEscape(n.ref)} :: ${mdEscape(n.detail)}`);
        lines.push("");
      }
    }

    fs.writeFileSync(mdPath, lines.join("\n"), "utf-8");
  }
}

main();
