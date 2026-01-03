import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const DEFAULT_SITE_URL = "https://carboutiquejournal.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

const TODAY = new Date().toISOString().slice(0, 10);

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDate10 = (value) => {
  if (!value) return TODAY;
  const s = String(value);
  if (s.length >= 10) return s.slice(0, 10);
  return TODAY;
};

const readJson = async (rel) => {
  const abs = path.join(ROOT, rel);
  try {
    const raw = await fs.readFile(abs, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    // Some packs may not include all split files; missing files are treated as empty.
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
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

  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${rows}\n</urlset>\n`;
};

const buildIndex = (sitemaps) => {
  const rows = sitemaps
    .map((s) => {
      return `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>\n    <lastmod>${escapeXml(s.lastmod || TODAY)}</lastmod>\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${rows}\n</sitemapindex>\n`;
};

const main = async () => {
  // ---- Static routes (no params) ----
  const staticPaths = [
    "/",
    "/cars",
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
    "/contact",
    "/legal/about",
    "/legal/ads-affiliate-policy",
    "/legal/copyright",
    "/legal/disclaimer",
    "/legal/editorial-policy",
    "/legal/privacy",
    "/legal/sources-factcheck",
  ];

  // ---- Dynamic data slugs ----
  const cars = uniqBySlug([
    ...(await readJson("data/cars.json")),
    ...(await readJson("data/cars2.json")),
  ]);

  const guides = uniqBySlug([
    ...(await readJson("data/guides.json")),
    ...(await readJson("data/guides2.json")),
    ...(await readJson("data/guides3.json")),
    ...(await readJson("data/guides4.json")),
    ...(await readJson("data/guides5.json")),
    ...(await readJson("data/guides6.json")),
  ]);

  const columns = uniqBySlug([
    ...(await readJson("data/columns.json")),
    ...(await readJson("data/columns2.json")),
  ]);

  const heritage = uniqBySlug([
    ...(await readJson("data/heritage.json")),
    ...(await readJson("data/heritage2.json")),
    ...(await readJson("data/heritage3.json")),
    ...(await readJson("data/heritage4.json")),
    ...(await readJson("data/heritage5.json")),
    ...(await readJson("data/heritage6.json")),
  ]);

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

  // Build sitemap entries
  const staticEntries = staticPaths.map((p) => ({
    loc: `${SITE_URL}${p}`,
    lastmod: TODAY,
    changefreq: p === "/" ? "daily" : "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }));

  const carEntries = cars
    .filter((c) => c?.slug)
    .map((c) => ({
      loc: `${SITE_URL}/cars/${encodeURIComponent(c.slug)}`,
      lastmod: TODAY,
      changefreq: "monthly",
      priority: 0.6,
    }));

  const guideEntries = guides
    .filter((g) => g?.slug)
    .map((g) => ({
      loc: `${SITE_URL}/guide/${encodeURIComponent(g.slug)}`,
      lastmod: toDate10(g.updatedAt || g.publishedAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  const columnEntries = columns
    .filter((c) => c?.slug)
    .map((c) => ({
      loc: `${SITE_URL}/column/${encodeURIComponent(c.slug)}`,
      lastmod: toDate10(c.updatedAt || c.publishedAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  const heritageEntries = heritage
    .filter((h) => h?.slug)
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

  // ---- Write files ----
  const publicDir = path.join(ROOT, "public");
  const sitemapsDir = path.join(publicDir, "sitemaps");
  await fs.mkdir(sitemapsDir, { recursive: true });

  const sitemapStaticPath = path.join(sitemapsDir, "sitemap-static.xml");
  const sitemapCarsPath = path.join(sitemapsDir, "sitemap-cars.xml");
  const sitemapGuidesPath = path.join(sitemapsDir, "sitemap-guides.xml");
  const sitemapColumnsPath = path.join(sitemapsDir, "sitemap-columns.xml");
  const sitemapHeritagePath = path.join(sitemapsDir, "sitemap-heritage.xml");
  const sitemapNewsPath = path.join(sitemapsDir, "sitemap-news.xml");

  await fs.writeFile(sitemapStaticPath, buildUrlset(staticEntries), "utf-8");
  await fs.writeFile(sitemapCarsPath, buildUrlset(carEntries), "utf-8");
  await fs.writeFile(sitemapGuidesPath, buildUrlset(guideEntries), "utf-8");
  await fs.writeFile(sitemapColumnsPath, buildUrlset(columnEntries), "utf-8");
  await fs.writeFile(sitemapHeritagePath, buildUrlset(heritageEntries), "utf-8");
  await fs.writeFile(sitemapNewsPath, buildUrlset(newsEntries), "utf-8");

  const indexXml = buildIndex([
    { loc: `${SITE_URL}/sitemaps/sitemap-static.xml`, lastmod: TODAY },
    { loc: `${SITE_URL}/sitemaps/sitemap-cars.xml`, lastmod: TODAY },
    { loc: `${SITE_URL}/sitemaps/sitemap-guides.xml`, lastmod: TODAY },
    { loc: `${SITE_URL}/sitemaps/sitemap-columns.xml`, lastmod: TODAY },
    { loc: `${SITE_URL}/sitemaps/sitemap-heritage.xml`, lastmod: TODAY },
    { loc: `${SITE_URL}/sitemaps/sitemap-news.xml`, lastmod: TODAY },
  ]);

  await fs.writeFile(path.join(publicDir, "sitemap.xml"), indexXml, "utf-8");

  // Backward-compat: /sitemap (拡張子なし) も同じ内容で置く
  // 以前 /robots.txt が /sitemap を指していた環境でも、400/404 を回避できる。
  await fs.writeFile(path.join(publicDir, "sitemap"), indexXml, "utf-8");

  // Minimal log (build systems will show it)
  console.log(
    `[sitemap] generated: static(${staticEntries.length}), cars(${carEntries.length}), guides(${guideEntries.length}), columns(${columnEntries.length}), heritage(${heritageEntries.length}), news(${newsEntries.length})`,
  );
};

main().catch((err) => {
  console.error("[sitemap] generation failed", err);
  process.exit(1);
});
