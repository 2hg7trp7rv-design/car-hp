// lib/cars.ts
import carsData from "@/data/cars.json";

// cars.jsonから型をそのまま推論して使う
export type CarItem = (typeof carsData)[number];

export async function getAllCars(): Promise<CarItem[]> {
  // 非同期っぽいインターフェースはそのまま維持
  return carsData;
}

export async function getCarBySlug(slug: string): Promise<CarItem | null> {
  const car = carsData.find((c) => c.slug === slug);
  return car ?? null;
}
