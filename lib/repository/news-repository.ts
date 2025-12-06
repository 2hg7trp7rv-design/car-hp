// lib/repository/news-repository.ts
import newsRaw from "@/data/news-latest.json";

export type NewsRecord = Record<string, unknown>;

/**
 * Data Source層:news-latest.jsonの生データを返すだけの薄い層
 */
export function findAllNews(): NewsRecord[] {
  const items = (newsRaw as NewsRecord[]) ?? [];
  return Array.isArray(items) ? items : [];
}
