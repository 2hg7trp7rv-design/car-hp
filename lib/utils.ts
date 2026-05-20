// lib/utils.ts
// Tailwind / UI コンポーネント用の className 結合ユーティリティ。
// Button や MagneticArea などから `cn` が呼ばれる前提。

/**
 * 可変長のクラス名を受け取って、truthy なものだけを
 * 半角スペースで結合して返します。
 *
 * 例:
 *   cn("a", false && "b", "c") => "a c"
 */
export function cn(
  ...inputs: Array<string | number | boolean | null | undefined>
): string {
  return inputs
    .filter((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "boolean") return value;
      return String(value).trim().length > 0;
    })
    .map((value) => String(value).trim())
    .join(" ");
}
