// lib/cars.ts

import type cars1 from "@/data/cars/cars1.json";
import type cars2 from "@/data/cars/cars2.json";
import type cars3 from "@/data/cars/cars3.json";
import carsData1 from "@/data/cars/cars1.json";
import carsData2 from "@/data/cars/cars2.json";
import carsData3 from "@/data/cars/cars3.json";

export type CarDifficulty = "basic" | "intermediate" | "advanced";

export type CarItem = {
  id: string;
  name: string;
  slug: string;
  maker: string;
  releaseYear?: number;
  difficulty?: CarDifficulty;
  bodyType?: string;
  segment?: string;
  grade?: string;
  summary: string;
  summaryLong?: string;
  engine?: string;
  powerPs?: number;
  torqueNm?: number;
  transmission?: string;
  drive?: string;
  fuel?: string;
  fuelEconomy?: string;
  priceNew?: string;
  priceUsed?: string;
  tags?: string[];
  heroImage?: string;
};

// JSONモジュールの型をCarItem配列として扱うための補助型
type CarsJsonModule = typeof cars1 | typeof cars2 | typeof cars3;

function normalizeMaker(rawMaker: string | undefined): string {
  if (!rawMaker) return "OTHER";
  return rawMaker.toUpperCase();
}

function normalizeSlug(item: Partial<CarItem>): string {
  if (item.slug && item.slug.length > 0) return item.slug;
  if (item.id && item.id.length > 0) return item.id;
  return "";
}

function normalizeCar(item: any): CarItem | null {
  const slug = normalizeSlug(item);

  if (!slug) {
    return null;
  }

  const maker = normalizeMaker(item.maker);

  const normalized: CarItem = {
    id: item.id ?? slug,
    name: item.name ?? "",
    slug,
    maker,
    releaseYear: item.releaseYear,
    difficulty: item.difficulty,
    bodyType: item.bodyType,
    segment: item.segment,
    grade: item.grade,
    summary: item.summary ?? "",
    summaryLong: item.summaryLong,
    engine: item.engine,
    powerPs: item.powerPs,
    torqueNm: item.torqueNm,
    transmission: item.transmission,
    drive: item.drive,
    fuel: item.fuel,
    fuelEconomy: item.fuelEconomy,
    priceNew: item.priceNew,
    priceUsed: item.priceUsed,
    tags: item.tags,
    heroImage: item.heroImage,
  };

  // nameやsummaryが欠けているものは弾いておく
  if (!normalized.name || !normalized.summary) {
    return null;
  }

  return normalized;
}

function buildAllCars(): CarItem[] {
  const rawModules: CarsJsonModule[] = [carsData1, carsData2, carsData3];

  const mergedRaw = rawModules.flat() as any[];

  const seenSlugs = new Set<string>();
  const result: CarItem[] = [];

  for (const raw of mergedRaw) {
    const normalized = normalizeCar(raw);
    if (!normalized) continue;

    if (seenSlugs.has(normalized.slug)) {
      continue;
    }

    seenSlugs.add(normalized.slug);
    result.push(normalized);
  }

  result.sort((a, b) => {
    const makerA = a.maker ?? "";
    const makerB = b.maker ?? "";
    const makerCompare = makerA.localeCompare(makerB, "ja");

    if (makerCompare !== 0) {
      return makerCompare;
    }

    const yearA = a.releaseYear ?? 0;
    const yearB = b.releaseYear ?? 0;

    if (yearA !== yearB) {
      return yearB - yearA;
    }

    const nameA = a.name ?? "";
    const nameB = b.name ?? "";
    return nameA.localeCompare(nameB, "ja");
  });

  return result;
}

const ALL_CARS: CarItem[] = buildAllCars();

export async function getAllCars(): Promise<CarItem[]> {
  return ALL_CARS;
}

export async function getCarBySlug(slug: string): Promise<CarItem | undefined> {
  return ALL_CARS.find((car) => car.slug === slug);
}
