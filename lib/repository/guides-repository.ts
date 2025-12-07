// lib/repository/guides-repository.ts

import guidesRaw from "@/data/guides.json";
import guides1Raw from "@/data/guides1.json";
import guides2Raw from "@/data/guides2.json";

import type {
  GuideItem,
  ContentStatus,
  GuideCategory,
} from "@/lib/content-types";

/**
 * JSONの生データ型
 * (将来1記事1ファイルにする場合も、この型とnormalize関数だけ差し替えればOK)
 */
type RawGuideRecord = {
  id?: string;
  slug?: string;
  type?: string;
  status?: ContentStatus;

  title?: string;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  category?: GuideCategory | null;

  readMinutes?: number | null;
  heroImage?: string | null;

  body?: string;

  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];
  relatedCarSlugs?: string[];
};

// JSON→GuideItemへの正規化
function normalizeGuide(raw: RawGuideRecord, index: number): GuideItem {
  const id = raw.id ?? `guide-${index + 1}`;
  const slug = raw.slug ?? id;

  const status: ContentStatus = raw.status ?? "published";

  const title = raw.title ?? slug;

  const summary = raw.summary ?? null;
  const seoTitle = raw.seoTitle ?? null;
  const seoDescription = raw.seoDescription ?? summary ?? null;

  const category: GuideCategory | null =
    typeof raw.category === "string" ? raw.category : null;

  const readMinutes =
    typeof raw.readMinutes === "number" ? raw.readMinutes : null;

  const heroImage =
    typeof raw.heroImage === "string" ? raw.heroImage : null;

  const body = raw.body ?? "";

  const publishedAt = raw.publishedAt ?? null;
  const updatedAt = raw.updatedAt ?? null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : [];

  const relatedCarSlugs = Array.isArray(raw.relatedCarSlugs)
    ? raw.relatedCarSlugs.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
    : [];

  return {
    id,
    slug,
    type: "GUIDE",
    status,
    title,
    summary,
    seoTitle,
    seoDescription,
    category,
    readMinutes,
    heroImage,
    body,
    publishedAt,
    updatedAt,
    tags,
    relatedCarSlugs,
  };
}

// JSONを配列化するユーティリティ
function toArray(data: unknown): RawGuideRecord[] {
  if (Array.isArray(data)) return data as RawGuideRecord[];
  if (data && typeof data === "object") {
    return [data as RawGuideRecord];
  }
  return [];
}

// guides.json + guides1.json + guides2.json をまとめて配列化
const RAW_GUIDES_INTERNAL: RawGuideRecord[] = [
  ...toArray(guidesRaw),
  ...toArray(guides1Raw),
  ...toArray(guides2Raw),
];

// ビルド時に一度だけ正規化&キャッシュ
const ALL_GUIDES_INTERNAL: GuideItem[] = RAW_GUIDES_INTERNAL.map(
  normalizeGuide,
);

// ----------------------------------------
// Repositoryが外部に提供するAPI
// ----------------------------------------

/**
 * すべてのGUIDE記事(ステータス問わず)を返す
 * Domain層側でpublishedフィルタやソートを行う
 */
export function findAllGuides(): GuideItem[] {
  return ALL_GUIDES_INTERNAL;
}

/**
 * slugで1件取得(ステータスは問わない)
 */
export function findGuideBySlug(slug: string): GuideItem | undefined {
  return ALL_GUIDES_INTERNAL.find((g) => g.slug === slug);
}
