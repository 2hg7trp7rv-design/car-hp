// lib/cars.ts

/**
 * CARS Domain層
 *
 * 役割:
 * - Data Source層(lib/repository/cars-repository)から上がってくるデータを
 * 画面(App層)で扱いやすい形に整形・ソートして提供する
 */

import {
  findAllCars,
  findCarBySlug,
  // 必要なリポジトリ関数があれば追加
} from "@/lib/repository/cars-repository";

import { findAllColumns } from "@/lib/repository/columns-repository";
import { findAllGuides } from "@/lib/repository/guides-repository";

// ★ 型定義は content-types からインポートして統一
import type { 
  CarItem, 
  ColumnItem, 
  GuideItem 
} from "@/lib/content-types";

// 外部へ公開する型
export type { CarItem };

// ----------------------------------------
// 内部キャッシュ (ソート済みリスト)
// ----------------------------------------

const ALL_CARS_CACHE: CarItem[] = (() => {
  const cars = findAllCars();
  // 発売年が新しい順、なければメーカー名順などでソート
  return [...cars].sort((a, b) => {
    const yA = a.releaseYear ?? 0;
    const yB = b.releaseYear ?? 0;
    if (yA !== yB) return yB - yA;
    return a.maker.localeCompare(b.maker);
  });
})();

// ----------------------------------------
// 公開API
// ----------------------------------------

export async function getAllCars(): Promise<CarItem[]> {
  return ALL_CARS_CACHE;
}

/** 同期取得版 (legacy互換) */
export function getAllCarsSync(): CarItem[] {
  return ALL_CARS_CACHE;
}

export async function getCarBySlug(slug: string): Promise<CarItem | undefined> {
  return ALL_CARS_CACHE.find((c) => c.slug === slug);
}

/**
 * HERITAGEページ専用アンカー取得
 * (特定のheritageSlugに関連付けられた車を返す)
 */
export function getHeritageAnchorCars(heritageSlug: string): CarItem[] {
  // 現状のデータ構造に合わせて実装
  // 例: heritageSlugに関連する車をフィルタリング
  return ALL_CARS_CACHE.filter((c) => {
    // 関連HERITAGEスラッグを持っているかチェック
    return c.relatedHeritageSlugs?.includes(heritageSlug);
  });
}

// ----------------------------------------
// v1.2: Ownership棚（Car → Guide）
// ----------------------------------------

type OwnershipGuideOptions = {
  limit?: number;
  includeNonPublished?: boolean;
};

/**
 * Carに紐づくGuideを返す（Ownership棚用）
 */
export function getOwnershipGuidesForCarSlug(
  carSlug: string,
  options: OwnershipGuideOptions = {},
): GuideItem[] {
  const slug = carSlug.trim();
  if (!slug) return [];

  const limit = options.limit ?? 5;
  const includeNonPublished = options.includeNonPublished === true;

  const car = ALL_CARS_CACHE.find((c) => c.slug === slug);
  const allGuides = findAllGuides();

  const pool = includeNonPublished
    ? allGuides
    : allGuides.filter((g) => g.status === "published");

  const picked: GuideItem[] = [];
  const seen = new Set<string>();

  // 1) 明示関連（入力順を尊重）
  const explicitSlugs = car?.relatedGuideSlugs ?? [];
  for (const gSlug of explicitSlugs) {
    const g = pool.find((x) => x.slug === gSlug);
    if (!g) continue;
    if (seen.has(g.slug)) continue;
    seen.add(g.slug);
    picked.push(g);
    if (picked.length >= limit) return picked;
  }

  // 2) 逆引き補完（Guide側に relatedCarSlugs があるもの）
  for (const g of pool) {
    if (seen.has(g.slug)) continue;
    if (g.relatedCarSlugs?.includes(slug) !== true) continue;
    seen.add(g.slug);
    picked.push(g);
    if (picked.length >= limit) break;
  }

  return picked;
}

/**
 * Carに紐づくColumnを返す
 */
export function getRelatedColumnsForCarSlug(
  carSlug: string,
  limit = 5,
): ColumnItem[] {
  const slug = carSlug.trim();
  if (!slug) return [];

  const all = findAllColumns();
  const published = all.filter((c) => c.status === "published");

  const picked: ColumnItem[] = [];
  const seen = new Set<string>();

  // 1) cars.json 明示
  const car = ALL_CARS_CACHE.find((c) => c.slug === slug);
  const explicit = car?.relatedColumnSlugs ?? [];
  for (const cSlug of explicit) {
    const c = published.find((x) => x.slug === cSlug);
    if (!c) continue;
    if (seen.has(c.slug)) continue;
    seen.add(c.slug);
    picked.push(c);
    if (picked.length >= limit) return picked;
  }

  // 2) 逆引き
  for (const c of published) {
    if (seen.has(c.slug)) continue;
    if (c.relatedCarSlugs?.includes(slug) !== true) continue;
    seen.add(c.slug);
    picked.push(c);
    if (picked.length >= limit) break;
  }

  return picked;
}

/**
 * 指定slug配列に対応するCarを、入力順を保って返す。
 * 見つからないslugはスキップする。
 */
export async function getCarsBySlugs(slugs: string[]): Promise<CarItem[]> {
  const wanted = (Array.isArray(slugs) ? slugs : [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  if (wanted.length === 0) return [];

  const all = await getAllCars();
  const bySlug = new Map(all.map((c) => [c.slug, c] as const));

  const out: CarItem[] = [];
  const seen = new Set<string>();
  for (const s of wanted) {
    if (seen.has(s)) continue;
    const c = bySlug.get(s);
    if (!c) continue;
    seen.add(s);
    out.push(c);
  }

  return out;
}
