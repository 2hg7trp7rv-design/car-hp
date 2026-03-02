// lib/taxonomy/makers.ts

import { toSlug } from "@/lib/taxonomy/slug";

export type MakerInfo = {
  key: string; // URL/フィルタ用の正規化キー (例: "bmw")
  label: string; // 表示名 (例: "BMW")
  count: number;
};

function safeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
}

/**
 * 表示名の正規化。
 * - データの表記ゆれ(例: Ferrari / FERRARI) を吸収
 * - NEWS 側の maker も概ね大文字なので、基本は英字を大文字に寄せる
 */
export function normalizeMakerLabel(raw: unknown): string {
  const v = safeString(raw);
  if (!v) return "";

  // 英字が含まれる場合は大文字へ
  if (/[A-Za-z]/.test(v)) return v.toUpperCase();
  return v;
}

/**
 * メーカーのキー（スラッグ）を生成。
 * - 例: "MERCEDES-BENZ" -> "mercedes-benz"
 */
export function normalizeMakerKey(raw: unknown): string {
  const label = normalizeMakerLabel(raw);
  if (!label) return "";
  return toSlug(label);
}

/**
 * URL / クエリパラメータからメーカーキーへ正規化。
 * - "BMW" / "bmw" / "Bmw" を同一キーへ
 */
export function normalizeMakerParamToKey(param: unknown): string {
  const v = safeString(param);
  if (!v) return "";
  // すでに slug の可能性もあるので、まず slug 化して比較可能にする
  // （"BMW" -> "bmw" など）
  return toSlug(v);
}

/**
 * CARS 配列からメーカー一覧（重複排除 + 件数）を作る。
 */
export function buildMakerInfos(
  cars: Array<{ maker?: string | null; makerKey?: string | null }>,
): MakerInfo[] {
  const map = new Map<string, MakerInfo>();

  for (const car of cars) {
    const label = normalizeMakerLabel(car?.maker);
    const key = (car?.makerKey ?? "").trim() || normalizeMakerKey(label);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { key, label: label || key.toUpperCase(), count: 1 });
    } else {
      existing.count += 1;
      // label は “より長い/情報量が多い”ものを優先（安定させる）
      if ((label ?? "").length > (existing.label ?? "").length) {
        existing.label = label;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "ja"),
  );
}

/**
 * makerKey -> label を引く（見つからなければ key をそれっぽく表示）。
 */
export function resolveMakerLabel(makerKey: string, makers: MakerInfo[]): string {
  const key = String(makerKey ?? "").trim();
  if (!key) return "";
  const hit = makers.find((m) => m.key === key);
  if (hit) return hit.label;

  // fallback: "mercedes-benz" -> "MERCEDES BENZ"
  return key.replace(/-/g, " ").toUpperCase();
}
