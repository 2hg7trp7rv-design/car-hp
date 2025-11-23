// lib/rss.ts
import Parser from "rss-parser";

export type RssArticle = {
  id: string;
  title: string;
  link?: string;
  publishedAt?: string;
  excerpt?: string;
  sourceName: string;
  category?: string;
};

type RssFeedConfig = {
  url: string;
  sourceName: string;
  defaultCategory?: string;
};

// 情報源を追加（約5サイト分）
const rssFeeds: RssFeedConfig[] = [
  {
    // レスポンス
    url: "https://response.jp/rss/index.rdf",
    sourceName: "Response.jp",
    defaultCategory: "News",
  },
  {
    // webCG
    url: "https://www.webcg.net/list/feed/rss",
    sourceName: "webCG",
    defaultCategory: "News",
  },
  {
    // TOYOTA グローバルニュース
    url: "https://global.toyota/export/jp/allnews_rss.xml",
    sourceName: "TOYOTA Global News",
    defaultCategory: "メーカー",
  },
  {
    // AUTOCAR（英語）
    url: "http://www.autocar.co.uk/rss",
    sourceName: "AUTOCAR",
    defaultCategory: "International",
  },
  {
    // Honda 情報（企業ニュース系）
    url: "https://www.honda.co.jp/rss/information.xml",
    sourceName: "Honda Japan",
    defaultCategory: "メーカー",
  },
];

const parser = new Parser();

function createStableId(base: string): string {
  const normalized = encodeURIComponent(base).replace(/%/g, "-");
  return `rss-${normalized.slice(0, 60)}`;
}

export async function fetchRssArticles(
  limitPerFeed: number = 20,
): Promise<RssArticle[]> {
  const collected: RssArticle[] = [];

  for (const feed of rssFeeds) {
    if (!feed.url) continue;

    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, limitPerFeed);

      for (const item of items) {
        const anyItem = item as any;

        const idBase =
          anyItem.guid ||
          anyItem.link ||
          anyItem.isoDate ||
          anyItem.pubDate ||
          anyItem.title ||
          Math.random().toString(36);

        const publishedAt: string | undefined =
          anyItem.isoDate || anyItem.pubDate || undefined;

        const article: RssArticle = {
          id: createStableId(idBase),
          title: anyItem.title || "No title",
          link: anyItem.link,
          publishedAt,
          excerpt: anyItem.contentSnippet || anyItem.content || "",
          sourceName: feed.sourceName,
          category: feed.defaultCategory,
        };

        collected.push(article);
      }
    } catch (error) {
      console.error("Failed to fetch RSS feed:", feed.url, error);
    }
  }

  return collected;
}
