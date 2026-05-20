import fs from "node:fs/promises";
import path from "node:path";

import {
  getDecisionColumnAuditBody,
  getDecisionGuideAuditBody,
  isDecisionColumn,
  isDecisionGuide,
} from "./lib/guide-decision.mjs";

const ROOT = process.cwd();

const DEFAULT_SITE_URL = "https://carboutiquejournal.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");


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
  if (!value) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const t = Date.parse(s);
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString().slice(0, 10);
};

const maxDate10 = (values) => {
  const dates = values
    .map((v) => toDate10(v))
    .filter(Boolean)
    .sort();
  return dates.at(-1);
};

const safeString = (value) => {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
};


// ──────────────────────────────────────────────
// Indexing policy
// - publicState を正とし、index のみ sitemap 対象
// - 文字数/構造/関連リンクなどの品質ゲートは sitemap 除外理由にしない
// - 品質不足は content-audit の改善レポートで扱う
// ──────────────────────────────────────────────
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
    if (Array.isArray(data)) {
      out.push(...data);
      continue;
    }
    if (data && typeof data === "object") {
      out.push(data);
    }
  }
  return out;
};


// ──────────────────────────────────────────────
// Markdown bodies (content/*/*.md)
// ──────────────────────────────────────────────


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

// Indexability
// - publicState(index/noindex/draft/redirect) をデータで固定
// - 文字数・見出し数・関連リンク数は sitemap 除外に使わない
const normalizeList = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
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
  pushText(car?.body);
  pushText(car?.purchasePriceSafe);

  // maintenanceSimulation is an object (e.g., { yearlyRoughTotal: "年間40〜80万円" })
  const yearly = car?.maintenanceSimulation && typeof car.maintenanceSimulation === "object"
    ? car.maintenanceSimulation.yearlyRoughTotal
    : null;
  pushText(yearly);

  const mCost = car?.maintenanceCostYenPerYear;
  if (typeof mCost === "number" && Number.isFinite(mCost)) {
    parts.push(String(mCost));
  }

  for (const s of normalizeList(car?.bestFor)) parts.push(s);
  for (const s of normalizeList(car?.notFor)) parts.push(s);
  for (const s of normalizeList(car?.strengths)) parts.push(s);
  for (const s of normalizeList(car?.weaknesses)) parts.push(s);
  for (const s of normalizeList(car?.troubleTrends)) parts.push(s);
  for (const s of normalizeList(car?.maintenanceNotes)) parts.push(s);

  return parts.join("\n").trim();
};

const isPublished = (item) => !item?.status || String(item.status) === "published";

const getPublicState = (item) => {
  const s = safeString(item?.publicState);
  return s ? s.toLowerCase() : null;
};

const isIndexAllowed = (item) => {
  if (!item) return false;
  if (!isPublished(item)) return false;
  const state = getPublicState(item);
  if (state !== "index") return false;
  // 旧 noindex フラグも尊重（両方ある場合は noindex が優先）
  if (item.noindex === true) return false;
  return true;
};

const isIndexableCar = (car) => {
  if (!isIndexAllowed(car)) return false;
  const slug = safeString(car?.slug);
  const contentLen = buildCarContentText(car).length;

  // 文字数・見出し・関連リンク不足は sitemap 除外理由にしない。
  // 完全な空ページだけは index 対象外にする。
  return Boolean(slug) && contentLen > 0;
};

const isIndexableColumn = (column) => {
  if (!isIndexAllowed(column)) return false;

  const slug = safeString(column?.slug);
  const title = safeString(column.title);
  const body = isDecisionColumn(column) ? getDecisionColumnAuditBody(column) : safeString(column.body);

  // 品質ゲートは audit 専用。sitemap は公開状態で判断する。
  return Boolean(slug) && title.length > 0 && body.length > 0;
};

const isIndexableGuide = (guide) => {
  if (!isIndexAllowed(guide)) return false;

  const slug = safeString(guide?.slug);
  const title = safeString(guide.title);
  const body = isDecisionGuide(guide) ? getDecisionGuideAuditBody(guide) : safeString(guide.body);

  // 品質ゲートは audit 専用。sitemap は公開状態で判断する。
  return Boolean(slug) && title.length > 0 && body.length > 0;
};

const isIndexableHeritage = (h) => {
  if (!isIndexAllowed(h)) return false;

  const slug = safeString(h?.slug);
  const title = safeString(h.title);
  const body = safeString(h.body);

  // 品質ゲートは audit 専用。sitemap は公開状態で判断する。
  return Boolean(slug) && title.length > 0 && body.length > 0;
};



const buildUrlset = (entries) => {
  const rows = entries
    .map((e) => {
      const loc = escapeXml(e.loc);
      const lastmod = e.lastmod ? `\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : "";
      const changefreq = e.changefreq ? `\n    <changefreq>${escapeXml(e.changefreq)}</changefreq>` : "";
      const priority = e.priority != null ? `\n    <priority>${escapeXml(e.priority)}</priority>` : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemaps/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
};

const buildIndex = (sitemaps) => {
  const rows = sitemaps
    .map((s) => {
      const lastmod = s.lastmod ? `\n    <lastmod>${escapeXml(s.lastmod)}</lastmod>` : "";
      return `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemaps/sitemap.xsl"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
};

const main = async () => {
  // ---- Static routes (no params) ----
  const staticPaths = [
    "/",
    "/cars",
    "/cars/makers",
    "/cars/body-types",
    "/cars/segments",
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
    "/site-map",
    "/contact",
    "/legal",
    "/legal/about",
    "/legal/editorial-policy",
    "/legal/sources-factcheck",
    "/legal/ads-affiliate-policy",
    "/legal/privacy",
    "/legal/disclaimer",
    "/legal/copyright",
  ];


  // ---- Dynamic data slugs ----
  const cars = uniqBySlug(await readJsonGlob("data/articles/cars", /\.json$/));
  const guides = uniqBySlug(await readJsonGlob("data/articles/guides", /\.json$/));
  const columns = uniqBySlug(await readJsonGlob("data/articles/columns", /\.json$/));
  const heritage = uniqBySlug(await readJsonGlob("data/articles/heritage", /\.json$/));


  const redirects = await readJson("data/redirects.json");
  const redirectSources = new Set(
    (Array.isArray(redirects) ? redirects : [])
      .map((r) => (r && typeof r.source === "string" ? r.source : ""))
      .filter(Boolean),
  );


  // ──────────────────────────────────────────────
  // Entries
  // ──────────────────────────────────────────────
  const latestAllContentDate = maxDate10([
    ...cars.map((c) => c.updatedAt || c.publishedAt || c.createdAt),
    ...guides.map((g) => g.updatedAt || g.publishedAt || g.createdAt),
    ...columns.map((c) => c.updatedAt || c.publishedAt || c.createdAt),
    ...heritage.map((h) => h.updatedAt || h.publishedAt || h.createdAt),
  ]);

  const staticLastmod = {
    "/": latestAllContentDate,
    "/cars": maxDate10(cars.map((c) => c.updatedAt || c.publishedAt || c.createdAt)),
    "/cars/makers": maxDate10(cars.map((c) => c.updatedAt || c.publishedAt || c.createdAt)),
    "/cars/body-types": maxDate10(cars.map((c) => c.updatedAt || c.publishedAt || c.createdAt)),
    "/cars/segments": maxDate10(cars.map((c) => c.updatedAt || c.publishedAt || c.createdAt)),
    "/guide": maxDate10(guides.map((g) => g.updatedAt || g.publishedAt || g.createdAt)),
    "/column": maxDate10(columns.map((c) => c.updatedAt || c.publishedAt || c.createdAt)),
    "/heritage": maxDate10(heritage.map((h) => h.updatedAt || h.publishedAt || h.createdAt)),
  };

  const staticEntries = staticPaths.map((p) => ({
    loc: `${SITE_URL}${p}`,
    lastmod: staticLastmod[p],
    changefreq: p === "/" ? "daily" : "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }));

  const carEntries = cars
    .filter((c) => !redirectSources.has("/cars/" + safeString(c.slug)))
    .filter(isIndexableCar)
    .map((c) => ({
      loc: `${SITE_URL}/cars/${encodeURIComponent(c.slug)}`,
      lastmod: toDate10(c.updatedAt || c.publishedAt || c.createdAt),
      changefreq: "monthly",
      priority: 0.65,
    }));

  // Makers / BodyTypes / Segments
  const taxonomyCars = cars.filter(isIndexAllowed);

  const makerKeys = Array.from(
    new Set(
      taxonomyCars
        .map((c) => safeString(c.makerKey) || toSlug(safeString(c.maker)))
        .filter(Boolean),
    ),
  ).sort();

  const bodyTypeKeys = Array.from(
    new Set(
      taxonomyCars
        .map((c) => safeString(c.bodyTypeKey) || getBodyTypeKey(c.bodyType))
        .filter(Boolean),
    ),
  ).sort();

  const segmentKeys = Array.from(
    new Set(
      taxonomyCars
        .map((c) => safeString(c.segmentKey) || getSegmentKey(c.segment))
        .filter(Boolean),
    ),
  ).sort();

  const makerEntries = makerKeys.map((key) => {
    const latest = maxDate10(
      taxonomyCars
        .filter((c) => (safeString(c.makerKey) || toSlug(safeString(c.maker))) === key)
        .map((c) => c.updatedAt || c.publishedAt || c.createdAt),
    );
    return {
      loc: `${SITE_URL}/cars/makers/${encodeURIComponent(key)}`,
      lastmod: latest,
      changefreq: "weekly",
      priority: 0.55,
    };
  });

  const bodyTypeEntries = bodyTypeKeys.map((key) => {
    const latest = maxDate10(
      taxonomyCars
        .filter((c) => (safeString(c.bodyTypeKey) || getBodyTypeKey(c.bodyType)) === key)
        .map((c) => c.updatedAt || c.publishedAt || c.createdAt),
    );
    return {
      loc: `${SITE_URL}/cars/body-types/${encodeURIComponent(key)}`,
      lastmod: latest,
      changefreq: "weekly",
      priority: 0.55,
    };
  });

  const segmentEntries = segmentKeys.map((key) => {
    const latest = maxDate10(
      taxonomyCars
        .filter((c) => (safeString(c.segmentKey) || getSegmentKey(c.segment)) === key)
        .map((c) => c.updatedAt || c.publishedAt || c.createdAt),
    );
    return {
      loc: `${SITE_URL}/cars/segments/${encodeURIComponent(key)}`,
      lastmod: latest,
      changefreq: "weekly",
      priority: 0.55,
    };
  });

  const guideEntries = guides
    .filter((g) => !redirectSources.has("/guide/" + safeString(g.slug)))
    .filter(isIndexableGuide)
    .map((g) => ({
      loc: `${SITE_URL}/guide/${encodeURIComponent(g.slug)}`,
      lastmod: toDate10(g.updatedAt || g.publishedAt || g.createdAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  const columnEntries = columns
    .filter((c) => !redirectSources.has("/column/" + safeString(c.slug)))
    .filter(isIndexableColumn)
    .map((c) => ({
      loc: `${SITE_URL}/column/${encodeURIComponent(c.slug)}`,
      lastmod: toDate10(c.updatedAt || c.publishedAt || c.createdAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  const heritageEntries = heritage
    .filter((h) => !redirectSources.has("/heritage/" + safeString(h.slug)))
    .filter(isIndexableHeritage)
    .map((h) => ({
      loc: `${SITE_URL}/heritage/${encodeURIComponent(h.slug)}`,
      lastmod: toDate10(h.updatedAt || h.publishedAt || h.createdAt),
      changefreq: "monthly",
      priority: 0.7,
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
  ];

  for (const [filename, entries] of out) {
    await fs.writeFile(path.join(sitemapsDir, filename), buildUrlset(entries), "utf-8");
  }

  // Indexに含めるのはエントリがあるものだけ（空の urlset は Search Console でエラー扱いになりやすい）
  const outForIndex = out.filter(([, entries]) => entries.length > 0);
  const indexTargets = outForIndex.length > 0 ? outForIndex : out;

  const indexXml = buildIndex(
    indexTargets.map(([filename, entries]) => ({
      loc: `${SITE_URL}/sitemaps/${filename}`,
      lastmod: maxDate10(entries.map((e) => e.lastmod)),
    })),
  );

  await fs.writeFile(path.join(publicDir, "sitemap.xml"), indexXml, "utf-8");

  console.log(
    `[sitemap] generated: static(${staticEntries.length}), cars(${carEntries.length}), makers(${makerEntries.length}), bodyTypes(${bodyTypeEntries.length}), segments(${segmentEntries.length}), guides(${guideEntries.length}), columns(${columnEntries.length}), heritage(${heritageEntries.length})`,
  );
};

main().catch((err) => {
  console.error("[sitemap] generation failed", err);
  process.exit(1);
});
