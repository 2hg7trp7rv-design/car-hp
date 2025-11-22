// lib/news.ts
// lib/news.ts
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { getDatabaseIdByTitle } from "@/lib/notion";
import { fetchRssNews } from "@/lib/rss";

// Notionクライアントの初期化
// ※もし lib/notion.ts から notion を export している場合は import { notion } from "@/lib/notion" に変えてもOKです
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
  // 車種紐付け用（タグなどに車名が含まれると想定）
  tags?: string[];
};

/**
 * Notionからニュース全件を取得し、キャッシュする関数
 * これが全てのデータ取得の基盤となります。
 */
export const getAllNewsCached = unstable_cache(
  async () => {
    try {
      const databaseId = await getDatabaseIdByTitle("News");

      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: "PublishedAt", direction: "descending" }],
        page_size: 100,
      });

      const notionItems: NewsItem[] = response.results.map((page: any) => {
        const props = page.properties;

        return {
          id: page.id,
          title: props.Name?.title?.[0]?.plain_text ?? "No Title",
          titleJa: props.TitleJa?.rich_text?.[0]?.plain_text,
          publishedAt: props.PublishedAt?.date?.start,
          excerpt: props.Excerpt?.rich_text?.[0]?.plain_text,
          category: props.Category?.select?.name,
          sourceName: props.SourceName?.select?.name,
          sourceUrl: props.SourceUrl?.url,
          type: props.Type?.select?.name === "External" ? "external" : "original",
          tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
          content: "",
        } as NewsItem;
      });

      let rssItems: NewsItem[] = [];
      try {
        rssItems = await fetchRssNews(10);
      } catch (error) {
        console.error("Failed to fetch RSS news:", error);
      }

      const allItems = [...notionItems, ...rssItems];

      allItems.sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bTime - aTime;
      });

      return allItems;
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return [];
    }
  },
  ["all-news-list"],
  { revalidate: 3600, tags: ["news"] },
);

      return response.results.map((page: any) => {
        const props = page.properties;
        
        // Notionのプロパティ名に合わせてデータをマッピング
        // ※プロパティ名(Name, TitleJaなど)がご自身のNotionと異なる場合は修正してください
        return {
          id: page.id,
          title: props.Name?.title?.[0]?.plain_text ?? "No Title",
          titleJa: props.TitleJa?.rich_text?.[0]?.plain_text,
          publishedAt: props.PublishedAt?.date?.start,
          excerpt: props.Excerpt?.rich_text?.[0]?.plain_text,
          category: props.Category?.select?.name,
          sourceName: props.SourceName?.select?.name,
          sourceUrl: props.SourceUrl?.url,
          type: props.Type?.select?.name === "External" ? "external" : "original",
          tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
          content: "", // 一覧取得時は本文は空でOK
        } as NewsItem;
      });
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return [];
    }
  },
  ['all-news-list'], // キャッシュキー
  { revalidate: 3600, tags: ['news'] } // 1時間キャッシュ
);

/**
 * 既存機能の互換実装
 * キャッシュされたデータからフィルタリングして返します
 */

// 最新ニュースを取得
export async function getLatestNews(limit: number = 10): Promise<NewsItem[]> {
  const all = await getAllNewsCached();
  return all.slice(0, limit);
}

// ID指定で取得
export async function getNewsById(id: string): Promise<NewsItem | null> {
  const all = await getAllNewsCached();
  const found = all.find((item) => item.id === id);
  
  if (found) {
    // Original記事の場合、詳細（本文）が必要ならここで別途取得するロジックを追加可能
    // 今回はビルドを通すため、見つかったデータをそのまま返します
    return found;
  }
  return null;
}

// 車種に関連するニュースを取得 (app/cars/[slug]/page.tsxで使用)
export async function getNewsByCar(slug: string): Promise<NewsItem[]> {
  const all = await getAllNewsCached();
  const lowerSlug = slug.toLowerCase();
  
  return all.filter((item) => {
    // タグ、タイトル、本文に車種名が含まれているかチェック
    const inTitle = item.title?.toLowerCase().includes(lowerSlug);
    const inExcerpt = item.excerpt?.toLowerCase().includes(lowerSlug);
    const inTags = item.tags?.some(t => t.toLowerCase().includes(lowerSlug));
    return inTitle || inExcerpt || inTags;
  });
}

/**
 * 新機能: ページネーションと検索
 */

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

export async function getPaginatedNews(page: number = 1): Promise<PaginatedNewsResult> {
  const allNews = await getAllNewsCached();
  
  const totalItems = allNews.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
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
  return allNews.map(item => ({
    id: item.id,
    title: item.titleJa ?? item.title,
    category: item.category ?? "News",
    publishedAt: item.publishedAt ?? "",
  }));
}
