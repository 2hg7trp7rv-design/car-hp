// lib/rss.ts
import Parser from "rss-parser";
import type { NewsItem } from "@/lib/news";

type RssFeedConfig = {
  url: string;
  sourceName: string;
  defaultCategory?: string;
};

const rssFeeds: RssFeedConfig[] = [
  {
    // 好きなRSSに差し替え可
    url: process.env.RSS_FEED_1 || "https://response.jp/rss/index.rdf",
    sourceName: "Response.jp",
    defaultCategory: "ニュース",
  },
];

const parser = new Parser();

function createStableId(base: string): string {
  const normalized = encodeURIComponent(base).replace(/%/g, "-");
  return `rss-${normalized.slice(0, 50)}`;
}

export async function fetchRssNews(
  limitPerFeed: number = 10,
): Promise<NewsItem[]> {
  const collected: NewsItem[] = [];

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

        const newsItem: NewsItem = {
          id: createStableId(idBase),
          title: anyItem.title || "No title",
          titleJa: anyItem.title || "No title",
          slug: undefined,
          publishedAt,
          excerpt: anyItem.contentSnippet || anyItem.content || "",
          coverImage: undefined,
          category: feed.defaultCategory,
          sourceName: feed.sourceName,
          sourceUrl: anyItem.link,
          type: "external",
          content: "",
          tags: [],
        };

        collected.push(newsItem);
      }
    } catch (error) {
      console.error("Failed to fetch RSS feed:", feed.url, error);
    }
  }

  return collected;
}
