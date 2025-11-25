// lib/cars.ts

import type { Difficulty, MaintenanceCostLevel, CarItem as BaseCarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
import cars3 from "@/data/cars3.json";
// import cars4 from "@/data/cars4.json";

// 内部型：JSON と CarItem をそのまま統合して扱う
export type CarItemInternal = BaseCarItem & {
  difficulty?: Difficulty;
  maintenanceCostLevel?: MaintenanceCostLevel;

  // ここにも追加
  accentColor?: string | null;
};

// 全 JSON の統合
const allCars: CarItemInternal[] = [
  ...(cars1 as CarItemInternal[]),
  ...(cars2 as CarItemInternal[]),
  ...(cars3 as CarItemInternal[]),
  // ...(cars4 as CarItemInternal[]),
];

// 全車
export async function getAllCars(): Promise<CarItemInternal[]> {
  const sorted = [...allCars].sort((a, b) => {
    const ay = a.releaseYear ?? 0;
    const by = b.releaseYear ?? 0;
    if (ay !== by) return by - ay;
    return a.slug.localeCompare(b.slug, "ja");
  });
  return sorted;
}

// 1車種
export async function getCarBySlug(slug: string): Promise<CarItemInternal | null> {
  const cars = await getAllCars();
  return cars.find((c) => c.slug === slug) ?? null;
}

// メーカー別
export async function getCarsByMaker(maker: string, limit?: number): Promise<CarItemInternal[]> {
  const cars = await getAllCars();
  const filtered = cars.filter((c) => c.maker === maker);
  if (!limit || filtered.length <= limit) return filtered;
  return filtered.slice(0, limit);
}
