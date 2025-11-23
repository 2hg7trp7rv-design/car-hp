// lib/news.ts
import { unstable_cache } from "next/cache";
import { fetchRssArticles } from "./rss";
import type { RssArticle } from "./rss";

export type NewsItem = {
  id: string;
  title: string;
  titleJa?: string;
  publishedAt?: string;
  excerpt?: string;
  category?: string;
  sourceName?: string;
  sourceUrl?: string;
  type?: "external" | "original";
  tags?: string[];
  content?: string;
};

function normalizeRssArticles(articles: RssArticle[]): NewsItem[] {
  return articles.map((a) => ({
    id: a.id,
    title: a.title,
    publishedAt: a.publishedAt,
    excerpt: a.excerpt,
    category: a.category ?? "News",
    sourceName: a.sourceName,
    sourceUrl: a.link,
    type: "external",
    tags: a.category ? [a.category] : [],
    content: "",
  }));
}

// 全ニュース一覧をキャッシュ付きで取得 10分ごとに再検証
export const getAllNewsCached = unstable_cache(
  async () => {
    const rssArticles = await fetchRssArticles(20);
    const items = normalizeRssArticles(rssArticles);

    // 新しい順にソート
    items.sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    });

    return items;
  },
  ["all-news"],
  {
    revalidate: 600,
    tags: ["news"],
  },
);

export async function getLatestNews(
  limit: number = 20,
): Promise<NewsItem[]> {
  const all = await getAllNewsCached();
  return all.slice(0, limit);
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const all = await getAllNewsCached();
  return all.find((item) => item.id === id) ?? null;
}

export async function searchNewsBySlug(slug: string): Promise<NewsItem[]> {
  const all = await getAllNewsCached();
  const lowerSlug = slug.toLowerCase();

  return all.filter((item) => {
    const inTitle = item.title?.toLowerCase().includes(lowerSlug);
    const inExcerpt = item.excerpt?.toLowerCase().includes(lowerSlug);
    const inTags = item.tags?.some((t) =>
      t.toLowerCase().includes(lowerSlug),
    );
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
