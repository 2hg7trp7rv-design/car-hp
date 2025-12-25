// lib/viewmodel/heritage-detail.tsx

import React from "react";

import { getRelatedSlugs } from "@/lib/linking/related";

import type { HeritageItem } from "@/lib/heritage";
import type { CarItem } from "@/lib/cars";
import type { GuideItem } from "@/lib/guides";
import type { ColumnItem } from "@/lib/columns";
import { intersectionCount, recencyScore } from "@/lib/related/scoring";

import { extractHeritageCarSlugs, extractHeritageGuideSlugs, extractHeritageColumnSlugs, getHeritagePreviewText } from "@/lib/heritage";
import { getHeritageAnchorCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import { resolveCarsBySlugs, resolveGuidesBySlugs, resolveColumnsBySlugs } from "@/lib/related-content";

export type BodySection = {
  id?: string;
  title?: string;
  level: "heading" | "subheading" | null;
  lines: string[];
  carSlugs?: string[];
  guideSlugs?: string[];
  columnSlugs?: string[];
  stockCarQuery?: string;
};

export const SPEC_HEADING_PREFIX = "__SPEC_HEADING__";

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function formatDateLabel(iso?: string | null): string | null {
  const d = parseDate(iso);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createHighlightRegex(keywords: string[]): RegExp | null {
  const cleaned = keywords.map((k) => k.trim()).filter((k) => k.length > 0);
  if (cleaned.length === 0) return null;
  const pattern = cleaned.map(escapeRegExp).join("|");
  return new RegExp(`(${pattern})`, "gi");
}

export function highlightRich(
  text: string,
  regex: RegExp | null,
  carKeywordSet: Set<string>,
  keywordSet: Set<string>,
): (string | JSX.Element)[] {
  if (!regex) return [text];

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const source = text;
  const r = new RegExp(regex.source, regex.flags);

  while ((match = r.exec(source)) !== null) {
    if (match.index === r.lastIndex) r.lastIndex++;

    const start = match.index;
    const end = r.lastIndex;

    if (start > lastIndex) {
      parts.push(source.slice(lastIndex, start));
    }

    const matchedText = match[0];
    const normalized = matchedText.toLowerCase();

    let spanClassName = "";
    if (carKeywordSet.has(normalized)) {
      spanClassName = "text-tiffany-500 font-semibold text-[1.4em] leading-tight";
    } else if (keywordSet.has(normalized)) {
      spanClassName = "heritage-highlight-wave";
    } else {
      spanClassName = "bg-tiffany-50 px-0.5 text-tiffany-700";
    }

    parts.push(
      <span key={`${start}-${end}`} className={spanClassName}>
        {matchedText}
      </span>,
    );

    lastIndex = end;
  }

  if (lastIndex < source.length) {
    parts.push(source.slice(lastIndex));
  }
  return parts;
}

export function estimateReadingTimeMinutes(body: string): number {
  const plain = body.replace(/\s+/g, "");
  const length = plain.length;
  if (length === 0) return 0;
  const minutes = Math.round(length / 550);
  return minutes <= 0 ? 1 : minutes;
}


export function getHeritageBodyText(heritage: HeritageItem): string {
  const candidates = [
    (heritage as any).body,
    (heritage as any).content,
    (heritage as any).fullText,
    (heritage as any).summary,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return "";
}

export function buildHeritageHighlights(heritage: HeritageItem) {
  const carKeywords: string[] = (heritage as any).keyModels ?? [];
  const highlightKeywords: string[] = (heritage as any).highlights ?? [];
  const carKeywordSet = new Set(carKeywords.map((k) => k.toLowerCase().trim()));
  const keywordSet = new Set(highlightKeywords.map((k) => k.toLowerCase().trim()));
  const combinedKeywords = Array.from(new Set([...carKeywords, ...highlightKeywords]));
  const combinedHighlightRegex = createHighlightRegex(combinedKeywords);

  return {
    carKeywords,
    highlightKeywords,
    carKeywordSet,
    keywordSet,
    combinedKeywords,
    combinedHighlightRegex,
  };
}

export function buildHeritageContentSections(bodyText: string, heritage: HeritageItem) {
  const hasBody = bodyText.trim().length > 0;
  const formattedBodyText = hasBody ? bodyText.replace(/。/g, "。\n") : "";

  const rawSections: BodySection[] = [];
  if (formattedBodyText) {
    const lines = formattedBodyText.split(/\r?\n/).map((line) => line.trim());

    let current: BodySection | null = null;
    const pushCurrent = () => {
      if (current && (current.title || current.lines.some((l) => l && l.length > 0))) {
        rawSections.push(current);
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (current && current.lines.length > 0) current.lines.push("");
        continue;
      }

      const headingMatch = line.match(/^【(.+?)】(.*)$/);
      if (headingMatch) {
        const headingTitle = headingMatch[1];
        const rest = headingMatch[2]?.trim() ?? "";
        pushCurrent();
        current = { title: headingTitle, level: "heading", lines: [] };
        if (rest.length > 0) current.lines.push(rest);
        continue;
      }

      if (line.startsWith("■")) {
        pushCurrent();
        current = { title: line.replace(/^■\s*/, ""), level: "subheading", lines: [] };
        continue;
      }

      if (!current) current = { title: undefined, level: null, lines: [] };
      current.lines.push(line);
    }
    pushCurrent();
  }

  const bodySections: BodySection[] = [];
  for (const section of rawSections) {
    if (section.title && section.title.includes("主なスペック") && bodySections.length > 0) {
      const prevSection = bodySections[bodySections.length - 1];
      if (prevSection.lines.length > 0) prevSection.lines.push("");
      prevSection.lines.push(`${SPEC_HEADING_PREFIX}${section.title}`);
      for (const line of section.lines) prevSection.lines.push(line);
    } else {
      bodySections.push(section);
    }
  }

  const structuredSections: BodySection[] =
    Array.isArray((heritage as any).sections) && (heritage as any).sections.length > 0
      ? (heritage as any).sections.map((sec: any) => {
          const raw = typeof sec.summary === "string" ? sec.summary : "";
          const lines = raw
            ? raw
                .replace(/。/g, "。\n")
                .split(/\r?\n/)
                .map((l: string) => l.trim())
                .filter((l: string) => l.length > 0)
            : [];
          return {
            id: sec.id,
            title: sec.title ?? undefined,
            level: "heading",
            lines,
            carSlugs: sec.carSlugs ?? [],
            guideSlugs: sec.guideSlugs ?? [],
            columnSlugs: sec.columnSlugs ?? [],
            stockCarQuery: sec.stockCarQuery,
          } as BodySection;
        })
      : [];

  const normalizeHeading = (s: string) =>
    s.replace(/[【】]/g, "").replace(/[\s　]+/g, "").toLowerCase();

  const structuredByTitle = new Map<string, BodySection>();
  for (const sec of structuredSections) {
    if (sec.title) structuredByTitle.set(normalizeHeading(sec.title), sec);
  }

  const mergedBodySections: BodySection[] =
    bodySections.length > 0
      ? bodySections.map((sec) => {
          if (!sec.title) return sec;
          const meta = structuredByTitle.get(normalizeHeading(sec.title));
          if (!meta) return sec;
          return {
            ...sec,
            carSlugs: sec.carSlugs && sec.carSlugs.length > 0 ? sec.carSlugs : meta.carSlugs,
            guideSlugs:
              sec.guideSlugs && sec.guideSlugs.length > 0 ? sec.guideSlugs : meta.guideSlugs,
            columnSlugs:
              sec.columnSlugs && sec.columnSlugs.length > 0 ? sec.columnSlugs : meta.columnSlugs,
            stockCarQuery: sec.stockCarQuery ?? meta.stockCarQuery,
          };
        })
      : [];

  const contentSections = mergedBodySections.length > 0 ? mergedBodySections : structuredSections;
  const hasStructuredContent = contentSections.length > 0;

  return { hasBody, contentSections, hasStructuredContent };
}

type HeritageDetailModel = {
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

  // Existing UI fields (kept)
  title: string;
  tags: string[];
  dateLabel: string | null;
  bodyText: string;
  hasBody: boolean;
  contentSections: BodySection[];
  hasStructuredContent: boolean;
  readingTimeMinutes: number;

  carKeywordSet: Set<string>;
  keywordSet: Set<string>;
  combinedHighlightRegex: RegExp | null;
};


function pickGuidesFallbackForHeritage(args: {
  heritage: HeritageItem;
  allGuides: GuideItem[];
  carSlugs: string[];
  limit: number;
}): GuideItem[] {
  const { heritage, allGuides, carSlugs, limit } = args;
  const hTags = (heritage.tags ?? []) as string[];
  const hIntent = (heritage.intentTags ?? []) as string[];

  const carSet = new Set(carSlugs);

  const scored = allGuides.map((g) => {
    let score = 0;

    const gCarSlugs = getRelatedSlugs(g as any, "cars") as (string | null)[];
    const gCars = gCarSlugs.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
    if (gCars.some((s) => carSet.has(s))) score += 3.0;

    const gTags = ((g as any).tags ?? []) as string[];
    if (hTags.length > 0 && gTags.length > 0) score += intersectionCount(hTags, gTags) * 0.7;

    const gIntent = ((g as any).intentTags ?? []) as string[];
    if (hIntent.length > 0 && gIntent.length > 0) score += intersectionCount(hIntent, gIntent) * 0.9;

    score += recencyScore(g.publishedAt, 0.2, -0.01);

    return { g, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.g);
}

function pickColumnsFallbackForHeritage(args: {
  heritage: HeritageItem;
  allColumns: ColumnItem[];
  carSlugs: string[];
  limit: number;
}): ColumnItem[] {
  const { heritage, allColumns, carSlugs, limit } = args;
  const hTags = (heritage.tags ?? []) as string[];
  const hIntent = (heritage.intentTags ?? []) as string[];

  const carSet = new Set(carSlugs);

  const scored = allColumns.map((c) => {
    let score = 0;

    const cCarSlugs = getRelatedSlugs(c as any, "cars") as (string | null)[];
    const cCars = cCarSlugs.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
    if (cCars.some((s) => carSet.has(s))) score += 2.4;

    const cTags = (c.tags ?? []) as string[];
    if (hTags.length > 0 && cTags.length > 0) score += intersectionCount(hTags, cTags) * 0.6;

    const cIntent = ((c as any).intentTags ?? []) as string[];
    if (hIntent.length > 0 && cIntent.length > 0) score += intersectionCount(hIntent, cIntent) * 0.8;

    score += recencyScore(c.publishedAt, 0.2, -0.01);

    return { c, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

export function buildHeritageStructuredData(heritage: HeritageItem, title: string, description: string) {
  return {
    headline: title,
    description,
    datePublished: (heritage as any).publishedAt,
    dateModified: (heritage as any).updatedAt,
    image: (heritage as any).heroImage ? [(heritage as any).heroImage] : [],
    author: {
      "@type": "Organization",
      name: "CAR BOUTIQUE Editorial",
    },
  };
}

export function buildHeritageDetailModel(args: {
  heritage: HeritageItem;
  slug: string;
  allCars: CarItem[];
  allGuides: GuideItem[];
  allColumns: ColumnItem[];
}): HeritageDetailModel {
  const { heritage, slug, allCars, allGuides, allColumns } = args;

  const tags = ((heritage as any).tags ?? []) as string[];
  const title =
    (heritage as any).title ?? (heritage as any).titleJa ?? (heritage as any).slug ?? slug ?? "";
  const dateLabel =
    formatDateLabel((heritage as any).publishedAt) ?? formatDateLabel((heritage as any).updatedAt);

  const bodyText = getHeritageBodyText(heritage);
  const { hasBody, contentSections, hasStructuredContent } = buildHeritageContentSections(bodyText, heritage);

  const readingTimeMinutes =
    (heritage as any).readingTimeMinutes ?? (hasBody ? estimateReadingTimeMinutes(bodyText) : 0);

  const highlights = buildHeritageHighlights(heritage);

  // Related: Cars (本文言及 or explicit) -> fallback anchors
  const heritageCarSlugs = extractHeritageCarSlugs(heritage);
  let relatedCars = resolveCarsBySlugs(heritageCarSlugs, allCars);

  if (relatedCars.length === 0) {
    const anchors = getHeritageAnchorCars(heritage.slug);
    relatedCars = anchors.slice(0, 6) as unknown as CarItem[];
  }

  const pickedCarSlugs = relatedCars
    .map((c) => c.slug)
    .filter((s): s is string => typeof s === "string" && s.length > 0);

  // Related: Guides (explicit -> fallback)
  const guideSlugs = extractHeritageGuideSlugs(heritage);
  const explicitGuides = resolveGuidesBySlugs(guideSlugs, allGuides).slice(0, 5);
  const relatedGuides =
    explicitGuides.length > 0
      ? explicitGuides
      : pickGuidesFallbackForHeritage({
          heritage,
          allGuides,
          carSlugs: pickedCarSlugs,
          limit: 5,
        });

  // Related: Columns (explicit -> fallback)
  const columnSlugs = extractHeritageColumnSlugs(heritage);
  const explicitColumns = resolveColumnsBySlugs(columnSlugs, allColumns).slice(0, 5);
  const relatedColumns =
    explicitColumns.length > 0
      ? explicitColumns
      : pickColumnsFallbackForHeritage({
          heritage,
          allColumns,
          carSlugs: pickedCarSlugs,
          limit: 5,
        });

  const description =
    getHeritagePreviewText(heritage, { maxChars: 220 }) ||
    "時代背景から設計思想、評価の変遷までを掘り下げる HERITAGE 記事です。";

  const meta = {
    title: `${title} | CAR BOUTIQUE`,
    description,
    canonicalPath: `/heritage/${encodeURIComponent(slug)}`,
    ogImage: (heritage as any).heroImage ?? null,
  };

  const structuredData = buildHeritageStructuredData(heritage, title, description);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HOME", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "HERITAGE", item: `${getSiteUrl()}/heritage` },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${getSiteUrl()}/heritage/${encodeURIComponent(slug)}`,
      },
    ],
  };

  const jsonLd = [
    { type: "Article" as const, data: structuredData },
    { type: "BreadcrumbList" as const, data: breadcrumbData },
  ];

  return {
    meta,
    jsonLd,
    related: {
      cars: relatedCars,
      guides: relatedGuides,
      columns: relatedColumns,
      heritage: [] as HeritageItem[],
    },

    title,
    tags,
    dateLabel,
    bodyText,
    hasBody,
    contentSections,
    hasStructuredContent,
    readingTimeMinutes,
    ...highlights,
  };
}
