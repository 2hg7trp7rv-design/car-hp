// app/heritage/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getSiteUrl } from "@/lib/site";
import {
  buildHeritageDescription,
  buildHeritageTitleBase,
  withBrand,
} from "@/lib/seo/serp";
import { JsonLd } from "@/components/seo/JsonLd";

import {
  getAllHeritage,
  getHeritageBySlug,
  getPreviousHeritage,
  getNextHeritage,
  getNextReadHeritageV12,
  getNextReadForHeritage,
  extractHeritageCarSlugs,
  extractHeritageGuideSlugs,
  extractHeritageColumnSlugs,
  assertHeritageCarsExist,
  type HeritageItem,
} from "@/lib/heritage";

import {
  getAllCars,
  getHeritageAnchorCars,
  type CarItem,
} from "@/lib/cars";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import { NextReadShelf } from "@/components/heritage/NextReadShelf";
import { FixedGuideShelf } from "@/components/guide/FixedGuideShelf";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";

// ----------------------------------------
// アイコンコンポーネント (lucide-react依存なし)
// ----------------------------------------
const IconCar = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const IconArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const IconSearch = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// ----------------------------------------
// Dummy Data (関連コラム用)
// ----------------------------------------

// ----------------------------------------
// Page Config
// ----------------------------------------
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 60 * 60 * 24;

type PageProps = {
  params: { slug: string };
};

// ----------------------------------------
// Static Params & Validation
// ----------------------------------------
export async function generateStaticParams() {
  const all = await getAllHeritage();

  // データ整合性チェック
  for (const h of all) {
    assertHeritageCarsExist(h);
  }

  return all
    .map((item) => item.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
    .map((slug) => ({ slug }));
}

// ----------------------------------------
// Helper Functions
// ----------------------------------------

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(iso?: string | null): string | null {
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

function createHighlightRegex(keywords: string[]): RegExp | null {
  const cleaned = keywords.map((k) => k.trim()).filter((k) => k.length > 0);
  if (cleaned.length === 0) return null;
  const pattern = cleaned.map(escapeRegExp).join("|");
  return new RegExp(`(${pattern})`, "gi");
}

function highlightRich(
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
    const normalized = matchedText.toLowerCase().trim();

    // NOTE:
    // Heritage本文では、車名（keyModels等）を「文字サイズ拡大＋別色」で強調しない。
    // 読み物のリズムを優先するため、車名は装飾なし（通常テキスト）で出す。
    if (carKeywordSet.has(normalized)) {
      parts.push(matchedText);
      lastIndex = end;
      continue;
    }

    const spanClassName = keywordSet.has(normalized)
      ? "heritage-highlight-wave"
      : "bg-tiffany-50 px-0.5 text-tiffany-700";

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

function estimateReadingTimeMinutes(body: string): number {
  const plain = body.replace(/\s+/g, "");
  const length = plain.length;
  if (length === 0) return 0;
  const minutes = Math.round(length / 550);
  return minutes <= 0 ? 1 : minutes;
}

// ----------------------------------------
// Content Resolution Logic
// ----------------------------------------

type BodySection = {
  id?: string;
  title?: string;
  level: "heading" | "subheading" | null;
  lines: string[];
  // v1.2: 章ごとの関連
  carSlugs?: string[];
  guideSlugs?: string[];
  columnSlugs?: string[];
  // ★ JSONデータから受け取る在庫検索クエリ
  stockCarQuery?: string;
};

const SPEC_HEADING_PREFIX = "__SPEC_HEADING__";

function resolveCarsBySlugs(slugs: string[], allCars: CarItem[]): CarItem[] {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  const map = new Map(allCars.map((c) => [c.slug, c] as const));
  const out: CarItem[] = [];
  const seen = new Set<string>();
  for (const s of slugs) {
    const slug = typeof s === "string" ? s.trim() : "";
    if (!slug) continue;
    const car = map.get(slug);
    if (!car) continue;
    if (seen.has(car.slug)) continue;
    seen.add(car.slug);
    out.push(car);
  }
  return out;
}

function resolveGuidesBySlugs(slugs: string[], allGuides: GuideItem[]): GuideItem[] {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  const map = new Map(allGuides.map((g) => [g.slug, g] as const));
  const out: GuideItem[] = [];
  const seen = new Set<string>();
  for (const s of slugs) {
    const slug = typeof s === "string" ? s.trim() : "";
    if (!slug) continue;
    const g = map.get(slug);
    if (!g) continue;
    if (seen.has(g.slug)) continue;
    seen.add(g.slug);
    out.push(g);
  }
  return out;
}

function resolveColumnsBySlugs(slugs: string[], allColumns: ColumnItem[]): ColumnItem[] {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  const map = new Map(allColumns.map((c) => [c.slug, c] as const));
  const out: ColumnItem[] = [];
  const seen = new Set<string>();
  for (const s of slugs) {
    const slug = typeof s === "string" ? s.trim() : "";
    if (!slug) continue;
    const c = map.get(slug);
    if (!c) continue;
    if (seen.has(c.slug)) continue;
    seen.add(c.slug);
    out.push(c);
  }
  return out;
}

function intersectionCount(a: string[] | undefined, b: string[] | undefined): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const set = new Set(a.map((x) => x.toLowerCase()));
  let c = 0;
  for (const x of b) if (set.has(String(x).toLowerCase())) c += 1;
  return c;
}

function pickGuidesFallbackV12(args: {
  heritage: HeritageItem;
  allGuides: GuideItem[];
  carSlugs: string[];
  limit: number;
}): GuideItem[] {
  const { heritage, allGuides, carSlugs, limit } = args;
  const hIntent = heritage.intentTags ?? [];
  const hTags = heritage.tags ?? [];
  const carSet = new Set(carSlugs.map((s) => s.toLowerCase()));

  const scored = allGuides
    .map((g) => {
      const gAny = g as any;
      const gCars = Array.isArray(gAny.relatedCarSlugs)
        ? (gAny.relatedCarSlugs as string[]).map((s) => String(s).toLowerCase().trim())
        : [];
      const scoreCars = gCars.filter((s) => carSet.has(s)).length;
      const scoreIntent = intersectionCount(hIntent, gAny.intentTags ?? []);
      const scoreTags = intersectionCount(hTags, gAny.tags ?? []);
      const score = scoreCars * 5 + scoreIntent * 3 + scoreTags * 2;
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.g);
}

function pickColumnsFallbackV12(args: {
  heritage: HeritageItem;
  allColumns: ColumnItem[];
  carSlugs: string[];
  limit: number;
}): ColumnItem[] {
  const { heritage, allColumns, carSlugs, limit } = args;
  // ★ データがない場合はダミーを返す
  if (!allColumns || allColumns.length === 0) {
    return [];
  }

  const hIntent = heritage.intentTags ?? [];
  const hTags = heritage.tags ?? [];
  const carSet = new Set(carSlugs.map((s) => s.toLowerCase()));

  const scored = allColumns
    .map((c) => {
      const cAny = c as any;
      const cCars = Array.isArray(cAny.relatedCarSlugs)
        ? (cAny.relatedCarSlugs as string[]).map((s) => String(s).toLowerCase().trim())
        : [];
      const scoreCars = cCars.filter((s) => carSet.has(s)).length;
      const scoreIntent = intersectionCount(hIntent, cAny.intentTags ?? []);
      const scoreTags = intersectionCount(hTags, cAny.tags ?? []);
      const score = scoreCars * 5 + scoreIntent * 3 + scoreTags * 2;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.c);
}

// ----------------------------------------
// Metadata
// ----------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    const titleBase = "HERITAGEが見つかりません";
    const titleFull = withBrand(titleBase);
    const description = "指定されたHERITAGEコンテンツが見つかりませんでした。";
    const canonical = `${getSiteUrl()}/heritage/${encodeURIComponent(params.slug)}`;

    return {
      title: titleBase,
      description,
      alternates: { canonical },
      openGraph: {
        title: titleFull,
        description,
        type: "article",
        url: canonical,
        images: [`${getSiteUrl()}/ogp-default.jpg`],
      },
      twitter: {
        card: "summary_large_image",
        title: titleFull,
        description,
        images: [`${getSiteUrl()}/ogp-default.jpg`],
      },
      robots: { index: false, follow: true },
    };
  }

  // NOTE: layout.tsx の title.template で末尾にブランドが付く。
  // ページ側では “ブランド抜きの title” を返す（重複防止）。
  const titleBase = buildHeritageTitleBase(heritage);
  const titleFull = withBrand(titleBase);
  const description = buildHeritageDescription(heritage);

  const url = `${getSiteUrl()}/heritage/${heritage.slug}`;

  const rawImage =
    ((heritage as any).ogImageUrl ?? (heritage as any).imageUrl ?? heritage.heroImage ?? null) as
      | string
      | null;

  const images: string[] = [
    rawImage
      ? rawImage.startsWith("http")
        ? rawImage
        : `${getSiteUrl()}${rawImage}`
      : `${getSiteUrl()}/ogp-default.jpg`,
  ];

  return {
    title: titleBase,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: titleFull,
      description,
      images,
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images,
    },
  };
}

// ----------------------------------------
// Main Page Component
// ----------------------------------------

export default async function HeritageDetailPage({ params }: PageProps) {
  const [heritage, allCars, allGuides, allColumns] = await Promise.all([
    getHeritageBySlug(params.slug),
    getAllCars(),
    getAllGuides(),
    getAllColumns(),
  ]);

  if (!heritage) notFound();

  // Next Read Shelf（cars/guides/columns を返すのはこっち）
  const nextRead = await getNextReadForHeritage(heritage.slug, { limit: 5, min: 2 });

  // Prev/Next
  const [prev, next] = await Promise.all([
    getPreviousHeritage(heritage.slug),
    getNextHeritage(heritage.slug),
  ]);

  // More Heritage（HERITAGE一覧を返すのはこっち）
  const moreHeritage = await getNextReadHeritageV12(heritage, 3);

  // Labels & Body
  const dateLabel =
    formatDateLabel(heritage.publishedAt) ??
    formatDateLabel(heritage.updatedAt);

  const tags = heritage.tags ?? [];
  const title = heritage.title ?? heritage.titleJa ?? heritage.slug ?? params.slug;

  const bodyText = (() => {
    const candidates = [
      heritage.body,
      (heritage as any).content,
      (heritage as any).fullText,
      heritage.summary,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim().length > 0) return c.trim();
    }
    return "";
  })();

  const hasBody = bodyText.length > 0;
  const formattedBodyText = hasBody ? bodyText.replace(/。/g, "。\n") : "";

  // Highlights
  const carKeywords: string[] = heritage.keyModels ?? [];
  const highlightKeywords: string[] = (heritage as any).highlights ?? [];
  const carKeywordSet = new Set(carKeywords.map((k) => k.toLowerCase().trim()));
  const keywordSet = new Set(highlightKeywords.map((k) => k.toLowerCase().trim()));
  const combinedKeywords = Array.from(new Set([...carKeywords, ...highlightKeywords]));
  const combinedHighlightRegex = createHighlightRegex(combinedKeywords);

  const readingTimeMinutes =
    (heritage as any).readingTimeMinutes ??
    (hasBody ? estimateReadingTimeMinutes(bodyText) : 0);

  // ----------------------------------------
  // Related Content Logic
  // ----------------------------------------

  // 1. Cars (本文中で言及、またはアンカー)
  const heritageCarSlugs = extractHeritageCarSlugs(heritage);
  let relatedCarItems = resolveCarsBySlugs(heritageCarSlugs, allCars);

  if (relatedCarItems.length === 0) {
    const anchors = getHeritageAnchorCars(heritage.slug);
    relatedCarItems = anchors.slice(0, 6) as unknown as CarItem[];
  }

  const pickedCarSlugs = relatedCarItems
    .map((c) => c.slug)
    .filter((s): s is string => typeof s === "string" && s.length > 0);

  // 2. Guides (明示 > フォールバック)
  const guideSlugs = extractHeritageGuideSlugs(heritage);
  const explicitGuides = resolveGuidesBySlugs(guideSlugs, allGuides).slice(0, 5);
  const relatedGuideItems =
    explicitGuides.length > 0
      ? explicitGuides
      : pickGuidesFallbackV12({
          heritage,
          allGuides,
          carSlugs: pickedCarSlugs,
          limit: 5,
        });

  // 3. Columns (明示 > フォールバック)
  const columnSlugs = extractHeritageColumnSlugs(heritage);
  const explicitColumns = resolveColumnsBySlugs(columnSlugs, allColumns).slice(0, 5);

  const relatedColumnItems =
    explicitColumns.length > 0
      ? explicitColumns
      : pickColumnsFallbackV12({
          heritage,
          allColumns,
          carSlugs: pickedCarSlugs,
          limit: 5,
        });

  // ----------------------------------------
  // Parsing Sections
  // ----------------------------------------

  // 正規表現での簡易セクション分割（フォールバック用）
  const rawSections: BodySection[] = [];
  if (formattedBodyText) {
    const lines = formattedBodyText.split(/\r?\n/).map((line) => line.trim());

    let current: BodySection | null = null;
    const pushCurrent = () => {
      if (
        current &&
        (current.title || current.lines.some((l) => l && l.length > 0))
      ) {
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
        current = {
          title: headingTitle,
          level: "heading",
          lines: [],
        };
        if (rest.length > 0) current.lines.push(rest);
        continue;
      }

      // 小見出し（■）は「別カード」にせず、章カード内の見出しとして扱う
      if (line.startsWith("■")) {
        if (!current) current = { title: undefined, level: null, lines: [] };
        const title = line.replace(/^■\s*/, "");
        // 章カード内の見出しとしてレンダリングさせる（本文側の mdHeading ハンドラが拾う）
        current.lines.push(`### ${title}`);
        continue;
      }


      if (!current) current = { title: undefined, level: null, lines: [] };
      current.lines.push(line);
    }
    pushCurrent();
  }

  // 「主なスペック」の結合
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

  // JSON構造化データがある場合はそちらを優先
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
            // ★ データからそのまま渡す (repository層で正規化済み)
            stockCarQuery: sec.stockCarQuery,
          } as BodySection;
        })
      : [];

  // Prefer longform body text (1995-style). Use `sections` only for shelves/navigation, or as a fallback when body is missing.
  const normalizeHeadingKey = (s?: string) =>
    (s ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[：:・、。．\.\-—–_]/g, "")
      .replace(/[【】\[\]\(\)（）"“”]/g, "");

  const structuredMetaByTitle = new Map<string, BodySection>();
  for (const sec of structuredSections) {
    const key = normalizeHeadingKey(sec.title);
    if (!key) continue;
    if (!structuredMetaByTitle.has(key)) structuredMetaByTitle.set(key, sec);
  }

  const mergedBodySections: BodySection[] = bodySections.map((sec) => {
    const key = normalizeHeadingKey(sec.title);
    const meta = key ? structuredMetaByTitle.get(key) : undefined;
    return {
      ...sec,
      carSlugs: meta?.carSlugs ?? sec.carSlugs ?? [],
      guideSlugs: meta?.guideSlugs ?? sec.guideSlugs ?? [],
      columnSlugs: meta?.columnSlugs ?? sec.columnSlugs ?? [],
      stockCarQuery: meta?.stockCarQuery ?? sec.stockCarQuery,
    };
  });

  const contentSections: BodySection[] =
    mergedBodySections.length > 0 ? mergedBodySections : structuredSections;

  const hasStructuredContent = structuredSections.length > 0;

  const pageUrl = `${getSiteUrl()}/heritage/${heritage.slug}`;
  const schemaDescription =
    heritage.seoDescription ??
    heritage.summary ??
    heritage.lead ??
    "CAR BOUTIQUEによるブランド/時代のストーリーと代表車をまとめたHERITAGEコンテンツ。";

  const rawSchemaImage = ((heritage as any).ogImageUrl ?? heritage.heroImage ?? null) as string | null;
  const schemaImage = rawSchemaImage
    ? rawSchemaImage.startsWith("http")
      ? rawSchemaImage
      : `${getSiteUrl()}${rawSchemaImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  const published = heritage.publishedAt ?? null;
  const modified = heritage.updatedAt ?? published ?? null;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "HERITAGE",
        item: `${getSiteUrl()}/heritage`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: schemaDescription,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    datePublished: published ?? undefined,
    dateModified: modified ?? undefined,
    image: schemaImage ? [schemaImage] : undefined,
    author: { "@type": "Organization", name: "CAR BOUTIQUE" },
    publisher: { "@type": "Organization", name: "CAR BOUTIQUE" },
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-heritage-detail-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-heritage-detail-article" data={articleJsonLd} />
      <ScrollDepthTracker />

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative min-h-[72vh] overflow-hidden border-b border-slate-200/70 bg-white/40 backdrop-blur-sm">
        {heritage.heroImage ? (
          <>
            <Image
              src={heritage.heroImage}
              alt={title}
              fill
              priority
              quality={72}
              sizes="100vw"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* 文字の可読性確保 */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-white/40" />
            {/* 空気感 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.10),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(30,64,175,0.28),_transparent_60%)]" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.10),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(30,64,175,0.28),_transparent_60%)]" />
        )}

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-10 pt-20 md:px-6 lg:px-8 lg:pt-24">
          <Reveal className="flex-1">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                <span>CAR BOUTIQUE HERITAGE</span>
              </div>

              <div className="space-y-3">
                {heritage.maker && (
                  <p className="text-xs tracking-[0.3em] text-slate-600">
                    {heritage.maker}
                  </p>
                )}
                <h1 className="font-serif text-3xl leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {highlightRich(title, combinedHighlightRegex, carKeywordSet, keywordSet)}
                </h1>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  {dateLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 px-2.5 py-0.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{dateLabel}</span>
                    </span>
                  )}
                  {readingTimeMinutes > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 px-2.5 py-0.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>READ {readingTimeMinutes} min</span>
                    </span>
                  )}
                  {heritage.kind && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-700">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{heritage.kind}</span>
                    </span>
                  )}
                </div>

                {heritage.summary && (
                  <p className="max-w-xl text-[15px] leading-relaxed text-slate-700">
                    {heritage.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-600">
                  {heritage.keyModels?.map((model) => (
                    <span
                      key={model}
                      className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[11px] text-slate-800"
                    >
                      {model}
                    </span>
                  ))}
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/heritage?tag=${encodeURIComponent(tag)}`}
                      rel="nofollow"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[11px] text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <span className="h-1 w-1 rounded-full bg-rose-400" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {heritage.heroImage && heritage.heroImageCredit && (
            <p className="text-right text-[10px] tracking-wide text-slate-500">
              {heritage.heroImageCredit}
            </p>
          )}
        </div>
      </section>

      {/* ----------------- MAIN CONTENT & SIDEBAR ----------------- */}
      <section className="border-t border-slate-200/70 py-10 md:py-14">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:px-6 lg:px-8">

          {/* Main Text Column */}
          <Reveal className="w-full md:w-[64%]" forceVisible>
            <div className="space-y-6">
              {hasBody || hasStructuredContent ? (
                contentSections.map((section, sectionIndex) => {

                  // 各章ごとの関連データ
                  const sectionCars =
                    Array.isArray(section.carSlugs) && section.carSlugs.length > 0
                      ? resolveCarsBySlugs(section.carSlugs, allCars)
                      : [];

                  const sectionGuides =
                    Array.isArray(section.guideSlugs) && section.guideSlugs.length > 0
                      ? resolveGuidesBySlugs(section.guideSlugs, allGuides)
                      : [];

                  const sectionColumns =
                    Array.isArray(section.columnSlugs) && section.columnSlugs.length > 0
                      ? resolveColumnsBySlugs(section.columnSlugs, allColumns)
                      : [];

                  // JSONデータから指定された在庫検索クエリを使用
                  const stockQuery = section.stockCarQuery;

                  const hasSectionShelf =
                    sectionCars.length > 0 || sectionGuides.length > 0 || sectionColumns.length > 0 || !!stockQuery;

                  return (
                    <GlassCard
                      key={section.id ?? sectionIndex}
                      magnetic={false}
                      className="w-full border border-white/40 bg-white/90 p-5 text-slate-900 sm:p-6 lg:p-7"
                    >
                      {section.title && (
                        <h2
                          className={`mb-4 font-serif ${
                            section.level === "heading"
                              ? "text-2xl sm:text-3xl"
                              : "text-xl sm:text-2xl"
                          }`}
                        >
                          {highlightRich(
                            section.title,
                            combinedHighlightRegex,
                            carKeywordSet,
                            keywordSet,
                          )}
                        </h2>
                      )}

                      {/* 本文レンダリング */}
                      {section.lines.length > 0 && (
                        <div className="space-y-2">
                          {(() => {
                            const blocks: JSX.Element[] = [];
                            const lines = section.lines;

                            for (let i = 0; i < lines.length; i++) {
                              const line = lines[i];

                              if (!line) {
                                blocks.push(<div key={`spacer-${i}`} className="h-2" />);
                                continue;
                              }

                              // SPEC ヘッダー処理
                              if (line.startsWith(SPEC_HEADING_PREFIX)) {
                                const label = line.slice(SPEC_HEADING_PREFIX.length);
                                const specs: string[] = [];

                                let j = i + 1;
                                for (; j < lines.length; j++) {
                                  const nextLine = lines[j];
                                  if (nextLine && nextLine.startsWith("・")) {
                                    specs.push(nextLine);
                                  } else if (nextLine && nextLine.length === 0) {
                                    continue;
                                  } else {
                                    break;
                                  }
                                }
                                i = j - 1;

                                blocks.push(
                                  <div
                                    key={`spec-${i}`}
                                    className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[13px] sm:text-sm"
                                  >
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                                      SPEC
                                    </p>
                                    <p className="mt-1 text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                                      {highlightRich(
                                        label,
                                        combinedHighlightRegex,
                                        carKeywordSet,
                                        keywordSet,
                                      )}
                                    </p>

                                    {specs.length > 0 && (
                                      <ul className="mt-2 space-y-1">
                                        {specs.map((specLine, idx) => {
                                          const t = specLine.replace(/^・\s*/, "");
                                          return (
                                            <li
                                              key={`spec-line-${i}-${idx}`}
                                              className="flex gap-1"
                                            >
                                              <span className="mt-1 block h-[3px] w-[3px] rounded-full bg-slate-400" />
                                              <span className="text-[13px] leading-relaxed text-slate-900 sm:text-[14px]">
                                                {highlightRich(
                                                  t,
                                                  combinedHighlightRegex,
                                                  carKeywordSet,
                                                  keywordSet,
                                                )}
                                              </span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>,
                                );
                                continue;
                              }

                              // Markdown見出し（本文中に混ざる `###` などをそのまま出さない）
                              const mdHeading = line.match(/^#{2,6}\s*(.+)$/);
                              if (mdHeading) {
                                const headingText = mdHeading[1]?.trim();
                                if (headingText) {
                                  blocks.push(
                                    <h3
                                      key={`mdh-${i}`}
                                      className="mt-6 font-serif text-xl leading-snug text-slate-900 sm:text-2xl"
                                    >
                                      {highlightRich(
                                        headingText,
                                        combinedHighlightRegex,
                                        carKeywordSet,
                                        keywordSet,
                                      )}
                                    </h3>,
                                  );
                                  continue;
                                }
                              }

                              // 通常パラグラフ
                              blocks.push(
                                <p
                                  key={`p-${i}`}
                                  className="whitespace-pre-line text-[15px] leading-relaxed text-slate-900 sm:text-[18px]"
                                >
                                  {highlightRich(
                                    line,
                                    combinedHighlightRegex,
                                    carKeywordSet,
                                    keywordSet,
                                  )}
                                </p>,
                              );
                            }
                            return blocks;
                          })()}
                        </div>
                      )}

                      {/* ★ REQ 1: カード終わりの登場車種リンク棚 (IN THIS SECTION) ★ */}
                      {hasSectionShelf && (
                        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                              In This Section
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {/* 登場する車 (個別) */}
                            {sectionCars.slice(0, 4).map((car) => (
                              <Link
                                key={car.slug}
                                href={`/cars/${encodeURIComponent(car.slug)}`}
                                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-rose-400/50 hover:shadow-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500">
                                    <IconCar className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider truncate">
                                      {car.maker}
                                    </p>
                                    <p className="text-[12px] font-bold text-slate-800 group-hover:text-rose-600 truncate">
                                      {car.name}
                                    </p>
                                  </div>
                                </div>
                                <IconArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-rose-400" />
                              </Link>
                            ))}

                            {/* ★在庫を見るボタン (データから指定) */}
                            {stockQuery && (
                              <Link
                                href={`/cars?q=${encodeURIComponent(stockQuery)}`}
                                className="group flex items-center justify-between rounded-xl border border-tiffany-200 bg-tiffany-50/50 p-3 shadow-sm transition hover:border-tiffany-400/50 hover:bg-tiffany-50 hover:shadow-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tiffany-100 text-tiffany-500 group-hover:bg-tiffany-200 group-hover:text-tiffany-600">
                                    <IconSearch className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-tiffany-600/70 uppercase tracking-wider truncate">
                                      FIND STOCK
                                    </p>
                                    <p className="text-[12px] font-bold text-tiffany-800 group-hover:text-tiffany-900 truncate">
                                      {stockQuery}の在庫を探す
                                    </p>
                                  </div>
                                </div>
                                <IconArrowRight className="h-4 w-4 shrink-0 text-tiffany-400 group-hover:text-tiffany-600" />
                              </Link>
                            )}
                          </div>

                          {/* ガイド/コラム（章紐付けがあれば） */}
                          {(sectionGuides.length > 0 || sectionColumns.length > 0) && (
                            <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                              {sectionGuides.map((g) => (
                                <Link
                                  key={g.slug}
                                  href={`/guide/${g.slug}`}
                                  className="block text-[11px] text-slate-600 hover:text-rose-600 hover:underline"
                                >
                                  GUIDE: {g.title}
                                </Link>
                              ))}
                              {sectionColumns.map((c) => (
                                <Link
                                  key={c.slug}
                                  href={`/column/${c.slug}`}
                                  className="block text-[11px] text-slate-600 hover:text-rose-600 hover:underline"
                                >
                                  COLUMN: {c.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </GlassCard>
                  );
                })
              ) : (
                <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                  <p className="text-[15px] leading-relaxed text-slate-900 sm:text-[18px]">
                    このHERITAGEの本文は現在準備中です。
                    ブランドや代表モデルの詳しいストーリーは、順次追加していきます。
                  </p>
                </GlassCard>
              )}

              {/* ★ REQ 2: 記事終了直後の OWNERSHIP REALITY セクション (関連コラム) ★ */}
              {/* テキストが終わった直後に配置 */}
              {(relatedGuideItems.length > 0 || relatedColumnItems.length > 0) && (
                <div className="mt-12">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-slate-200" />
                    <h2 className="font-serif text-sm font-bold tracking-[0.2em] text-slate-700 uppercase">
                      Ownership Reality
                    </h2>
                    <div className="h-[1px] flex-1 bg-slate-200" />
                  </div>

                  <p className="mb-6 text-center text-[12px] text-slate-600">
                    憧れだけで終わらせない。維持費や選び方の現実を知る。
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* GUIDE */}
                    {relatedGuideItems.slice(0, 2).map((g) => (
                      <Link key={g.slug} href={`/guide/${encodeURIComponent(g.slug)}`} className="group h-full">
                        <GlassCard className="flex h-full flex-col justify-between border border-tiffany-200/70 bg-white/80 p-5 transition hover:border-tiffany-200 hover:bg-white/90 hover:shadow-soft">
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <span className="rounded-full bg-tiffany-500/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-tiffany-700 border border-tiffany-200/70">
                                GUIDE
                              </span>
                            </div>
                            <h3 className="font-serif text-[15px] font-medium text-slate-900 leading-relaxed group-hover:text-tiffany-700">
                              {g.title}
                            </h3>
                          </div>
                          <div className="mt-4 flex items-center justify-end border-t border-tiffany-200/70 pt-3">
                            <span className="text-[10px] font-bold tracking-widest text-tiffany-500 group-hover:underline decoration-1 underline-offset-4">READ</span>
                            <IconArrowRight className="ml-1 h-3 w-3 text-tiffany-500" />
                          </div>
                        </GlassCard>
                      </Link>
                    ))}

                    {/* COLUMN (ダミー含む) */}
                    {relatedColumnItems.slice(0, 2).map((c) => (
                      <Link key={c.slug} href={`/column/${encodeURIComponent(c.slug)}`} className="group h-full">
                        <GlassCard className="flex h-full flex-col justify-between border border-slate-200/80 bg-white/70 p-5 transition hover:border-slate-300 hover:bg-white/90">
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 border border-slate-200">
                                COLUMN
                              </span>
                            </div>
                            <h3 className="font-serif text-[15px] font-medium text-slate-900 leading-relaxed group-hover:text-rose-700">
                              {c.title}
                            </h3>
                          </div>
                          <div className="mt-4 flex items-center justify-end border-t border-slate-200 pt-3">
                            <span className="text-[10px] font-bold tracking-widest text-slate-600 group-hover:text-slate-800">READ</span>
                            <IconArrowRight className="ml-1 h-3 w-3 text-slate-500 group-hover:text-slate-700" />
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Side Column (Sidebar) */}
          <Reveal className="w-full md:w-[36%]" forceVisible>
            <div className="flex flex-col gap-6 sticky top-24">

              {/* KEY MODELS */}
              {(heritage.keyModels?.length ?? 0) > 0 && (
                <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                  <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-500 mb-3 border-b border-slate-100 pb-2">
                    KEY MODELS
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {heritage.keyModels?.map((model) => (
                      <span
                        key={model}
                        className="rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* NAV */}
              <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/heritage"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <span>←</span> BACK TO LIST
                  </Link>

                  <div className="flex gap-2">
                    {prev ? (
                      <Link
                        href={`/heritage/${encodeURIComponent(prev.slug)}`}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition"
                      >
                        <span className="block text-[9px] text-slate-400 font-bold mb-0.5">PREV</span>
                        <span className="block text-[11px] truncate leading-tight">
                          {prev.titleJa ?? prev.title}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {next && (
                      <Link
                        href={`/heritage/${encodeURIComponent(next.slug)}`}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition text-right"
                      >
                        <span className="block text-[9px] text-slate-400 font-bold mb-0.5">NEXT</span>
                        <span className="block text-[11px] truncate leading-tight">
                          {next.titleJa ?? next.title}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </div>

        {heritage.heroImageCredit && (
          <p className="pointer-events-none absolute bottom-3 right-4 max-w-[70vw] text-right text-[10px] tracking-wide text-slate-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {heritage.heroImageCredit}
          </p>
        )}
      </section>

      {/* ----------------- FOOTER SHELF ----------------- */}
      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6 lg:px-8 mt-12">
        <FixedGuideShelf className="mb-10" />
        <NextReadShelf cars={nextRead.cars} guides={nextRead.guides} columns={nextRead.columns} />
      </div>

      {/* ----------------- MORE HERITAGE ----------------- */}
      {moreHeritage.length > 0 && (
        <section className="border-t border-slate-200/70 py-10 md:py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <Reveal className="max-w-xl">
              <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-700">
                MORE HERITAGE
              </h2>
            </Reveal>

            <Reveal className="mt-5 grid gap-4 md:grid-cols-3">
              {moreHeritage.map((item) => {
                const itemDateLabel =
                  formatDateLabel(item.publishedAt) ??
                  formatDateLabel(item.updatedAt);
                const itemTitle = item.titleJa ?? item.title ?? item.slug;
                const itemMaker = item.maker ?? "";
                const itemTags = item.tags ?? [];

                return (
                  <Link
                    key={item.slug}
                    href={`/heritage/${encodeURIComponent(item.slug)}`}
                    className="group h-full"
                  >
                    <GlassCard className="flex h-full flex-col border border-white/40 bg-white/90 p-4 text-slate-900 transition group-hover:border-rose-400/70 group-hover:bg-rose-50">
                      <p className="text-[11px] tracking-[0.26em] text-slate-500">
                        {itemMaker || "HERITAGE"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-sm text-slate-900">
                        {itemTitle}
                      </h3>
                      {itemDateLabel && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          {itemDateLabel}
                        </p>
                      )}
                      {itemTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {itemTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-300/80 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </Link>
                );
              })}
            </Reveal>

            <Reveal className="mt-6">
              <div className="flex justify-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-200 bg-white/70 text-[11px] text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Link href="/heritage">HERITAGE一覧をもっと見る</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
