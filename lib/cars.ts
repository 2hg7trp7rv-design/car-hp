// lib/cars.ts
import type { Difficulty, MaintenanceCostLevel } from "@/lib/types";
export type { CarItem } from "@/lib/types";
import type { CarItem as BaseCarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
import cars3 from "@/data/cars3.json";
// 将来的にcars4.jsonを追加する場合は下のコメントアウトを外す
// import cars4 from "@/data/cars4.json";

type CarItemInternal = BaseCarItem & {
  difficulty?: Difficulty;
  maintenanceCostLevel?: MaintenanceCostLevel;
};

const allCars: CarItemInternal[] = [
  ...(cars1 as CarItemInternal[]),
  ...(cars2 as CarItemInternal[]),
  ...(cars3 as CarItemInternal[]),
  // ...(cars4 as CarItemInternal[]),
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
