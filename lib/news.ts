// lib/news.ts
import { unstable_cache } from "next/cache";
import { fetchRssArticles } from "@/lib/rss";

export type NewsItem = {
  id: string;
  title: string;
  titleJa?: string;
  slug?: string;
  publishedAt?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  sourceName?: string;
  sourceUrl?: string;
  type: "original" | "external";
  content?: string;
  tags?: string[];
};

/**
 * 全ニュースを取得（RSSのみ）
 */
export const getAllNewsCached = unstable_cache(
  async (): Promise<NewsItem[]> => {
    try {
      const rssArticles = await fetchRssArticles(20);

      const rssNews: NewsItem[] = rssArticles.map((a) => ({
        id: a.id,
        title: a.title,
        titleJa: a.title,
        slug: undefined,
        publishedAt: a.publishedAt,
        excerpt: a.excerpt,
        coverImage: undefined,
        category: a.category,
        sourceName: a.sourceName,
        sourceUrl: a.link,
        type: "external",
        content: "",
        tags: [],
      }));

      // 日付で新しい順に並べ替え
      rssNews.sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bTime - aTime;
      });

      return rssNews;
    } catch (error) {
      console.error("Failed to fetch news from RSS:", error);
      return [];
    }
  },
  ["all-news-list"],
  { revalidate: 1800, tags: ["news"] } // 30分ごとに再取得
);

/**
 * 一覧・詳細・関連ニュース用の既存関数
 */

export async function getLatestNews(limit: number = 10): Promise<NewsItem[]> {
  const all = await getAllNewsCached();
  return all.slice(0, limit);
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const all = await getAllNewsCached();
  const found = all.find((item) => item.id === id);
  return found ?? null;
}

export async function getNewsByCar(slug: string): Promise<NewsItem[]> {
  const all = await getAllNewsCached();
  const lowerSlug = slug.toLowerCase();

  return all.filter((item) => {
    const inTitle = item.title?.toLowerCase().includes(lowerSlug);
    const inExcerpt = item.excerpt?.toLowerCase().includes(lowerSlug);
    const inTags = item.tags?.some((t) => t.toLowerCase().includes(lowerSlug));
    return inTitle || inExcerpt || inTags;
  });
}

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginatedNewsResult = {
  items: NewsItem[];
  meta: PaginationMeta;
};

const ITEMS_PER_PAGE = 12;

export async function getPaginatedNews(
  page: number = 1,
): Promise<PaginatedNewsResult> {
  const allNews = await getAllNewsCached();

  const totalItems = allNews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const items = allNews.slice(startIndex, endIndex);

  return {
    items,
    meta: {
      currentPage: safePage,
      totalPages,
      totalItems,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

export async function getSearchIndex() {
  const allNews = await getAllNewsCached();
  return allNews.map((item) => ({
    id: item.id,
    title: item.titleJa ?? item.title,
    category: item.category ?? "News",
    publishedAt: item.publishedAt ?? "",
  }));
}
