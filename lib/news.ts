// lib/news.ts
import newsRaw from "@/data/news-latest.json";

export type NewsItem = {
  id: string;
  url: string;
  title: string;
  titleJa?: string;
  excerpt?: string;
  category?: string;
  maker?: string;
  tags?: string[];
  sourceName?: string;
  publishedAt?: string; // ISO文字列
  createdAt?: string;   // 生成日時など
};

/**
 * urlからidを生成する場合のフォールバック
 * 例: "https://example.com" → "rss-https%3A%2F%2Fexample.com"
 */
function encodeIdFromUrl(url: string): string {
  return `rss-${encodeURIComponent(url)}`;
}

function normalizeNewsItem(raw: any): NewsItem {
  const url: string = raw.url ?? "";
  const id: string = raw.id || (url ? encodeIdFromUrl(url) : "");

  return {
    id,
    url,
    title: raw.title ?? "(no title)",
    titleJa: raw.titleJa ?? raw.titleJaAuto ?? undefined,
    excerpt: raw.excerpt ?? undefined,
    category: raw.category ?? undefined,
    maker: raw.maker ?? undefined,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    sourceName: raw.sourceName ?? raw.source ?? undefined,
    publishedAt: raw.publishedAt ?? raw.pubDate ?? undefined,
    createdAt: raw.createdAt ?? undefined,
  };
}

// JSONから読み込んだデータを正規化＋新しい順にソート
const allNews: NewsItem[] = Array.isArray(newsRaw)
  ? (newsRaw as any[])
      .map(normalizeNewsItem)
      .sort((a, b) => {
        const aDate = a.publishedAt ?? a.createdAt ?? "";
        const bDate = b.publishedAt ?? b.createdAt ?? "";
        return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
      })
  : [];

/**
 * 最新ニュースを取得
 * limit件数分だけ返す（デフォルト80件）
 */
export async function getLatestNews(limit = 80): Promise<NewsItem[]> {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return allNews.slice(0, limit);
}

/**
 * IDからニュースを1件取得
 * （今の実装では/news/[id]ページでは使っていないが、他から呼ばれてもエラーにならないように保持）
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  if (!id) return null;
  const item = allNews.find((n) => n.id === id);
  return item ?? null;
}
