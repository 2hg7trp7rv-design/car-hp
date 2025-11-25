// lib/types.ts

export type Difficulty = "basic" | "medium" | "advanced";
export type MaintenanceCostLevel = "low" | "medium" | "high";

// ここが全車種 JSON の「正規型」
export type CarItem = {
  id: string;
  name: string;
  slug: string;
  maker: string;

  releaseYear?: number | null;
  difficulty?: Difficulty;

  bodyType?: string | null;
  segment?: string | null;
  grade?: string | null;

  summary?: string | null;
  summaryLong?: string | null;

  engine?: string | null;
  powerPs?: number | null;
  torqueNm?: number | null;
  transmission?: string | null;
  drive?: string | null;
  fuel?: string | null;
  fuelEconomy?: string | null;

  sizeMmLength?: number | null;
  sizeMmWidth?: number | null;
  sizeMmHeight?: number | null;
  wheelbaseMm?: number | null;
  weightKg?: number | null;

  specHighlights?: string | null;
  pros?: string | null;
  cons?: string | null;

  troubleTrends?: string | null;
  maintenanceTips?: string | null;

  costNewPriceRange?: string | null;
  costUsedPriceRange?: string | null;

  maintenanceCostLevel?: MaintenanceCostLevel;

  // 今回追加
  accentColor?: string | null;

  recommendFor?: string | null;
  notFor?: string | null;
  changeSummary?: string | null;

  referenceUrl?: string | null;
  tags?: string[];
};
