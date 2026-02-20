import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const readJson = async (rel) => {
  const abs = path.join(ROOT, rel);
  const raw = await fs.promises.readFile(abs, "utf-8");
  return JSON.parse(raw);
};

const readJsonDir = async (relDir) => {
  const abs = path.join(ROOT, relDir);
  if (!fs.existsSync(abs)) return [];
  const files = (await fs.promises.readdir(abs))
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const out = [];
  for (const file of files) {
    const rel = path.join(relDir, file);
    try {
      const data = await readJson(rel);
      out.push({ __file: rel, ...data });
    } catch (e) {
      out.push({ __file: rel, __parseError: String(e) });
    }
  }
  return out;
};

const isUrl = (s) => typeof s === "string" && /^https?:\/\//.test(s);

const asString = (v) => (typeof v === "string" ? v.trim() : "");
const asLower = (v) => asString(v).toLowerCase();
const asBool = (v) => (v === true ? true : v === false ? false : null);
const asArray = (v) => (Array.isArray(v) ? v : []);

const countMarkdownHeadings = (body) => {
  if (typeof body !== "string") return 0;
  return body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^#{2,3}\s+/.test(l)).length;
};

const countHeritageChapters = (body) => {
  if (typeof body !== "string") return 0;
  return body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("【") && l.includes("】")).length;
};

const normalizeList = (v) =>
  Array.isArray(v)
    ? v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];

const hasCarSection = (body, re) => {
  if (typeof body !== "string") return false;
  return re.test(body);
};

const buildCarContentText = (car) => {
  const parts = [];
  const push = (v) => {
    if (typeof v === "string") {
      const s = v.trim();
      if (s) parts.push(s);
    }
  };

  push(car.summaryLong);
  push(car.summary);
  push(car.costImpression);
  push(car.body);
  push(car.purchasePriceSafe);
  push(car?.maintenanceSimulation?.yearlyRoughTotal);

  const mCost = car.maintenanceCostYenPerYear;
  if (typeof mCost === "number" && Number.isFinite(mCost)) parts.push(String(mCost));

  for (const k of [
    "bestFor",
    "notFor",
    "strengths",
    "weaknesses",
    "troubleTrends",
    "maintenanceNotes",
  ]) {
    for (const it of normalizeList(car[k])) parts.push(it);
  }
  return parts.join("\n").trim();
};

const quality = {
  CAR: (car) => {
    const txt = buildCarContentText(car);
    const contentLen = txt.length;
    const bodyLen = asString(car.body).length;

    const strengths = normalizeList(car.strengths);
    const weaknesses = normalizeList(car.weaknesses);
    const troubles = normalizeList(car.troubleTrends);
    const concernsCount = weaknesses.length + troubles.length;

    const meetsLength = contentLen >= 2000;
    const meetsBody = bodyLen >= 1000;
    const hasStrengths = strengths.length >= 3;
    const hasConcerns = concernsCount >= 3;
    const hasBullets = hasStrengths || hasConcerns;
    const hasBudget = Boolean(asString(car.purchasePriceSafe)) || Boolean(car.priceUsed);
    const hasMaint =
      Boolean(asString(car?.maintenanceSimulation?.yearlyRoughTotal)) ||
      Boolean(asString(car.costImpression)) ||
      (typeof car.maintenanceCostYenPerYear === "number" &&
        Number.isFinite(car.maintenanceCostYenPerYear));

    const body = asString(car.body);
    const hasConclusion = hasCarSection(body, /(^|\n)##\s+結論/m);
    const hasSuitability = hasCarSection(body, /(^|\n)##\s+.*(向く人|向かない人)/m);
    const hasCheck = hasCarSection(body, /(^|\n)##\s+.*(買う前|チェック)/m);
    const hasTrouble = hasCarSection(body, /(^|\n)##\s+.*(弱点|故障|トラブル)/m);
    const hasMaintenance = hasCarSection(body, /(^|\n)##\s+.*(維持費|維持|ランニングコスト)/m);
    const hasUsed = hasCarSection(body, /(^|\n)##\s+.*中古/m);
    const hasCompare = hasCarSection(body, /(^|\n)##\s+.*比較/m);
    const hasLinks = hasCarSection(body, /(^|\n)##\s+.*(関連リンク|リンク)/m);
    const hasSections =
      hasConclusion &&
      hasSuitability &&
      hasCheck &&
      hasTrouble &&
      hasMaintenance &&
      hasUsed &&
      hasCompare &&
      hasLinks;

    const bestFor = normalizeList(car.bestFor);
    const notFor = normalizeList(car.notFor);
    const maintenanceNotes = normalizeList(car.maintenanceNotes);
    const hasDecisionLists =
      bestFor.length >= 2 && notFor.length >= 2 && maintenanceNotes.length >= 2;

    const relatedCars = normalizeList(car.relatedCarSlugs);
    const relatedGuides = normalizeList(car.relatedGuideSlugs);
    const relatedColumns = normalizeList(car.relatedColumnSlugs);
    const relatedHeritage = normalizeList(car.relatedHeritageSlugs);
    const hasRelated =
      relatedCars.length >= 1 &&
      relatedCars.length <= 3 &&
      relatedGuides.length >= 2 &&
      relatedColumns.length >= 1 &&
      relatedHeritage.length >= 1;

    return {
      ok: meetsLength && meetsBody && hasBullets && hasBudget && hasMaint && hasSections && hasDecisionLists && hasRelated,
      metrics: {
        contentLen,
        bodyLen,
        strengthsCount: strengths.length,
        concernsCount,
        bestForCount: bestFor.length,
        notForCount: notFor.length,
        maintenanceNotesCount: maintenanceNotes.length,
        relatedCarsCount: relatedCars.length,
        relatedGuidesCount: relatedGuides.length,
        relatedColumnsCount: relatedColumns.length,
        relatedHeritageCount: relatedHeritage.length,
      },
      checks: {
        meetsLength,
        meetsBody,
        hasBullets,
        hasBudget,
        hasMaint,
        hasSections,
        hasDecisionLists,
        hasRelated,
      },
    };
  },
  GUIDE: (g) => {
    const body = asString(g.body);
    const bodyLen = body.length;
    const headings = countMarkdownHeadings(body);
    const meetsLength = bodyLen >= 2500;
    const hasStructure = headings >= 4;
    return {
      ok: meetsLength && hasStructure,
      metrics: { bodyLen, headings },
      checks: { meetsLength, hasStructure },
    };
  },
  COLUMN: (c) => {
    const body = asString(c.body);
    const bodyLen = body.length;
    const headings = countMarkdownHeadings(body);
    const meetsLength = bodyLen >= 1200;
    const hasStructure = headings >= 3;
    return {
      ok: meetsLength && hasStructure,
      metrics: { bodyLen, headings },
      checks: { meetsLength, hasStructure },
    };
  },
  HERITAGE: (h) => {
    const body = asString(h.body);
    const bodyLen = body.length;
    const chapters = countHeritageChapters(body);
    const headings = countMarkdownHeadings(body);
    const meetsLength = bodyLen >= 6000;
    const hasStructure = chapters >= 3 || headings >= 4;
    return {
      ok: meetsLength && hasStructure,
      metrics: { bodyLen, chapters, headings },
      checks: { meetsLength, hasStructure },
    };
  },
};

const requiredFields = [
  "id",
  "slug",
  "type",
  "status",
  "title",
  "publicState",
  "parentPillarId",
  "primaryQuery",
  "updateReason",
  "relatedClusterIds",
  "sources",
];

const getUrl = (item) => {
  const type = asUpper(item.type);
  const slug = asString(item.slug);
  if (!slug) return null;
  switch (type) {
    case "CAR":
      return `/cars/${slug}`;
    case "GUIDE":
      return `/guide/${slug}`;
    case "COLUMN":
      return `/column/${slug}`;
    case "HERITAGE":
      return `/heritage/${slug}`;
    default:
      return null;
  }
};

const asUpper = (v) => asString(v).toUpperCase();

const hasBannedChars = (body) => {
  if (typeof body !== "string") return false;
  return body.includes("*") || body.includes('"');
};

const isPublished = (status) => {
  const s = asString(status);
  return !s || s === "published";
};

const getPublicState = (v) => {
  const s = asLower(v);
  if (["index", "noindex", "draft", "redirect"].includes(s)) return s;
  return "";
};

const main = async () => {
  const cars = await readJsonDir("data/articles/cars");
  const guides = await readJsonDir("data/articles/guides");
  const columns = await readJsonDir("data/articles/columns");
  const heritage = await readJsonDir("data/articles/heritage");

  const all = [...cars, ...guides, ...columns, ...heritage];

  const byType = { CAR: cars.length, GUIDE: guides.length, COLUMN: columns.length, HERITAGE: heritage.length };

  // Known slugs sets (for related references)
  const slugSets = {
    CAR: new Set(cars.map((x) => asString(x.slug)).filter(Boolean)),
    GUIDE: new Set(guides.map((x) => asString(x.slug)).filter(Boolean)),
    COLUMN: new Set(columns.map((x) => asString(x.slug)).filter(Boolean)),
    HERITAGE: new Set(heritage.map((x) => asString(x.slug)).filter(Boolean)),
  };

  // Redirect map (data/redirects.json) for redirect stubs consistency
  const redirects = await readJson("data/redirects.json");
  const redirectMap = new Map();
  if (Array.isArray(redirects)) {
    for (const r of redirects) {
      if (!r || typeof r !== "object") continue;
      const source = asString(r.source);
      const destination = asString(r.destination);
      if (!source || !destination) continue;
      redirectMap.set(source, destination);
    }
  }

  const errors = [];
  const warnings = [];

  // Duplicate checks
  const seenId = new Map();
  const seenUrl = new Map();
  const seenPrimaryQueryIndex = new Map();

  const items = all.map((item) => {
    const type = asUpper(item.type);
    const slug = asString(item.slug);
    const id = asString(item.id);
    const title = asString(item.title);
    const status = asString(item.status) || "published";
    const state = getPublicState(item.publicState);

    const url = getUrl(item);
    const row = {
      type,
      slug,
      id,
      title,
      status,
      publicState: state,
      url,
      file: item.__file,
      issues: [],
      metrics: {},
    };

    // Parse errors
    if (item.__parseError) {
      row.issues.push({ level: "error", code: "json:parse_error", message: item.__parseError });
      errors.push({ ...row, code: "json:parse_error", message: item.__parseError });
      return row;
    }

    // Required fields presence + type
    for (const f of requiredFields) {
      if (!(f in item)) {
        row.issues.push({ level: "error", code: `missing:${f}`, message: `${f} is missing` });
      }
    }

    if (!id) row.issues.push({ level: "error", code: "missing:id", message: "id is empty" });
    if (!slug) row.issues.push({ level: "error", code: "missing:slug", message: "slug is empty" });
    if (!title) row.issues.push({ level: "error", code: "missing:title", message: "title is empty" });

    if (!state) row.issues.push({ level: "error", code: "missing:publicState", message: "publicState is missing/invalid" });

    // arrays
    if (!Array.isArray(item.relatedClusterIds)) {
      row.issues.push({ level: "error", code: "type:relatedClusterIds", message: "relatedClusterIds must be array" });
    }
    if (!Array.isArray(item.sources)) {
      row.issues.push({ level: "error", code: "type:sources", message: "sources must be array" });
    }

    // duplicates
    if (id) {
      if (seenId.has(id)) {
        row.issues.push({ level: "error", code: "duplicate:id", message: `duplicate id (also in ${seenId.get(id)})` });
      } else {
        seenId.set(id, row.file || "(unknown)");
      }
    }
    if (url) {
      if (seenUrl.has(url)) {
        row.issues.push({ level: "error", code: "duplicate:url", message: `duplicate url (also in ${seenUrl.get(url)})` });
      } else {
        seenUrl.set(url, row.file || "(unknown)");
      }
    }

    // Banned chars
    const body = item.body;
    if (hasBannedChars(body)) {
      row.issues.push({ level: "error", code: "body:banned_chars", message: "body contains * or \"" });
    }

    // Policy + quality (index only)
    const published = isPublished(status);
    const allowIndex = published && state === "index" && item.noindex !== true;

    const q = quality[type] ? quality[type](item) : { ok: false, metrics: {}, checks: {} };
    row.metrics = q.metrics;

    if (state === "index") {
      // Require core fields non-empty for indexed items
      if (!asString(item.parentPillarId)) row.issues.push({ level: "error", code: "missing:parentPillarId", message: "parentPillarId is empty" });
      if (!asString(item.primaryQuery)) row.issues.push({ level: "error", code: "missing:primaryQuery", message: "primaryQuery is empty" });
      if (!asString(item.updateReason)) row.issues.push({ level: "error", code: "missing:updateReason", message: "updateReason is empty" });
      if (!published) row.issues.push({ level: "error", code: "status:not_published", message: "publicState=index but status is not published" });
      if (item.noindex === true) row.issues.push({ level: "error", code: "flag:noindex", message: "publicState=index but noindex=true" });

      if (!allowIndex) row.issues.push({ level: "error", code: "policy:not_allowed", message: "index is not allowed by policy gate" });

      if (!q.ok) row.issues.push({ level: "error", code: "quality:fail", message: "publicState=index but quality gate failed" });

      const pq = asString(item.primaryQuery);
      if (pq) {
        const key = pq.toLowerCase();
        if (seenPrimaryQueryIndex.has(key)) {
          warnings.push({ type, slug, url, code: "duplicate:primaryQuery", message: `duplicate primaryQuery among index items: "${pq}"`, other: seenPrimaryQueryIndex.get(key) });
        } else {
          seenPrimaryQueryIndex.set(key, { type, slug, url });
        }
      }
    }



    // Redirect stubs must be consistent (redirectTo + redirects.json)
    if (state === "redirect") {
      const redirectTo = asString(item.redirectTo);

      if (!redirectTo) {
        row.issues.push({ level: "error", code: "missing:redirectTo", message: "redirectTo is missing" });
      } else {
        if (!redirectTo.startsWith("/")) {
          row.issues.push({ level: "error", code: "redirectTo:invalid", message: "redirectTo must start with /" });
        }
        if (url && redirectTo === url) {
          row.issues.push({ level: "error", code: "redirectTo:self", message: "redirectTo must not equal url" });
        }
      }

      if (url) {
        const expected = redirectMap.get(url);
        if (!expected) {
          row.issues.push({
            level: "error",
            code: "missing:redirect_rule",
            message: `publicState=redirect but no redirect rule found for ${url}`,
          });
        } else if (redirectTo && redirectTo !== expected) {
          row.issues.push({ level: "error", code: "redirectTo:mismatch", message: `redirectTo mismatch: expected ${expected}` });
        }
      }
    }
    // Related slugs (cars only)
    if (type === "CAR") {
      const relatedGuideSlugs = normalizeList(item.relatedGuideSlugs);
      const relatedColumnSlugs = normalizeList(item.relatedColumnSlugs);
      const relatedHeritageSlugs = normalizeList(item.relatedHeritageSlugs);

      for (const s of relatedGuideSlugs) {
        if (!slugSets.GUIDE.has(s)) row.issues.push({ level: "error", code: "ref:guide_missing", message: `relatedGuideSlugs contains unknown slug: ${s}` });
      }
      for (const s of relatedColumnSlugs) {
        if (!slugSets.COLUMN.has(s)) row.issues.push({ level: "error", code: "ref:column_missing", message: `relatedColumnSlugs contains unknown slug: ${s}` });
      }
      for (const s of relatedHeritageSlugs) {
        if (!slugSets.HERITAGE.has(s)) row.issues.push({ level: "error", code: "ref:heritage_missing", message: `relatedHeritageSlugs contains unknown slug: ${s}` });
      }
    }

    // Collect errors
    for (const issue of row.issues) {
      if (issue.level === "error") errors.push({ ...row, code: issue.code, message: issue.message });
    }

    return row;
  });

  const errorCount = errors.length;
  const warningCount = warnings.length;

  const indexCounts = items.reduce(
    (acc, it) => {
      acc.total += 1;
      if (it.publicState === "index") acc.index += 1;
      return acc;
    },
    { total: 0, index: 0 }
  );

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totals: byType,
      all: indexCounts,
      errorCount,
      warningCount,
    },
    errors,
    warnings,
    items,
  };

  // Write to public + generated module
  const publicDir = path.join(ROOT, "public", "_internal");
  await fs.promises.mkdir(publicDir, { recursive: true });
  await fs.promises.writeFile(path.join(publicDir, "audit.json"), JSON.stringify(report, null, 2));

  const genDir = path.join(ROOT, "src", "generated");
  await fs.promises.mkdir(genDir, { recursive: true });
  await fs.promises.writeFile(path.join(genDir, "audit.generated.json"), JSON.stringify(report, null, 2));

  // Fail build on any error in indexed items OR critical data errors
  const blockingErrors = errors.filter((e) => {
    // Always block parse errors and missing required fields
    if (String(e.code || "").startsWith("json:parse_error")) return true;
    if (String(e.code || "").startsWith("missing:")) return true;
    if (String(e.code || "").startsWith("duplicate:")) return true;
    if (String(e.code || "") === "body:banned_chars") return true;

    // Block anything on index items
    if (e.publicState === "index") return true;
    return false;
  });

  if (blockingErrors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`[content-audit] Blocking errors: ${blockingErrors.length}`);
    for (const e of blockingErrors.slice(0, 50)) {
      // eslint-disable-next-line no-console
      console.error(`- [${e.type}] ${e.url || e.file}: ${e.code} ${e.message}`);
    }
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`[content-audit] OK (errors=${errorCount}, warnings=${warningCount})`);
};

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("[content-audit] Failed", e);
  process.exit(1);
});
