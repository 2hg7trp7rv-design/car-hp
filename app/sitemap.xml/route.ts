// app/sitemap.xml/route.ts
//
// NOTE:
// - 一部環境で「拡張子 .xml の静的ファイル」が 4xx になるケースがあるため、
//   /sitemap（拡張子なし）を正として運用している。
// - ただし、外部ツール/クローラー互換性を上げるため、/sitemap.xml でも
//   同じ sitemapindex を 200 で返す。

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
