// lib/cars.ts
import carsRaw from "@/data/cars.json";

export type CarDifficulty = "basic" | "intermediate" | "advanced";

export type CarItem = {
  id: string;
  slug: string;
  name: string;
  maker: string;
  releaseYear?: number;
  bodyType?: string;
  segment?: string;
  grade?: string;
  difficulty?: CarDifficulty;
  summary: string;
  summaryLong?: string;
  heroImage?: string;
  mainImage?: string;
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
};

function normalizeCarItem(raw: any): CarItem {
  const slug: string = raw.slug ?? raw.id ?? "";
  const id: string = raw.id ?? slug;
  const difficulty: CarDifficulty | undefined = raw.difficulty;

  return {
    id,
    slug,
    name: raw.name ?? "(名称未設定)",
    maker: raw.maker ?? "OTHER",
    releaseYear:
      typeof raw.releaseYear === "number" ? raw.releaseYear : undefined,
    bodyType: raw.bodyType ?? undefined,
    segment: raw.segment ?? undefined,
    grade: raw.grade ?? undefined,
    difficulty:
      difficulty === "basic" ||
      difficulty === "intermediate" ||
      difficulty === "advanced"
        ? difficulty
        : undefined,
    summary: raw.summary ?? "",
    summaryLong: raw.summaryLong ?? undefined,
    heroImage: raw.heroImage ?? raw.mainImage ?? undefined,
    mainImage: raw.mainImage ?? raw.heroImage ?? undefined,
    engine: raw.engine ?? undefined,
    powerPs:
      typeof raw.powerPs === "number" ? raw.powerPs : undefined,
    torqueNm:
      typeof raw.torqueNm === "number" ? raw.torqueNm : undefined,
    transmission: raw.transmission ?? undefined,
    drive: raw.drive ?? undefined,
    fuel: raw.fuel ?? undefined,
    fuelEconomy: raw.fuelEconomy ?? undefined,
    priceNew: raw.priceNew ?? undefined,
    priceUsed: raw.priceUsed ?? undefined,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

const allCars: CarItem[] = Array.isArray(carsRaw)
  ? (carsRaw as any[])
      .map(normalizeCarItem)
      .sort((a, b) => {
        const aYear = a.releaseYear ?? 0;
        const bYear = b.releaseYear ?? 0;
        return bYear - aYear;
      })
  : [];

export async function getAllCars(): Promise<CarItem[]> {
  return allCars;
}

export async function getCarBySlug(slug: string): Promise<CarItem | null> {
  const item = allCars.find((c) => c.slug === slug);
  return item ?? null;
}
