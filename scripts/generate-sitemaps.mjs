import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const DEFAULT_SITE_URL = "https://carboutiquejournal.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

const TODAY = new Date().toISOString().slice(0, 10);

// ──────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDate10 = (value) => {
  if (!value) return TODAY;
  const s = String(value);
  if (s.length >= 10) return s.slice(0, 10);
  return TODAY;
};

const safeString = (value) => {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
};

// ──────────────────────────────────────────────
// Indexing overrides (forceIndex / forceNoindex)
// ──────────────────────────────────────────────
const INDEXING_OVERRIDES = (() => {
  try {
    const raw = fsSync.readFileSync(path.join(ROOT, "data", "indexing-overrides.json"), "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
})();

const buildOverrideSet = (type, key) => {
  const list = INDEXING_OVERRIDES?.content?.[type]?.[key];
  if (!Array.isArray(list)) return new Set();
  return new Set(list.map((v) => safeString(v)).filter(Boolean));
};

const OVERRIDE_FORCE_INDEX = new Map([
  ["CAR", buildOverrideSet("CAR", "forceIndex")],
  ["GUIDE", buildOverrideSet("GUIDE", "forceIndex")],
  ["HERITAGE", buildOverrideSet("HERITAGE", "forceIndex")],
  ["COLUMN", buildOverrideSet("COLUMN", "forceIndex")],
  ["NEWS", buildOverrideSet("NEWS", "forceIndex")],
]);

const OVERRIDE_FORCE_NOINDEX = new Map([
  ["CAR", buildOverrideSet("CAR", "forceNoindex")],
  ["GUIDE", buildOverrideSet("GUIDE", "forceNoindex")],
  ["HERITAGE", buildOverrideSet("HERITAGE", "forceNoindex")],
  ["COLUMN", buildOverrideSet("COLUMN", "forceNoindex")],
  ["NEWS", buildOverrideSet("NEWS", "forceNoindex")],
]);

const getOverride = (type, slug) => {
  const t = safeString(type).toUpperCase();
  const s = safeString(slug);
  if (!t || !s) return null;
  if (OVERRIDE_FORCE_NOINDEX.get(t)?.has(s)) return "forceNoindex";
  if (OVERRIDE_FORCE_INDEX.get(t)?.has(s)) return "forceIndex";
  return null;
};


// URL 用の簡易スラッグ生成（日本語は想定しない）
const toSlug = (input) => {
  const v = safeString(input).toLowerCase();
  if (!v) return "";
  return v
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// FNV-1a 32bit hash
const fnv1a32 = (input) => {
  let hash = 0x811c9dc5;
  const s = String(input ?? "");
  for (let i = 0; i < s.length; i += 1) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // >>> 0 で uint32 に正規化
  return hash >>> 0;
};

const toStableKey = (input, prefix) => {
  const h = fnv1a32(input);
  const core = h.toString(36);
  const p = String(prefix ?? "key")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase() || "key";
  return `${p}-${core}`;
};

// bodyType の表記ゆれ吸収（lib/taxonomy/body-types.ts に合わせる）
const BODYTYPE_MAP = {
  // sedan
  sedan: "セダン",

  // coupe
  coupe: "クーペ",
  "sports-coupe": "クーペ",
  "gt-coupe": "クーペ",

  // open
  roadster: "オープンカー",
  open: "オープンカー",
  "オープン": "オープンカー",
};

const normalizeBodyTypeLabel = (raw) => {
  const v = safeString(raw);
  if (!v) return "";
  const key = v.toLowerCase();
  const mapped = BODYTYPE_MAP[key];
  if (mapped) return mapped;

  // 余計な空白を整理して返す
  return v.replace(/\s+/g, " ");
};

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

const getBodyTypeKey = (rawLabel) => {
  const label = normalizeBodyTypeLabel(rawLabel);
  if (!label) return "";
  const override = BODY_TYPE_KEY_OVERRIDES[label];
  if (override) return override;
  const slug = toSlug(label);
  if (slug) return slug;
  return toStableKey(label, "bt");
};

// segment の表記ゆれ吸収
const normalizeSegmentLabel = (raw) => {
  const v = safeString(raw);
  if (!v) return "";
  let s = v.replace(/\s+/g, " ");
  s = s.replace(/\s*\/\s*/g, " / ");
  return s;
};

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

const getSegmentKey = (rawLabel) => {
  const label = normalizeSegmentLabel(rawLabel);
  if (!label) return "";
  const override = SEGMENT_KEY_OVERRIDES[label];
  if (override) return override;
  const slug = toSlug(label);
  if (slug) return slug;
  return toStableKey(label, "seg");
};

const readJson = async (rel) => {
  const abs = path.join(ROOT, rel);
  try {
    const raw = await fs.readFile(abs, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
};

const readJsonGlob = async (dirRel, regex) => {
  const dirAbs = path.join(ROOT, dirRel);
  let names = [];
  try {
    names = await fs.readdir(dirAbs);
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }

  const targets = names
    .filter((n) => regex.test(n))
    .sort((a, b) => a.localeCompare(b));

  const out = [];
  for (const name of targets) {
    const rel = path.join(dirRel, name);
    const data = await readJson(rel);
    if (Array.isArray(data)) out.push(...data);
  }
  return out;
};

const uniqBySlug = (items, slugKey = "slug") => {
  const map = new Map();
  for (const item of items) {
    const slug = item?.[slugKey];
    if (!slug) continue;
    // later files win
    map.set(slug, item);
  }
  return Array.from(map.values());
};

// Indexability（A/B/C運用の “A=公開可” をコードで担保する簡易版）
// - forceIndex/forceNoindex は data/indexing-overrides.json で制御
// - 企画書の文字数目安をデフォルト閾値として採用
const normalizeList = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
};

const countMarkdownHeadings = (body) => {
  const lines = String(body || "").split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    if (/^#{2,3}\s+/.test(String(line).trim())) count += 1;
  }
  return count;
};

const countHeritageChapters = (body) => {
  const lines = String(body || "").split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    const t = String(line).trim();
    if (t.startsWith("【") && t.includes("】")) count += 1;
  }
  return count;
};

const buildCarContentText = (car) => {
  const parts = [];
  const pushText = (v) => {
    if (typeof v !== "string") return;
    const s = v.trim();
    if (s) parts.push(s);
  };

  pushText(car?.summaryLong);
  pushText(car?.summary);
  pushText(car?.costImpression);
  pushText(car?.maintenanceSimulation);
  pushText(car?.purchasePriceSafe);

  for (const s of normalizeList(car?.strengths)) parts.push(s);
  for (const s of normalizeList(car?.weaknesses)) parts.push(s);
  for (const s of normalizeList(car?.troubleTrends)) parts.push(s);
  for (const s of normalizeList(car?.maintenanceNotes)) parts.push(s);

  return parts.join("\n").trim();
};

const isPublished = (item) => !item?.status || String(item.status) === "published";

const isIndexableCar = (car) => {
  if (!car) return false;
  if (!isPublished(car)) return false;

  const slug = safeString(car.slug);
  const override = getOverride("CAR", slug);
  if (override === "forceNoindex") return false;

  const contentLen = buildCarContentText(car).length;
  const meetsLength = contentLen >= 2000;

  const strengths = normalizeList(car.strengths);
  const weaknesses = normalizeList(car.weaknesses);
  const troubles = normalizeList(car.troubleTrends);
  const concernsCount = weaknesses.length + troubles.length;
  const hasBullets = strengths.length >= 3 || concernsCount >= 3;

  const ok = Boolean(slug) && meetsLength && hasBullets;
  if (ok) return true;
  return override === "forceIndex";
};

const isIndexableColumn = (column) => {
  if (!column) return false;
  if (!isPublished(column)) return false;

  const slug = safeString(column.slug);
  const override = getOverride("COLUMN", slug);
  if (override === "forceNoindex") return false;

  if (column.noindex) return false;

  const title = safeString(column.title);
  const body = safeString(column.body);
  const bodyLen = body.length;

  const meetsLength = bodyLen >= 1200;
  const hasStructure = countMarkdownHeadings(body) >= 3;

  const ok = Boolean(slug) && title.length > 0 && meetsLength && hasStructure;
  if (ok) return true;
  return override === "forceIndex";
};

const isIndexableGuide = (guide) => {
  if (!guide) return false;
  if (!isPublished(guide)) return false;

  const slug = safeString(guide.slug);
  const override = getOverride("GUIDE", slug);
  if (override === "forceNoindex") return false;

  if (guide.noindex) return false;

  const title = safeString(guide.title);
  const body = safeString(guide.body);

  const meetsLength = body.length >= 2500;
  const hasStructure = countMarkdownHeadings(body) >= 4;

  const ok = Boolean(slug) && title.length > 0 && meetsLength && hasStructure;
  if (ok) return true;
  return override === "forceIndex";
};

const isIndexableHeritage = (h) => {
  if (!h) return false;
  if (!isPublished(h)) return false;

  const slug = safeString(h.slug);
  const override = getOverride("HERITAGE", slug);
  if (override === "forceNoindex") return false;

  if (h.noindex) return false;

  const title = safeString(h.title);
  const body = safeString(h.body);

  const meetsLength = body.length >= 6000;
  const hasStructure = countHeritageChapters(body) >= 3 || countMarkdownHeadings(body) >= 4;

  const ok = Boolean(slug) && title.length > 0 && meetsLength && hasStructure;
  if (ok) return true;
  return override === "forceIndex";
};


const buildUrlset = (entries) => {
  const rows = entries
    .map((e) => {
      const loc = escapeXml(e.loc);
      const lastmod = escapeXml(e.lastmod || TODAY);
      const changefreq = e.changefreq ? `\n    <changefreq>${escapeXml(e.changefreq)}</changefreq>` : "";
      const priority = e.priority != null ? `\n    <priority>${escapeXml(e.priority)}</priority>` : "";
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>${changefreq}${priority}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemaps/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
};

const buildIndex = (sitemaps) => {
  const rows = sitemaps
    .map((s) => {
      return `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>\n    <lastmod>${escapeXml(s.lastmod || TODAY)}</lastmod>\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemaps/sitemap.xsl"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
};

const main = async () => {
  // ---- Static routes (no params) ----
  const staticPaths = [
    "/",
    "/start",
    "/cars",
    "/cars/makers",
    "/cars/body-types",
    "/cars/segments",
    "/news",
    "/guide",
    "/guide/insurance",
    "/guide/lease",
    "/guide/maintenance",
    "/guide/hub-loan",
    "/guide/hub-usedcar",
    "/guide/hub-shaken",
    "/guide/hub-consumables",
    "/guide/hub-paperwork",
    "/guide/hub-import-trouble",
    "/guide/hub-sell",
    "/guide/hub-sell-compare",
    "/guide/hub-sell-prepare",
    "/guide/hub-sell-loan",
    "/guide/hub-sell-price",
    "/column",
    "/heritage",
  ];


  // ---- Dynamic data slugs ----
  const cars = uniqBySlug(await readJsonGlob("data", /^cars\d*\.json$/));
  const guides = uniqBySlug(await readJsonGlob("data", /^guides\d*\.json$/));
  const columns = uniqBySlug(await readJsonGlob("data", /^columns\d*\.json$/));
  const heritage = uniqBySlug(await readJsonGlob("data", /^heritage\d*\.json$/));

  const localNews = await readJson("data/news-latest.json");
  const newsSources = await readJson("data/news-sources.json");

  // NEWS 詳細URLは /news/[id] で生成されるため、
  // 「実際にサイト側で採用される(=一次情報ドメインに一致する)」ものだけを sitemap に載せる
  const allowedNewsHosts = new Set(
    (Array.isArray(newsSources) ? newsSources : [])
      .map((s) => {
        try {
          return new URL(String(s?.baseUrl ?? "")).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );

  // ──────────────────────────────────────────────
  // Entries
  // ──────────────────────────────────────────────
  const staticEntries = staticPaths.map((p) => ({
    loc: `${SITE_URL}${p}`,
    lastmod: TODAY,
    changefreq: p === "/" ? "daily" : "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }));

  const carEntries = cars
    .filter(isIndexableCar)
    .map((c) => ({
      loc: `${SITE_URL}/cars/${encodeURIComponent(c.slug)}`,
      lastmod: TODAY,
      changefreq: "monthly",
      priority: 0.65,
    }));

  // Makers / BodyTypes / Segments
  const makerKeys = Array.from(
    new Set(
      cars
        .filter((c) => c && (!c.status || String(c.status) === "published"))
        .map((c) => safeString(c.makerKey) || toSlug(safeString(c.maker)))
        .filter(Boolean),
    ),
  ).sort();

  const bodyTypeKeys = Array.from(
    new Set(
      cars
        .filter((c) => c && (!c.status || String(c.status) === "published"))
        .map((c) => safeString(c.bodyTypeKey) || getBodyTypeKey(c.bodyType))
        .filter(Boolean),
    ),
  ).sort();

  const segmentKeys = Array.from(
    new Set(
      cars
        .filter((c) => c && (!c.status || String(c.status) === "published"))
        .map((c) => safeString(c.segmentKey) || getSegmentKey(c.segment))
        .filter(Boolean),
    ),
  ).sort();

  const makerEntries = makerKeys.map((key) => ({
    loc: `${SITE_URL}/cars/makers/${encodeURIComponent(key)}`,
    lastmod: TODAY,
    changefreq: "weekly",
    priority: 0.55,
  }));

  const bodyTypeEntries = bodyTypeKeys.map((key) => ({
    loc: `${SITE_URL}/cars/body-types/${encodeURIComponent(key)}`,
    lastmod: TODAY,
    changefreq: "weekly",
    priority: 0.55,
  }));

  const segmentEntries = segmentKeys.map((key) => ({
    loc: `${SITE_URL}/cars/segments/${encodeURIComponent(key)}`,
    lastmod: TODAY,
    changefreq: "weekly",
    priority: 0.55,
  }));

  const guideEntries = guides
    .filter(isIndexableGuide)
    .map((g) => ({
      loc: `${SITE_URL}/guide/${encodeURIComponent(g.slug)}`,
      lastmod: toDate10(g.updatedAt || g.publishedAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  const columnEntries = columns
    .filter(isIndexableColumn)
    .map((c) => ({
      loc: `${SITE_URL}/column/${encodeURIComponent(c.slug)}`,
      lastmod: toDate10(c.updatedAt || c.publishedAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  const heritageEntries = heritage
    .filter(isIndexableHeritage)
    .map((h) => ({
      loc: `${SITE_URL}/heritage/${encodeURIComponent(h.slug)}`,
      lastmod: toDate10(h.updatedAt || h.publishedAt || h.createdAt),
      changefreq: "monthly",
      priority: 0.7,
    }));

  const newsEntries = (Array.isArray(localNews) ? localNews : [])
    .filter((n) => n && (n.id || n.slug))
    .filter((n) => {
      const url = typeof n?.url === "string" ? n.url : "";
      if (!url || !url.startsWith("http")) return false;
      try {
        return allowedNewsHosts.has(new URL(url).hostname);
      } catch {
        return false;
      }
    })
    .map((n) => ({
      loc: `${SITE_URL}/news/${encodeURIComponent(n.slug || n.id)}`,
      lastmod: toDate10(n.updatedAt || n.publishedAt),
      changefreq: "daily",
      priority: 0.5,
    }));

  // ──────────────────────────────────────────────
  // Write files
  // ──────────────────────────────────────────────
  const publicDir = path.join(ROOT, "public");
  const sitemapsDir = path.join(publicDir, "sitemaps");
  await fs.mkdir(sitemapsDir, { recursive: true });

  const out = [
    ["sitemap-static.xml", staticEntries],
    ["sitemap-cars.xml", carEntries],
    ["sitemap-makers.xml", makerEntries],
    ["sitemap-body-types.xml", bodyTypeEntries],
    ["sitemap-segments.xml", segmentEntries],
    ["sitemap-guides.xml", guideEntries],
    ["sitemap-columns.xml", columnEntries],
    ["sitemap-heritage.xml", heritageEntries],
    ["sitemap-news.xml", newsEntries],
  ];

  for (const [filename, entries] of out) {
    await fs.writeFile(path.join(sitemapsDir, filename), buildUrlset(entries), "utf-8");
  }

  const indexXml = buildIndex(
    out.map(([filename]) => ({
      loc: `${SITE_URL}/sitemaps/${filename}`,
      lastmod: TODAY,
    })),
  );

  await fs.writeFile(path.join(publicDir, "sitemap.xml"), indexXml, "utf-8");

  console.log(
    `[sitemap] generated: static(${staticEntries.length}), cars(${carEntries.length}), makers(${makerEntries.length}), bodyTypes(${bodyTypeEntries.length}), segments(${segmentEntries.length}), guides(${guideEntries.length}), columns(${columnEntries.length}), heritage(${heritageEntries.length}), news(${newsEntries.length})`,
  );
};

main().catch((err) => {
  console.error("[sitemap] generation failed", err);
  process.exit(1);
});
