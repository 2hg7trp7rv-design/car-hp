// lib/cars.ts

import carsData from "@/data/cars.json";

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
  mainImage?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;
  tiresFront?: string;
  tiresRear?: string;

  // OWNERSHIP NOTES 系
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];

  // 維持費のざっくり印象
  costImpression?: string;
};

type RawCar = (typeof carsData)[number];

function normalizeDifficulty(
  raw: string | undefined,
): CarDifficulty | undefined {
  if (!raw) return undefined;
  const value = raw.toLowerCase();
  if (value === "basic" || value === "intermediate" || value === "advanced") {
    return value;
  }
  return undefined;
}

function normalizeSlug(item: Partial<RawCar>, fallbackId: string): string {
  if (item.slug && item.slug.length > 0) return item.slug;
  if (item.id && item.id.length > 0) return item.id;
  return fallbackId;
}

function normalizeCar(raw: RawCar, index: number): CarItem | null {
  // 最低限：name が無いものだけ除外
  if (!raw.name) return null;

  const id = (raw as any).id ?? (raw as any).slug ?? `car-${index}`;
  const slug = normalizeSlug(raw, id);

  // summary が無い場合はダミーテキストを詰める（一覧に出したいので）
  const summaryRaw = (raw as any).summary ?? (raw as any).summaryLong ?? "";
  const summary =
    String(summaryRaw).trim().length > 0
      ? String(summaryRaw)
      : "この車種の説明は準備中です。";

  const normalized: CarItem = {
    id,
    name: (raw as any).name,
    slug,
    maker: (raw as any).maker ?? "OTHER",
    releaseYear: (raw as any).releaseYear ?? undefined,
    difficulty: normalizeDifficulty((raw as any).difficulty),
    bodyType: (raw as any).bodyType,
    segment: (raw as any).segment,
    grade: (raw as any).grade,
    summary,
    summaryLong: (raw as any).summaryLong,
    engine: (raw as any).engine,
    powerPs: (raw as any).powerPs ?? undefined,
    torqueNm: (raw as any).torqueNm ?? undefined,
    transmission: (raw as any).transmission,
    drive: (raw as any).drive,
    fuel: (raw as any).fuel,
    fuelEconomy: (raw as any).fuelEconomy,
    priceNew: (raw as any).priceNew,
    priceUsed: (raw as any).priceUsed,
    tags: (raw as any).tags,
    heroImage: (raw as any).heroImage,
    mainImage: (raw as any).mainImage,
    lengthMm: (raw as any).lengthMm,
    widthMm: (raw as any).widthMm,
    heightMm: (raw as any).heightMm,
    wheelbaseMm: (raw as any).wheelbaseMm,
    weightKg: (raw as any).weightKg,
    tiresFront: (raw as any).tiresFront,
    tiresRear: (raw as any).tiresRear,
    strengths: (raw as any).strengths,
    weaknesses: (raw as any).weaknesses,
    troubleTrends: (raw as any).troubleTrends,
    costImpression: (raw as any).costImpression,
  };

  return normalized;
}

function buildAllCars(): CarItem[] {
  const seen = new Map<string, CarItem>();

  carsData.forEach((raw, index) => {
    const normalized = normalizeCar(raw as RawCar, index);
    if (!normalized) return;

    // slug が被っているものは最初の1件だけ採用
    if (seen.has(normalized.slug)) return;

    seen.set(normalized.slug, normalized);
  });

  const result = Array.from(seen.values());

  // 年式の新しい順 → 同年なら名前順
  result.sort((a, b) => {
    const yearA = a.releaseYear ?? 0;
    const yearB = b.releaseYear ?? 0;

    if (yearA !== yearB) return yearB - yearA;

    const nameA = a.name ?? "";
    const nameB = b.name ?? "";
    return nameA.localeCompare(nameB, "ja");
  });

  // デバッグ用（必要なければ消してOK）
  // console.log("ALL_CARS length:", result.length);

  return result;
}

// ランタイム共通のキャッシュ
const ALL_CARS: CarItem[] = buildAllCars();

// サーバー用（従来どおり async）
export async function getAllCars(): Promise<CarItem[]> {
  return ALL_CARS;
}

// クライアントコンポーネント等から使う同期版
export function getAllCarsSync(): CarItem[] {
  return ALL_CARS;
}

export async function getCarBySlug(
  slug: string,
): Promise<CarItem | undefined> {
  return ALL_CARS.find((car) => car.slug === slug);
}
