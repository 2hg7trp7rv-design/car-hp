// lib/seo/search-params.ts

/**
 * searchParams が「意味のある値」を持っているかを判定する。
 *
 * 目的:
 * - 一覧ページの ?q= / ?maker= / ?page= などをまとめて noindex にしたい用途。
 *
 * 重要:
 * - 空文字でも「URLとしては別物」なので、SEO上は重複URLになりうる。
 *   例) /news と /news?tag= は内容が同じでも別URL。
 * - そのため、ここでは「キーが存在する」だけでも true 扱いにして
 *   一覧のクエリ付きURLは原則 noindex に寄せる。
 */
export function hasMeaningfulSearchParams(
  searchParams: Record<string, unknown> | undefined | null,
): boolean {
  if (!searchParams) return false;

  // searchParams にキーが1つでもあれば「クエリ付きURL」として扱う
  const keys = Object.keys(searchParams);
  if (keys.length === 0) return false;

  // Next.js の searchParams は基本 string / string[] だが、保険でチェック
  for (const k of keys) {
    const v = (searchParams as any)[k];
    if (v == null) continue;
    // 値が空でも URL は別物なので true
    return true;
  }

  return false;
}
