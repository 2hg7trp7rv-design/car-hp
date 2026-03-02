// lib/seo/sitemap.ts

/**
 * Sitemap XML utilities.
 *
 * Route Handler で sitemap.xml を返すための小さなヘルパー。
 * （public/ 配下の静的XMLがホスティング環境で 4xx になるケースを回避する目的）
 */

export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"
    | string;
  priority?: number;
};

export type SitemapIndexEntry = {
  loc: string;
  lastmod?: string;
};

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const XML_STYLESHEET = '<?xml-stylesheet type="text/xsl" href="/sitemaps/sitemap.xsl"?>';

export function escapeXml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function toDate10(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const s = String(value);
  if (s.length >= 10) return s.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function buildUrlset(entries: SitemapUrlEntry[]): string {
  const rows = entries
    .map((e) => {
      const loc = escapeXml(e.loc);
      const lastmod = escapeXml(e.lastmod ?? new Date().toISOString().slice(0, 10));

      const changefreq = e.changefreq
        ? `\n    <changefreq>${escapeXml(e.changefreq)}</changefreq>`
        : "";

      const priority =
        e.priority !== undefined && e.priority !== null
          ? `\n    <priority>${escapeXml(e.priority)}</priority>`
          : "";

      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>${changefreq}${priority}\n  </url>`;
    })
    .join("\n");

  return `${XML_HEADER}\n${XML_STYLESHEET}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function buildSitemapIndex(entries: SitemapIndexEntry[]): string {
  const rows = entries
    .map((e) => {
      const loc = escapeXml(e.loc);
      const lastmod = escapeXml(e.lastmod ?? new Date().toISOString().slice(0, 10));
      return `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
    })
    .join("\n");

  return `${XML_HEADER}\n${XML_STYLESHEET}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string, maxAgeSeconds = 60 * 60): Response {
  return new Response(xml, {
    status: 200,
    headers: {
      // NOTE: ヘッダ名は大文字小文字を区別しないが、
      // 目視確認/ツール表示のために Content-Type に統一する。
      "Content-Type": "application/xml; charset=utf-8",
      // 一部環境/ブラウザで text/plain 扱いされるのを防ぐ
      "X-Content-Type-Options": "nosniff",
      // キャッシュ（CDN/エッジ）前提。更新頻度が高い場合は maxAge を短くする。
      "cache-control": `public, max-age=0, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 24}`,
    },
  });
}
