// lib/taxonomy/body-types.ts

/**
 * bodyType の表記ゆれを吸収。
 *
 * 方針:
 * - CARS のフィルタ UI は “日本語ラベル” に寄せる
 * - 既存データの英字トークン(sedan / coupe / roadster) を日本語に統一
 */

function safeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
}

const BODYTYPE_MAP: Record<string, string> = {
  // sedan
  sedan: "セダン",

  // coupe
  coupe: "クーペ",
  "sports-coupe": "クーペ",
  "gt-coupe": "クーペ",

  // open
  roadster: "オープンカー",
  open: "オープンカー",
  "オープン": "オープンカー",
};

export function normalizeBodyTypeLabel(raw: unknown): string {
  const v = safeString(raw);
  if (!v) return "";

  const key = v.toLowerCase();
  const mapped = BODYTYPE_MAP[key];
  if (mapped) return mapped;

  // 余計な空白を整理して返す
  return v.replace(/\s+/g, " ");
}

/**
 * クエリパラメータ(bodyType)の正規化。
 * - 既存の英字値でも一致させる
 */
export function normalizeBodyTypeParam(param: unknown): string {
  return normalizeBodyTypeLabel(param);
}
