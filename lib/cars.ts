// lib/cars.ts
import type { Difficulty, MaintenanceCostLevel } from "@/lib/types";
export type { CarItem } from "@/lib/types";
import type { CarItem as BaseCarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
import cars3 from "@/data/cars3.json";

// ───────── ① ここで CarItemInternal を拡張 ─────────
// design-v2 の車種詳細ページが参照する項目を完全に網羅
type CarItemInternal = BaseCarItem & {
  difficulty?: Difficulty;
  maintenanceCostLevel?: MaintenanceCostLevel;

  // ① 好きになれるポイント
  positivePoints?: string[];

  // ② 気になる（ネガティブ）ポイント
  negativePoints?: string[];

  // ③ 合う人・合わない人
  matching?: {
    good: string[];
    bad: string[];
  };

  // ④ よくあるトラブル傾向
  troublePoints?: string[];

  // ⑤ 維持費・付き合い方のコツ
  maintenanceTips?: string[];

  // ⑥ モデルチェンジで変わったところ
  modelChange?: string[];
};
// ───────────────────────────────────────────────


// 全データ統合
const allCars: CarItemInternal[] = [
  ...(cars1 as CarItemInternal[]),
  ...(cars2 as CarItemInternal[]),
  ...(cars3 as CarItemInternal[]),
  // ...(cars4 as CarItemInternal[]),
];

// 車種一覧取得
export async function getAllCars(): Promise<CarItemInternal[]> {
  const sorted = [...allCars].sort((a, b) => {
    const aYear = a.releaseYear ?? 0;
    const bYear = b.releaseYear ?? 0;
    if (aYear !== bYear) return bYear - aYear;

    return a.slug.localeCompare(b.slug, "ja");
  });

  return sorted;
}

// スラッグで取得
export async function getCarBySlug(
  slug: string,
): Promise<CarItemInternal | null> {
  const cars = await getAllCars();
  return cars.find((car) => car.slug === slug) ?? null;
}

// メーカー別取得
export async function getCarsByMaker(
  maker: string,
  limit?: number,
): Promise<CarItemInternal[]> {
  const cars = await getAllCars();
  const filtered = cars.filter((car) => car.maker === maker);
  if (!limit || filtered.length <= limit) return filtered;
  return filtered.slice(0, limit);
}
