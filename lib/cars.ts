// lib/cars.ts
import type { Difficulty, MaintenanceCostLevel } from "@/lib/types";
export type { CarItem } from "@/lib/types";
import type { CarItem as BaseCarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
import cars3 from "@/data/cars3.json";

function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

type CarItemInternal = BaseCarItem & {
  difficulty?: Difficulty;
  maintenanceCostLevel?: MaintenanceCostLevel;

  positivePoints?: string[];
  negativePoints?: string[];
  matching?: {
    good: string[];
    bad: string[];
  };
  troublePoints?: string[];
  maintenanceTips?: string[];
  modelChange?: string[];
};

function normalizeCar(raw: any): CarItemInternal {
  return {
    ...raw,
    positivePoints: ensureArray(raw.positivePoints),
    negativePoints: ensureArray(raw.negativePoints),
    matching: raw.matching
      ? {
          good: ensureArray(raw.matching.good),
          bad: ensureArray(raw.matching.bad),
        }
      : undefined,
    troublePoints: ensureArray(raw.troublePoints),
    maintenanceTips: ensureArray(raw.maintenanceTips),
    modelChange: ensureArray(raw.modelChange),
  };
}

const allCars: CarItemInternal[] = [
  ...cars1.map(normalizeCar),
  ...cars2.map(normalizeCar),
  ...cars3.map(normalizeCar),
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
