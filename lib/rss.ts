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

const rssFeeds: RssFeedConfig[] = [
  {
    // レスポンス（自動車総合ニュース）
    url: "https://response.jp/rss/index.rdf",
    sourceName: "Response.jp",
    defaultCategory: "News",
  },
  {
    // Car Watch（インプレスの自動車ニュース）
    url: "https://car.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf",
    sourceName: "Car Watch",
    defaultCategory: "News",
  },
  {
    // webCG 自動車ニュース
    url: "https://www.webcg.net/list/feed/rss",
    sourceName: "webCG",
    defaultCategory: "News",
  },
  {
    // TOYOTA グローバルニュース（日本語含む全ニュース）
    url: "https://global.toyota/export/jp/allnews_rss.xml",
    sourceName: "TOYOTA Global News",
    defaultCategory: "メーカー情報",
  },
  {
    // Honda クルマ関連ニュース
    url: "https://www.honda.co.jp/rss/auto.xml",
    sourceName: "Honda クルマ",
    defaultCategory: "メーカー情報",
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
