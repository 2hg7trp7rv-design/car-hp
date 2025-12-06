// lib/repository/columns-repository.ts

import columnsRaw from "@/data/columns.json";
import type {
  ColumnItem,
  ColumnCategory,
  ContentStatus,
} from "@/lib/content-types";

/**
 * JSONの生データ型
 */
type RawColumnRecord = {
  id?: string;
  slug?: string;
  type?: string;
  status?: ContentStatus;

  title?: string;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  category?: ColumnCategory;

  readMinutes?: number | null;
  heroImage?: string | null;

  body?: string;

  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];
  relatedCarSlugs?: string[];
};

function normalizeColumn(
  raw: RawColumnRecord,
  index: number,
): ColumnItem {
  const id = raw.id ?? `column-${index + 1}`;
  const slug = raw.slug ?? id;

  const status: ContentStatus = raw.status ?? "published";

  const title = raw.title ?? slug;

  const summary = raw.summary ?? null;
  const seoTitle = raw.seoTitle ?? null;
  const seoDescription = raw.seoDescription ?? summary ?? null;

  const category: ColumnCategory =
    (raw.category as ColumnCategory) ?? "TECHNICAL";

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
    type: "COLUMN",
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

function toArray(data: unknown): RawColumnRecord[] {
  if (Array.isArray(data)) return data as RawColumnRecord[];
  if (data && typeof data === "object") {
    return [data as RawColumnRecord];
  }
  return [];
}

// ビルド時に一度だけ正規化
const ALL_COLUMNS_INTERNAL: ColumnItem[] = toArray(columnsRaw).map(
  normalizeColumn,
);

// ----------------------------------------
// Repository API
// ----------------------------------------

/**
 * すべてのCOLUMN(ステータス問わず)を返す
 */
export function findAllColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL;
}

/**
 * slugで1件取得(ステータスは問わない)
 */
export function findColumnBySlug(slug: string): ColumnItem | undefined {
  return ALL_COLUMNS_INTERNAL.find((c) => c.slug === slug);
}
