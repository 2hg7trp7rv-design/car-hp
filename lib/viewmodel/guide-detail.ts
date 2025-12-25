// lib/viewmodel/guide-detail.ts

import type { GuideItem } from "@/lib/guides";
import type { ColumnItem } from "@/lib/columns";
import type { CarItem } from "@/lib/cars";
import type { HeritageItem } from "@/lib/heritage";
import { getHeritagePreviewText } from "@/lib/heritage";
import { parseBodyToBlocks, extractStepHeadings, type ContentBlock, type Heading } from "@/lib/content/blocks";
import { overlapCount, recencyScore } from "@/lib/related/scoring";

import { getRelatedSlugs } from "@/lib/linking/related";

export type GuideDetailModel = {
  meta: {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage?: string | null;
  };
  blocks: ContentBlock[];
  headings: Heading[];
  stepHeadings: Heading[];
  jsonLd: { type?: "Article" | "Product" | "BreadcrumbList"; id?: string; data: any }[];
  related: {
    cars: CarItem[];
    guides: GuideItem[];
    columns: ColumnItem[];
    heritage: HeritageItem[];
  };
  // Backward compatible fields
  relatedColumns: ColumnItem[];
  relatedCars: CarItem[];
  relatedHeritage: HeritageItem[];
};

export function buildGuideStructuredData(guide: GuideItem) {
  return {
    headline: guide.title,
    description: guide.summary,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    image: [],
    author: {
      "@type": "Organization",
      name: "CAR BOUTIQUE Editorial",
    },
  };
}

export function pickRelatedColumnsForGuide(guide: GuideItem, allColumns: ColumnItem[]): ColumnItem[] {
  const guideWithMeta = guide as GuideItem & { category?: string | null; tags?: string[] | null };

  const guideTags = new Set(guideWithMeta.tags ?? []);
  const guideCategory = (guideWithMeta.category ?? null) as string | null;

  const scored = allColumns.map((col) => {
    let score = 0;

    if (col.tags && guideTags.size > 0) {
      const overlap = overlapCount(guideTags, col.tags);
      score += overlap * 0.7;
    }

    if (guideCategory && (col as any).category === guideCategory) score += 0.9;

    // Prefer newer items a bit
    score += recencyScore(col.publishedAt, 0.5, -0.02);

    return { col, score };
  });

  const picked = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.col);

  if (picked.length > 0) return picked;

  // Fallback: by tags -> by category -> newest
  let fallback = allColumns;

  if (guideTags.size > 0) {
    const byTags = allColumns.filter((c) => (c.tags ?? []).some((t) => guideTags.has(t)));
    if (byTags.length > 0) fallback = byTags;
  }

  if (guideCategory) {
    const byCategory = allColumns.filter((c) => (c as any).category === guideCategory);
    if (byCategory.length > 0) fallback = byCategory;
  }

  return [...fallback]
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 4);
}

export function pickRelatedCarsForGuide(
  guide: GuideItem & { relatedCarSlugs?: (string | null)[] },
  allCars: CarItem[],
): CarItem[] {
  const slugs = getRelatedSlugs(guide as any, "cars").filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );
  if (slugs.length === 0) return [];

  const orderMap = new Map<string, number>();
  slugs.forEach((s, idx) => orderMap.set(s, idx));

  const slugSet = new Set(slugs);

  return allCars
    .filter((c) => slugSet.has(c.slug ?? ""))
    .sort((a, b) => (orderMap.get(a.slug ?? "") ?? 0) - (orderMap.get(b.slug ?? "") ?? 0));
}

export function pickRelatedHeritageForGuide(
  guide: GuideItem & { relatedCarSlugs?: (string | null)[]; tags?: string[] | null },
  allHeritage: HeritageItem[],
): HeritageItem[] {
  const guideCarSlugs = getRelatedSlugs(guide as any, "cars").filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  const guideCarSet = new Set(guideCarSlugs);

  const guideTags = new Set(guide.tags ?? []);

  const scored = allHeritage.map((h) => {
    let score = 0;

    const hCarSlugs = getRelatedSlugs(h as any, "cars").filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0,
    );
    if (hCarSlugs.some((s) => guideCarSet.has(s))) score += 2.0;

    if (h.tags && guideTags.size > 0) {
      const overlap = h.overlapCount(guideTags, tags);
      score += overlap * 0.8;
    }

    const haystack = `${h.title} ${getHeritagePreviewText(h, { maxChars: 280 })}`.toLowerCase();
    const words = `${guide.title} ${guide.summary ?? ""}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.some((w) => haystack.includes(w))) score += 0.4;

    return { h, score };
  });

  const picked = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.h);

  if (picked.length > 0) return picked;

  return [...allHeritage]
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 4);
}

export function buildGuideDetailModel(args: {
  guide: GuideItem;
  allCars: CarItem[];
  allColumns: ColumnItem[];
  allHeritage: HeritageItem[];
}): GuideDetailModel {
  const { blocks, headings } = parseBodyToBlocks(args.guide.body ?? "");
  const stepHeadings = extractStepHeadings(headings);

  const structuredData = buildGuideStructuredData(args.guide);

    const relatedColumns = pickRelatedColumnsForGuide(args.guide, args.allColumns);
  const relatedCars = pickRelatedCarsForGuide(args.guide as any, args.allCars);
  const relatedHeritage = pickRelatedHeritageForGuide(args.guide as any, args.allHeritage);

  const meta = {
    title: `${args.guide.title} | CAR BOUTIQUE`,
    description: args.guide.summary ?? "維持費・売却・購入計画などを、手順ベースで整理したガイドです。",
    canonicalPath: `/guide/${encodeURIComponent(args.guide.slug)}`,
    ogImage: (args.guide as any).heroImage ?? null,
  };

  return {
    meta,
    blocks,
    headings,
    stepHeadings,
    jsonLd: [{ type: "Article", data: structuredData }],
    related: {
      cars: relatedCars,
      guides: [] as GuideItem[],
      columns: relatedColumns,
      heritage: relatedHeritage,
    },

    // Backward compatible fields
    relatedColumns,
    relatedCars,
    relatedHeritage,
  };
}
