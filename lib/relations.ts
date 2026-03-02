// lib/relations.ts
// CAR / GUIDE / COLUMN / HERITAGE を横断して関連コンテンツを解決するヘルパー

import {
  getAllGuides,
  type GuideItem,
} from "@/lib/guides";
import {
  getAllColumns,
  type ColumnItem,
} from "@/lib/columns";
import {
  getAllCars,
  type CarItem,
} from "@/lib/cars";
import {
  getAllHeritage,
  type HeritageItem,
} from "@/lib/heritage";

/**
 * JSON 側に追加していく拡張メタ
 *
 * - すべて optional にしておき、存在しなければ無視される前提
 * - 型定義(lib/content-types.ts) を無理に触らず、「使う側」で拡張する
 */
type GuideWithMeta = GuideItem & {
  relatedCarSlugs?: (string | null)[];
  relatedGuideSlugs?: (string | null)[];
  relatedColumnSlugs?: (string | null)[];
  primaryBrandSlug?: string | null;
};

type ColumnWithMeta = ColumnItem & {
  relatedCarSlugs?: (string | null)[];
  relatedGuideSlugs?: (string | null)[];
  relatedHeritageSlugs?: (string | null)[];
  primaryBrandSlug?: string | null;
};

type HeritageWithMeta = HeritageItem & {
  keyCarSlugs?: (string | null)[];
  relatedGuideSlugs?: (string | null)[];
  relatedColumnSlugs?: (string | null)[];
  brandSlug?: string | null;
};

type CarWithMeta = CarItem & {
  brandSlug?: string | null;
  relatedGuideSlugs?: (string | null)[];
  relatedColumnSlugs?: (string | null)[];
  relatedHeritageSlug?: string | null;
};

function normalizeSlugArray(values?: (string | null)[] | null): string[] {
  if (!values) return [];
  return values
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

// ─────────────────────────────────────
// GUIDE まわり
// ─────────────────────────────────────

/**
 * 指定した carSlug を relatedCarSlugs に含む GUIDE を返す
 */
export async function findGuidesByRelatedCarSlug(
  carSlug: string,
  limit = 4,
): Promise<GuideItem[]> {
  const allGuides = (await getAllGuides()) as GuideWithMeta[];
  const target = carSlug.trim();
  if (!target) return [];

  const filtered = allGuides.filter((g) =>
    normalizeSlugArray(g.relatedCarSlugs).includes(target),
  );

  return filtered.slice(0, limit);
}

/**
 * slug 配列から GUIDE をまとめて取得
 */
export async function findGuidesBySlugs(
  slugs: string[],
  limit?: number,
): Promise<GuideItem[]> {
  const set = new Set(slugs.map((s) => s.trim()).filter(Boolean));
  if (set.size === 0) return [];

  const allGuides = await getAllGuides();
  const result = allGuides.filter((g) => set.has(g.slug));

  if (typeof limit === "number") {
    return result.slice(0, limit);
  }
  return result;
}

// ─────────────────────────────────────
// COLUMN まわり
// ─────────────────────────────────────

/**
 * 指定した carSlug を relatedCarSlugs に含む COLUMN を返す
 */
export async function findColumnsByRelatedCarSlug(
  carSlug: string,
  limit = 4,
): Promise<ColumnItem[]> {
  const allColumns = (await getAllColumns()) as ColumnWithMeta[];
  const target = carSlug.trim();
  if (!target) return [];

  const filtered = allColumns.filter((c) =>
    normalizeSlugArray(c.relatedCarSlugs).includes(target),
  );

  return filtered.slice(0, limit);
}

/**
 * slug 配列から COLUMN をまとめて取得
 */
export async function findColumnsBySlugs(
  slugs: string[],
  limit?: number,
): Promise<ColumnItem[]> {
  const set = new Set(slugs.map((s) => s.trim()).filter(Boolean));
  if (set.size === 0) return [];

  const allColumns = await getAllColumns();
  const result = allColumns.filter((c) => set.has(c.slug));

  if (typeof limit === "number") {
    return result.slice(0, limit);
  }
  return result;
}

// ─────────────────────────────────────
// CAR まわり
// ─────────────────────────────────────

/**
 * slug 配列から CAR をまとめて取得
 */
export async function findCarsBySlugs(
  slugs: string[],
  limit?: number,
): Promise<CarItem[]> {
  const set = new Set(slugs.map((s) => s.trim()).filter(Boolean));
  if (set.size === 0) return [];

  const allCars = await getAllCars();
  const result = allCars.filter((c) => c.slug && set.has(c.slug));

  if (typeof limit === "number") {
    return result.slice(0, limit);
  }
  return result;
}

// ─────────────────────────────────────
// HERITAGE まわり
// ─────────────────────────────────────

/**
 * slug 配列から HERITAGE をまとめて取得
 */
export async function findHeritageBySlugs(
  slugs: string[],
  limit?: number,
): Promise<HeritageItem[]> {
  const set = new Set(slugs.map((s) => s.trim()).filter(Boolean));
  if (set.size === 0) return [];

  const allHeritage = await getAllHeritage();
  const result = allHeritage.filter((h) => set.has(h.slug));

  if (typeof limit === "number") {
    return result.slice(0, limit);
  }
  return result;
}

/**
 * brandSlug から HERITAGE を 1 件返す（ブランド → HERITAGE の入口用）
 */
export async function findHeritageByBrandSlug(
  brandSlug: string,
): Promise<HeritageItem | null> {
  const target = brandSlug.trim();
  if (!target) return null;

  const allHeritage = (await getAllHeritage()) as HeritageWithMeta[];
  const hit = allHeritage.find(
    (h) =>
      h.slug === target ||
      (typeof h.brandSlug === "string" && h.brandSlug === target),
  );
  return hit ?? null;
}
