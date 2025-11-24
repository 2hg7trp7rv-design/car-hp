// lib/cars.ts

import type { CarItem } from "@/lib/types";
import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";

// JSONの中身はlib/types.tsのCarItemに合わせておけばOK
const allCars: CarItem[] = [
  ...(cars1 as CarItem[]),
  ...(cars2 as CarItem[]),
];

// 一覧取得
export function getAllCars(): Promise<CarItem[]> {
  return Promise.resolve(allCars);
}

// slugで1件取得
export async function getCarBySlug(slug: string): Promise<CarItem | null> {
  const found = allCars.find((car) => car.slug === slug);
  return found ?? null;
}

// メーカーで絞り込み
export function getCarsByMaker(maker: string): CarItem[] {
  const normalized = maker.toLowerCase();
  return allCars.filter(
    (car) => car.maker && car.maker.toLowerCase() === normalized,
  );
}

// ボディタイプで絞り込み
export function getCarsByBodyType(bodyType: string): CarItem[] {
  const normalized = bodyType.toLowerCase();
  return allCars.filter(
    (car) => car.bodyType && car.bodyType.toLowerCase() === normalized,
  );
}

// タグで絞り込み
export function getCarsByTag(tag: string): CarItem[] {
  const normalized = tag.toLowerCase();
  return allCars.filter(
    (car) =>
      Array.isArray(car.tags) &&
      car.tags.some((t) => t.toLowerCase() === normalized),
  );
}

// app/cars/page.tsx から import type { CarItem } from "@/lib/cars"; を成立させるための再エクスポート
export type { CarItem } from "@/lib/types";
