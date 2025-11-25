// lib/cars.ts
import type { Difficulty, MaintenanceCostLevel } from "@/lib/types";
export type { CarItem } from "@/lib/types";
import type { CarItem as BaseCarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
import cars3 from "@/data/cars3.json";
// 将来的にcars4.jsonを追加する場合は下のコメントアウトを外す
// import cars4 from "@/data/cars4.json";

/**
 * サイト内部で使うCarItem
 * 既存のBaseCarItemに、評価系のフィールドを追加
 *
 * 文字列1本だけで持っている既存データとの互換性を保つために
 * string | string[] としておく
 */
export type CarItemInternal = BaseCarItem & {
  difficulty?: Difficulty;
  maintenanceCostLevel?: MaintenanceCostLevel;

  // ① 好きになれるポイント
  positivePoints?: string | string[];
  // 既存データ互換用
  favoritePoints?: string | string[];

  // ② 気になるかもしれないポイント
  negativePoints?: string | string[];
  // 既存データ互換用
  cautionPoints?: string | string[];

  // ③ この車の合う人・合わない人
  matching?: {
    good?: string | string[];
    bad?: string | string[];
  };
  // 既存データ互換用
  matchingGood?: string | string[];
  matchingBad?: string | string[];
  suitableFor?: string | string[];
  notFor?: string | string[];

  // ④ よくあるトラブル傾向
  troublePoints?: string | string[];
  troubleFaq?: string | string[];

  // ⑤ 維持費と付き合い方のコツ
  maintenanceTips?: string | string[];
  ownershipTips?: string | string[];

  // ⑥ モデルチェンジで変わったところ
  modelChange?: string | string[];
  modelChangePoints?: string | string[];
};

// 全データ統合
const allCars: CarItemInternal[] = [
  ...(cars1 as unknown as CarItemInternal[]),
  ...(cars2 as unknown as CarItemInternal[]),
  ...(cars3 as unknown as CarItemInternal[]),
  // ...(cars4 as unknown as CarItemInternal[]),
];

export async function getAllCars(): Promise<CarItemInternal[]> {
  const sorted = [...allCars].sort((a, b) => {
    const aYear = a.releaseYear ?? 0;
    const bYear = b.releaseYear ?? 0;
    if (aYear !== bYear) return bYear - aYear;

    return a.slug.localeCompare(b.slug, "ja");
  });

  return sorted;
}

export async function getCarBySlug(
  slug: string,
): Promise<CarItemInternal | null> {
  const cars = await getAllCars();
  return cars.find((car) => car.slug === slug) ?? null;
}

export async function getCarsByMaker(
  maker: string,
  limit?: number,
): Promise<CarItemInternal[]> {
  const cars = await getAllCars();
  const filtered = cars.filter((car) => car.maker === maker);
  if (!limit || filtered.length <= limit) return filtered;
  return filtered.slice(0, limit);
}
