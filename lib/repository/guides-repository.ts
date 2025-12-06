// lib/repository/guides-repository.ts
//
// GUIDEコンテンツのRepository層。
// data/guides.json という「永続化の詳細」をここに閉じ込める。

import guidesData from "@/data/guides.json";
import type { GuideItem, GuideCategory, ContentStatus } from "@/lib/content-types";

type RawGuideRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category?: GuideCategory | string | null;
  tags?: string[];
  publishedAt?: string | null;
  readMinutes?: number;
  heroImage?: string;
  body?: string;
  relatedCarSlugs?: string[];
  status?: ContentStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

function normalizeGuide(raw: RawGuideRecord): GuideItem | null {
  const id = String(raw.id ?? "").trim();
  const slug = String(raw.slug ?? raw.id ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const summary = String(raw.summary ?? "").trim();

  if (!id || !slug || !title || !summary) {
    return null;
  }

  const category =
    typeof raw.category === "string" && raw.category.trim().length > 0
      ? (raw.category.trim() as GuideCategory)
      : null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : [];

  const relatedCarSlugs = Array.isArray(raw.relatedCarSlugs)
    ? raw.relatedCarSlugs.filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0,
      )
    : [];

  const readMinutes =
    typeof raw.readMinutes === "number" && Number.isFinite(raw.readMinutes)
      ? raw.readMinutes
      : undefined;

  const status: ContentStatus = raw.status ?? "published";

  const heroImage =
    typeof raw.heroImage === "string" && raw.heroImage.trim().length > 0
      ? raw.heroImage
      : null;

  const body = typeof raw.body === "string" ? raw.body : "";

  const publishedAt =
    typeof raw.publishedAt === "string" && raw.publishedAt.trim().length > 0
      ? raw.publishedAt
      : null;

  const seoTitle =
    typeof raw.seoTitle === "string" && raw.seoTitle.trim().length > 0
      ? raw.seoTitle
      : null;

  const seoDescription =
    typeof raw.seoDescription === "string" && raw.seoDescription.trim().length > 0
      ? raw.seoDescription
      : null;

  const normalized: GuideItem = {
    id,
    slug,
    type: "GUIDE",
    category,
    status,
    title,
    summary,
    seoTitle,
    seoDescription,
    publishedAt,
    updatedAt: null,
    tags,
    heroImage,
    readMinutes,
    body,
    relatedCarSlugs,
  };

  return normalized;
}

const ALL_GUIDES_INTERNAL: GuideItem[] = (guidesData as RawGuideRecord[])
  .map(normalizeGuide)
  .filter((g): g is GuideItem => g !== null);

/**
 * 全GUIDE記事(生データ)を返す。
 * Domain層からのみ呼び出す想定。
 */
export function findAllGuides(): GuideItem[] {
  return ALL_GUIDES_INTERNAL;
}

/**
 * slugでGUIDE記事を1件取得。
 * 見つからなければ undefined。
 */
export function findGuideBySlug(slug: string): GuideItem | undefined {
  if (!slug) return undefined;
  return ALL_GUIDES_INTERNAL.find((g) => g.slug === slug);
}
