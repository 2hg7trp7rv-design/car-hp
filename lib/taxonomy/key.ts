// lib/taxonomy/key.ts

/**
 * URL 用の安定キー生成。
 *
 * - 日本語ラベルなど、slug化(toSlug)ができないケース向け
 * - 同じ入力は常に同じキーになる（安定）
 * - 人間に読めるキーを優先したい場合は、上位で overrides を用意する
 */

/** FNV-1a 32bit hash */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5; // 2166136261
  const s = String(input ?? "");

  for (let i = 0; i < s.length; i += 1) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // 16777619
  }

  // unsigned 32bit
  return hash >>> 0;
}

/**
 * 安定キーを生成（prefix + base36 hash）。
 *
 * 例:
 * - toStableKey("SUV/クロスオーバー", "bt") => "bt-1x2y3z" のような形式
 */
export function toStableKey(input: string, prefix: string): string {
  const h = fnv1a32(input);
  const core = h.toString(36);
  const p = String(prefix ?? "key").replace(/[^a-z0-9]+/gi, "").toLowerCase() || "key";
  return `${p}-${core}`;
}
