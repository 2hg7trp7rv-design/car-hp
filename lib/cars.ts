// lib/cars.ts

import type { CarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";

// JSONをCarItem[]としてまとめる
const allCars: CarItem[] = [
  ...(cars1 as CarItem[]),
  ...(cars2 as CarItem[]),
];

// 一覧取得
export function getAllCars(): CarItem[] {
  return allCars;
}

// スラッグで1台取得
export function getCarBySlug(slug: string): CarItem | undefined {
  return allCars.find((car) => car.slug === slug);
}

// 型を他のファイルからも使えるように再エクスポート
export type { CarItem };
