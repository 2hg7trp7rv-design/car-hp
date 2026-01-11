import { getSiteUrl } from "@/lib/site";
import { buildSitemapIndex, toDate10, xmlResponse } from "@/lib/seo/sitemap";

import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";

import { isIndexableCar, isIndexableColumn } from "@/lib/seo/indexability";

export const revalidate = 60 * 60; // 1h

function maxDate10(values: Array<string | null | undefined>): string | null {
  let maxTime = -1;
  let maxIso: string | null = null;

  for (const v of values) {
    if (!v) continue;
    const d = new Date(v);
    const t = d.getTime();
    if (Number.isNaN(t)) continue;
    if (t > maxTime) {
      maxTime = t;
      maxIso = d.toISOString();
    }
  }

  return maxIso ? toDate10(maxIso) : null;
}

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const today = toDate10(new Date().toISOString());

  // NOTE: .xml がホスティング層で 4xx になる環境があるため、
  // robots.txt / フッターからは拡張子なしの /sitemap を参照し、
  // 子サイトマップも拡張子なしのルートへ寄せる。

  // index の lastmod は「本当に更新があった sitemap だけが更新された」ように見せる方が健全。
  // ここでは各カテゴリの最大 lastmod を拾って index に反映する。
  const [cars, guides, columns, heritage] = await Promise.all([
    getAllCars().catch(() => []),
    getAllGuides().catch(() => []),
    getAllColumns().catch(() => []),
    getAllHeritage().catch(() => []),
  ]);

  const carsLastmod =
    maxDate10(
      cars
        .filter((c: CarItem) => c && c.slug)
        .filter((c: CarItem) => isIndexableCar(c))
        .map((c: CarItem) => c.updatedAt || c.publishedAt || c.createdAt),
    ) ?? today;

  const guidesLastmod =
    maxDate10(
      guides
        .filter((g: GuideItem) => g && g.slug)
        .map((g: GuideItem) => g.updatedAt || g.publishedAt || g.createdAt),
    ) ?? today;

  const columnsLastmod =
    maxDate10(
      columns
        .filter((c: ColumnItem) => c && c.slug)
        .filter((c: ColumnItem) => isIndexableColumn(c))
        .map((c: ColumnItem) => c.updatedAt || c.publishedAt || c.createdAt),
    ) ?? today;

  const heritageLastmod =
    maxDate10(
      heritage
        .filter((h: HeritageItem) => h && h.slug)
        .map((h: HeritageItem) => h.updatedAt || h.publishedAt || h.createdAt),
    ) ?? today;

  const xml = buildSitemapIndex([
    // static は変更頻度が低いので「今日固定」でも過度に害はない。
    // （本当に厳密にやるなら、運用で更新日を1箇所に集約して反映させる）
    { loc: `${base}/sitemaps/sitemap-static`, lastmod: today },

    { loc: `${base}/sitemaps/sitemap-cars`, lastmod: carsLastmod },
    { loc: `${base}/sitemaps/sitemap-makers`, lastmod: carsLastmod },
    { loc: `${base}/sitemaps/sitemap-body-types`, lastmod: carsLastmod },
    { loc: `${base}/sitemaps/sitemap-segments`, lastmod: carsLastmod },
    { loc: `${base}/sitemaps/sitemap-guides`, lastmod: guidesLastmod },
    { loc: `${base}/sitemaps/sitemap-columns`, lastmod: columnsLastmod },
    { loc: `${base}/sitemaps/sitemap-heritage`, lastmod: heritageLastmod },
  ]);

  return xmlResponse(xml, 60 * 60);
}
