// lib/news.ts
//
// ドメイン層
// ・ソートとフィルタ
// ・IDのエンコード揺れ吸収
// だけを担当する
//

import {
  findAllNews,
  findNewsByIdExact,
  type NewsItem as NewsItemBase,
} from "@/lib/repository/news-repository";

// 既存import互換
export type NewsItem = NewsItemBase;

// ---------- 内部ユーティリティ ----------

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function compareByDateDesc(a: NewsItem, b: NewsItem): number {
  const ad =
    parseDate(a.publishedAt ?? a.createdAt ?? null);
  const bd =
    parseDate(b.publishedAt ?? b.createdAt ?? null);

  if (ad && bd) return bd.getTime() - ad.getTime();
  if (bd && !ad) return 1;
  if (ad && !bd) return -1;
  return 0;
}

/**
 * URLパラメータの[id]とデータ上のidの揺れを吸収するための候補生成
 *
 * 例:
 * "rss-https-3A-2F-2Fexample.com" ←→ デコード/エンコード
 * "foo%20bar" ←→ "foo bar"
 */
function buildIdVariants(id: string): string[] {
  const set = new Set<string>();
  if (!id) return [];

  set.add(id);

  try {
    const decoded = decodeURIComponent(id);
    if (decoded) set.add(decoded);
  } catch {
    // ignore
  }

  try {
    const encoded = encodeURIComponent(id);
    if (encoded) set.add(encoded);
  } catch {
    // ignore
  }

  // 末尾の#以降や?以降を落としたバリアントも用意
  for (const value of Array.from(set)) {
    const hashIndex = value.indexOf("#");
    const qIndex = value.indexOf("?");
    const cutIndex = [hashIndex, qIndex]
      .filter((i) => i >= 0)
      .reduce(
        (acc, v) => (acc === -1 ? v : Math.min(acc, v)),
        -1,
      );

    if (cutIndex > 0) {
      set.add(value.slice(0, cutIndex));
    }
  }

  return Array.from(set).filter((v) => v.length > 0);
}

// ---------- 公開API(ドメイン層) ----------

/**
 * 全ニュース一覧(公開日降順)
 */
export async function getAllNews(): Promise<NewsItem[]> {
  const all = findAllNews();
  const sorted = [...all].sort(compareByDateDesc);
  return sorted;
}

/**
 * 最新ニュースをlimit件取得
 */
export async function getLatestNews(
  limit = 80,
): Promise<NewsItem[]> {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  const all = await getAllNews();
  return all.slice(0, limit);
}

/**
 * IDからニュースを1件取得
 *
 * Next.jsの動的ルート[id]はURLデコードされた値を渡すため、
 * JSON上のid(URLエンコード済み)とのズレをここで吸収する。
 */
export async function getNewsById(
  id: string,
): Promise<NewsItem | null> {
  if (!id) return null;

  const candidates = buildIdVariants(id);
  const all = findAllNews();

  const found = all.find((item) =>
    candidates.includes(item.id),
  );

  return found ?? null;
}
