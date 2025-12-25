// lib/viewmodel/column-detail.ts

import type { ColumnItem } from "@/lib/columns";
import type { GuideItem } from "@/lib/guides";
import type { CarItem } from "@/lib/cars";
import type { HeritageItem } from "@/lib/heritage";

import { getRelatedSlugs } from "@/lib/linking/related";

export function mapColumnCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "技術・歴史・ブランド";
    case "OWNER_STORY":
      return "オーナーストーリー";
    case "MARKET":
      return "市場・価格動向";
    default:
      return "コラム";
  }
}

export function mapGuideCategoryLabel(category?: GuideItem["category"] | null): string {
  switch (category) {
    case "MONEY":
      return "お金・維持費";
    case "SELL":
      return "売却・乗り換え";
    case "BUY":
      return "購入計画";
    case "MAINTENANCE_COST":
      return "維持費の考え方";
    default:
      return "ガイド";
  }
}

export function pickRelatedColumns(seed: ColumnItem, allColumns: ColumnItem[]): ColumnItem[] {
  const tags = new Set(seed.tags ?? []);
  const cat = seed.category;

  const scored = allColumns
    .filter((c) => c.slug !== seed.slug)
    .map((c) => {
      let score = 0;
      if (tags.size > 0 && c.tags) score += c.overlapCount(tags, tags) * 0.8;
      if (cat && c.category === cat) score += 0.6;

      score += recencyScore(c.publishedAt, 0.3, -0.01);

      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.c);

  if (scored.length > 0) return scored;

  return [...allColumns]
    .filter((c) => c.slug !== seed.slug)
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 4);
}

export function pickRelatedGuidesForColumn(seed: ColumnItem, allGuides: GuideItem[]): GuideItem[] {
  const tags = new Set(seed.tags ?? []);
  const scored = allGuides
    .map((g) => {
      let score = 0;
      const gTags = (g as any).tags as string[] | null | undefined;
      if (tags.size > 0 && Array.isArray(gTags)) score += overlapCount(tags, gTags) * 0.9;
      score += recencyScore(g.publishedAt, 0.2, -0.01);
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.g);

  if (scored.length > 0) return scored;

  return [...allGuides]
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 4);
}

export function pickRelatedCarsForColumn(seed: ColumnItem, allCars: CarItem[]): CarItem[] {
  const slugs = getRelatedSlugs(seed as any, "cars").filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  if (slugs.length === 0) return [];

  const order = new Map<string, number>();
  slugs.forEach((s, i) => order.set(s, i));
  const set = new Set(slugs);

  return allCars
    .filter((c) => set.has(c.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}

export function pickRelatedHeritageForColumn(seed: ColumnItem, allHeritage: HeritageItem[]): HeritageItem[] {
  const tags = new Set(seed.tags ?? []);
  const cars = new Set(
    getRelatedSlugs(seed as any, "cars").filter((s): s is string => typeof s === "string" && s.trim().length > 0),
  );

  const scored = allHeritage
    .map((h) => {
      let score = 0;
      const hCar = new Set(
        getRelatedSlugs(h as any, "cars").filter((s): s is string => typeof s === "string" && s.trim().length > 0),
      );
      for (const c of cars) if (hCar.has(c)) score += 1.3;

      if (tags.size > 0 && h.tags) score += h.overlapCount(tags, tags) * 0.7;

      score += recencyScore(h.publishedAt, 0.2, -0.01);

      return { h, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.h);

  if (scored.length > 0) return scored;

  return [...allHeritage]
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 4);
}

export function buildColumnStructuredData(item: ColumnItem) {
  return {
    headline: item.title,
    description: item.summary,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    image: item.heroImage ? [item.heroImage] : [],
    author: {
      "@type": "Organization",
      name: "CAR BOUTIQUE Editorial",
    },
  };
}

export type ColumnDetailModel = {
  meta: {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage?: string | null;
  };
  jsonLd: { type?: "Article" | "Product" | "BreadcrumbList"; id?: string; data: any }[];
  related: {
    cars: CarItem[];
    guides: GuideItem[];
    columns: ColumnItem[];
    heritage: HeritageItem[];
  };

  // Backward compatible fields
  relatedColumns: ColumnItem[];
  relatedGuides: GuideItem[];
  relatedCars: CarItem[];
  relatedHeritage: HeritageItem[];
  categoryLabel: string;
  dateLabel: string | null;
  structuredData: any;
};

export function formatColumnDateLabel(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function buildColumnDetailModel(args: {
  column: ColumnItem;
  allColumns: ColumnItem[];
  allGuides: GuideItem[];
  allCars: CarItem[];
  allHeritage: HeritageItem[];
}): ColumnDetailModel {
  const { column, allColumns, allGuides, allCars, allHeritage } = args;

  const relatedColumns = pickRelatedColumns(column, allColumns);
  const relatedGuides = pickRelatedGuidesForColumn(column, allGuides);
  const relatedCars = pickRelatedCarsForColumn(column, allCars);
  const relatedHeritage = pickRelatedHeritageForColumn(column, allHeritage);

  const structuredData = buildColumnStructuredData(column);

  const description =
    column.summary ||
    "トラブル・修理の実例や、ブランドの歴史・技術解説などを整理したコラムです。";

  const meta = {
    title: `${column.title} | CAR BOUTIQUE`,
    description,
    canonicalPath: `/column/${encodeURIComponent(column.slug)}`,
    ogImage: (column as any).heroImage ?? null,
  };

  const jsonLd = [{ type: "Article" as const, data: structuredData }];

  const primaryDate = column.publishedAt ?? column.updatedAt ?? null;

  return {
    meta,
    jsonLd,
    related: {
      cars: relatedCars,
      guides: relatedGuides,
      columns: relatedColumns,
      heritage: relatedHeritage,
    },

    relatedColumns,
    relatedGuides,
    relatedCars,
    relatedHeritage,
    categoryLabel: mapColumnCategoryLabel(column.category),
    dateLabel: formatColumnDateLabel(primaryDate),
    structuredData,
  };
}
