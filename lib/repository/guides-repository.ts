// lib/repository/guides-repository.ts

import guidesData from "@/data/guides.json";
import type {
  GuideItem,
  GuideCategory,
  ContentStatus,
} from "@/lib/content-types";

type RawGuideRecord = {
  id?: string;
  slug?: string;
  title?: string;
  summary?: string;
  category?: GuideCategory;
  tags?: string[];
  publishedAt?: string;
  readMinutes?: number;
  heroImage?: string;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: ContentStatus;
  updatedAt?: string;
  relatedCarSlugs?: string[];
};

const DEFAULT_STATUS: ContentStatus = "published";

function normalizeGuide(raw: RawGuideRecord): GuideItem | null {
  const id = raw.id?.toString().trim();
  const slug = raw.slug?.toString().trim();
  const title = raw.title?.toString().trim();
  const summary = raw.summary?.toString().trim();
  const body = raw.body?.toString();

  if (!id || !slug || !title || !summary || !body) {
    return null;
  }

  const category = (raw.category ?? null) as GuideCategory | null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t) => t.toString())
    : [];

  const readMinutes =
    typeof raw.readMinutes === "number" ? raw.readMinutes : null;

  const heroImage =
    typeof raw.heroImage === "string" ? raw.heroImage : null;

  const publishedAt =
    typeof raw.publishedAt === "string" ? raw.publishedAt : null;

  const updatedAt =
    typeof raw.updatedAt === "string" ? raw.updatedAt : null;

  const relatedCarSlugs = Array.isArray(raw.relatedCarSlugs)
    ? raw.relatedCarSlugs.map((s) => s.toString())
    : [];

  const seoTitle =
    typeof raw.seoTitle === "string" && raw.seoTitle.trim().length > 0
      ? raw.seoTitle
      : title;

  const seoDescription =
    typeof raw.seoDescription === "string" &&
    raw.seoDescription.trim().length > 0
      ? raw.seoDescription
      : summary;

  const status: ContentStatus = raw.status ?? DEFAULT_STATUS;

  const normalized: GuideItem = {
    id,
    slug,
    type: "GUIDE",
    title,
    summary,
    category,
    status,
    seoTitle,
    seoDescription,
    publishedAt,
    updatedAt,
    tags,
    readMinutes,
    heroImage,
    body,
    relatedCarSlugs,
  };

  return normalized;
}

const ALL_GUIDES: GuideItem[] = (guidesData as RawGuideRecord[])
  .map(normalizeGuide)
  .filter((g): g is GuideItem => g !== null);

export function findAllGuides(): GuideItem[] {
  return ALL_GUIDES;
}

export function findGuideBySlug(slug: string): GuideItem | undefined {
  const key = slug.trim();
  if (!key) return undefined;
  return ALL_GUIDES.find((g) => g.slug === key);
}
