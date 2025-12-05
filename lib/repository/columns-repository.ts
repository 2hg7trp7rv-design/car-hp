// lib/repository/columns-repository.ts

import columnsRaw from "@/data/columns.json";
import type {
  ColumnItem,
  ColumnCategory,
  ContentStatus,
} from "@/lib/content-types";

type RawColumnRecord = {
  id?: string;
  slug?: string;
  title?: string;
  summary?: string;
  category?: ColumnCategory;
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
  readMinutes?: number;
  heroImage?: string;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: ContentStatus;
  relatedCarSlugs?: string[];
};

const DEFAULT_STATUS: ContentStatus = "published";

function normalizeColumn(raw: RawColumnRecord): ColumnItem | null {
  const id = raw.id?.toString().trim();
  const slug = raw.slug?.toString().trim();
  const title = raw.title?.toString().trim();
  const summary = raw.summary?.toString().trim();
  const body = raw.body?.toString();

  if (!id || !slug || !title || !summary || !body) {
    return null;
  }

  const category =
    (raw.category ?? null) !== null
      ? (String(raw.category) as ColumnCategory)
      : null;

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

  let status: ContentStatus = raw.status ?? DEFAULT_STATUS;

  // 将来OWNER_STORYを復活させたい場合に備えて
  // ひとまずOWNER_STORYはdraft扱いにしておく
  if (
    typeof raw.category === "string" &&
    raw.category.toUpperCase() === "OWNER_STORY"
  ) {
    status = "draft";
  }

  const seoTitle =
    typeof raw.seoTitle === "string" && raw.seoTitle.trim().length > 0
      ? raw.seoTitle
      : title;

  const seoDescription =
    typeof raw.seoDescription === "string" &&
    raw.seoDescription.trim().length > 0
      ? raw.seoDescription
      : summary;

  const relatedCarSlugs = Array.isArray(raw.relatedCarSlugs)
    ? raw.relatedCarSlugs.map((s) => s.toString())
    : [];

  const normalized: ColumnItem = {
    id,
    slug,
    type: "COLUMN",
    status,
    title,
    summary,
    category,
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

const ALL_COLUMNS: ColumnItem[] = Array.isArray(columnsRaw)
  ? (columnsRaw as RawColumnRecord[])
      .map(normalizeColumn)
      .filter((c): c is ColumnItem => c !== null)
  : [];

// Repository公開関数

export function findAllColumns(): ColumnItem[] {
  return ALL_COLUMNS;
}

export function findColumnBySlug(
  slug: string,
): ColumnItem | undefined {
  const key = slug.trim();
  if (!key) return undefined;
  return ALL_COLUMNS.find((c) => c.slug === key);
}
