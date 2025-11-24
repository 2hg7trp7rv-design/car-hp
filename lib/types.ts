// lib/types.ts

export type Difficulty = "basic" | "medium" | "advanced";
export type MaintenanceCostLevel = "low" | "medium" | "high";

export type CarItem = {
  id: string;
  slug: string;
  name: string;
  maker: string;

  makerKana?: string;
  bodyType?: string;
  segment?: string;
  grade?: string | null;
  releaseYear?: number | null;

  summary?: string | null;
  summaryLong?: string | null;

  pros?: string | null;
  cons?: string | null;
  recommendFor?: string | null;
  notFor?: string | null;

  troubleTrends?: string | null;
  maintenanceTips?: string | null;
  changeSummary?: string | null;

  engine?: string | null;
  powerPs?: number | null;
  torqueNm?: number | null;
  transmission?: string | null;
  drive?: string | null;
  fuel?: string | null;
  fuelEconomy?: string | null;

  costNewPriceRange?: string | null;
  costUsedPriceRange?: string | null;

  sizeMmLength?: number | null;
  sizeMmWidth?: number | null;
  sizeMmHeight?: number | null;
  wheelbaseMm?: number | null;
  weightKg?: number | null;

  difficulty?: Difficulty;
  maintenanceCostLevel?: MaintenanceCostLevel;

  tags?: string[];
  referenceUrl?: string | null;
};
