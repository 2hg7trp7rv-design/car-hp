// lib/news.ts
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache"; // キャッシュ機能のインポート

// --- 既存の型定義などは維持 ---
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
  content?: string; // 本文（originalの場合）
};

// Notionクライアントの初期化（lib/notion.tsがあればそちらを使用推奨ですが、ここでは便宜上記述）
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const DATABASE_ID = process.env.NOTION_DATABASE_ID; // 環境変数を確認してください

/**
 * ニュース全件取得（キャッシュ対応版）
 * 1時間(3600秒)キャッシュし、高速化を図る
 */
export const getAllNewsCached = unstable_cache(
  async () => {
    if (!DATABASE_ID) return [];
    
    // ※実際の実装ではここでNotion APIを叩くロジックが入ります
    // 既存のgetLatestNewsの中身をここに移植するイメージです
    // ここではデモ用に既存関数をラップする形を想定
    return await fetchFromNotion(); 
  },
  ['all-news-cache'],
  { revalidate: 3600, tags: ['news'] }
);

// ※既存の fetchFromNotion (または getLatestNews) ロジックが必要です
async function fetchFromNotion(): Promise<NewsItem[]> {
    // ... 既存のNotionデータ取得ロジック ...
    // ここは既存のコードを維持してください
    return []; 
}


// --- 新規追加: ページネーション用ロジック ---

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

const ITEMS_PER_PAGE = 12; // デザインバランスを考慮して12件

export async function getPaginatedNews(page: number = 1): Promise<PaginatedNewsResult> {
  // キャッシュされた全データからスライスして取得
  // (小〜中規模サイトならこれが最も高速でAPI制限にかかりにくい)
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

// 検索用インデックス（軽量データ）を取得する関数
export async function getSearchIndex() {
  const allNews = await getAllNewsCached();
  return allNews.map(item => ({
    id: item.id,
    title: item.titleJa ?? item.title,
    category: item.category ?? "News",
    publishedAt: item.publishedAt ?? "",
  }));
}
