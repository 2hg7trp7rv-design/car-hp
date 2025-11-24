import carsRaw from "@/data/cars.json"; // cars.jsonの場所に合わせてパスを変えてください

export type Difficulty = "basic" | "medium" | "advanced";
export type MaintenanceCostLevel = "low" | "medium" | "high";

export type CarItem = {
  id: string;
  name: string;
  slug: string;
  maker: string;
  releaseYear: number;
  difficulty: Difficulty;
  bodyType: string;
  segment: string;
  grade?: string;
  summary: string;
  summaryLong?: string;
  engine?: string;
  powerPs?: number | null;
  torqueNm?: number | null;
  transmission?: string;
  drive?: string;
  fuel?: string;
  fuelEconomy?: string;
  maintenanceCostLevel: MaintenanceCostLevel;
};

const cars: CarItem[] = carsRaw as CarItem[];

export function getAllCars(): CarItem[] {
  return [...cars].sort((a, b) => {
    if (a.maker === b.maker) {
      return a.name.localeCompare(b.name, "ja");
    }
    return a.maker.localeCompare(b.maker, "ja");
  });
}

export function getCarBySlug(slug: string): CarItem | null {
  const car = cars.find((c) => c.slug === slug);
  return car ?? null;
}
