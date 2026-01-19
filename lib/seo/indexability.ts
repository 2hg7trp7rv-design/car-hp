// lib/seo/indexability.ts

import type { CarItem, ColumnItem } from "@/lib/content-types";

/**
 * “今 index させて良いページか？” の判定。
 *
 * 目的:
 * - 下書き/薄いページをクロールさせ続けるとサイト全体の評価が伸びづらい
 * - 「完成してから index」させる運用をコードで担保する
 */
export function isIndexableCar(car: CarItem): boolean {
  if (!car) return false;
  if (car.status && car.status !== "published") return false;

  const summaryText = `${car.summaryLong ?? ""}\n${car.summary ?? ""}`.trim();
  const hasSummary = summaryText.length >= 180;

  const strengths = Array.isArray(car.strengths)
    ? car.strengths.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean)
    : [];

  const weaknesses = Array.isArray(car.weaknesses)
    ? car.weaknesses.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean)
    : [];

  const troubles = Array.isArray(car.troubleTrends)
    ? car.troubleTrends.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean)
    : [];

  const hasStrengths = strengths.length >= 3;
  const hasConcerns = weaknesses.length + troubles.length >= 3;

  // NOTE: 価格情報は無い車種もあるため必須にはしない。
  // const hasPrice = Boolean((car.priceUsed ?? "").trim() || (car.priceNew ?? "").trim());

  // Summaryが薄い or 箇条書きが揃っていない場合は noindex（stub扱い）
  return hasSummary && (hasStrengths || hasConcerns);
}

/**
 * COLUMN の index 可否。
 *
 * 方針:
 * - “超短い stub” を index させない
 * - ただし、COLUMN は GUIDE より短めでも成立することがあるため閾値は低め
 */
export function isIndexableColumn(column: ColumnItem): boolean {
  if (!column) return false;
  if (column.noindex) return false;
  if (column.status && column.status !== "published") return false;

  const title = (column.title ?? "").trim();
  const body = (column.body ?? "").trim();

  // 目安: 120文字未満は “仮置き” の可能性が高い
  const hasMinimumBody = body.length >= 120;

  return Boolean(column.slug) && title.length > 0 && hasMinimumBody;
}
