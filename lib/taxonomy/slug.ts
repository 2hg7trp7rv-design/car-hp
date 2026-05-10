// lib/taxonomy/slug.ts

/**
 * URL 用の簡易スラッグ生成。
 * - 英数字以外は "-" に置換
 * - 連続ハイフンを圧縮
 * - 先頭/末尾のハイフンを除去
 *
 * NOTE:
 * - メーカー/カテゴリ等の “キー” 用を想定（日本語をスラッグ化する用途は想定しない）
 */
export function toSlug(input: string): string {
  const v = String(input ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();

  if (!v) return "";

  return v
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
