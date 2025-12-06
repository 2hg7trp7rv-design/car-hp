// lib/repository/columns-repository.ts
//
// COLUMNコンテンツのRepository層。
// data/columns.json という「永続化の詳細」をここに閉じ込める。

import columnsData from "@/data/columns.json";
import type {
  ColumnItem,
  ColumnCategory,
  ContentStatus,
} from "@/lib/content-types";

type RawColumnRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category?: ColumnCategory | string | null;
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

const ALLOWED_COLUMN_CATEGORIES: ColumnCategory[] = [
  "MAINTENANCE",
  "TECHNICAL",
];

function normalizeCategory(value?: string | null): ColumnCategory {
  if (!value) return "TECHNICAL";
  const upper = value.trim().toUpperCase();
  if ((ALLOWED_COLUMN_CATEGORIES as string[]).includes(upper)) {
    return upper as ColumnCategory;
  }
  // 想定外はとりあえずTECHNICAL扱い
  return "TECHNICAL";
}

function normalizeColumn(raw: RawColumnRecord): ColumnItem | null {
  const id = String(raw.id ?? "").trim();
  const slug = String(raw.slug ?? raw.id ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const summary = String(raw.summary ?? "").trim();

  if (!id || !slug || !title || !summary) {
    return null;
  }

  const category = normalizeCategory(raw.category ?? null);

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

  const heroImage =
    typeof raw.heroImage === "string" && raw.heroImage.trim().length > 0
      ? raw.heroImage
      : null;

  const body = typeof raw.body === "string" ? raw.body : "";

  const publishedAt =
    typeof raw.publishedAt === "string" && raw.publishedAt.trim().length > 0
      ? raw.publishedAt
      : null;

  const status: ContentStatus = raw.status ?? "published";

  const seoTitle =
    typeof raw.seoTitle === "string" && raw.seoTitle.trim().length > 0
      ? raw.seoTitle
      : null;

  const seoDescription =
    typeof raw.seoDescription === "string" && raw.seoDescription.trim().length > 0
      ? raw.seoDescription
      : null;

  const normalized: ColumnItem = {
    id,
    slug,
    type: "COLUMN",
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

const ALL_COLUMNS_INTERNAL: ColumnItem[] = (columnsData as RawColumnRecord[])
  .map(normalizeColumn)
  .filter((c): c is ColumnItem => c !== null);

/**
 * 全COLUMN記事(生データ)を返す。
 * Domain層からのみ呼び出す想定。
 */
export function findAllColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL;
}

/**
 * slugでCOLUMN記事を1件取得。
 * 見つからなければ undefined。
 */
export function findColumnBySlug(slug: string): ColumnItem | undefined {
  if (!slug) return undefined;
  return ALL_COLUMNS_INTERNAL.find((c) => c.slug === slug);
}
