"use server";

import Parser from "rss-parser";

export type RssArticle = {
  id: string;
  title: string;
  link: string;
  sourceName: string;
  publishedAt: string; // ISO8601
  excerpt: string;
  category: string;
  tags: string[];
};

type RssFeedConfig = {
  url: string;
  sourceName: string;
  category?: string;
  tags?: string[];
};

// RSSフィード一覧
// 増やしたいときはこの配列に足すだけ
const rssFeeds: RssFeedConfig[] = [
  // 国産メディア（自動車ニュース系）
  {
    url: "https://response.jp/rss/index.rdf",
    sourceName: "Response.jp",
    category: "News",
  },
  {
    url: "https://www.webcg.net/rss/index.rdf",
    sourceName: "webCG",
    category: "News",
  },
  {
    url: "https://car.watch.impress.co.jp/data/rss/1.0/carwatch.rdf",
    sourceName: "Car Watch",
    category: "News",
  },
  {
    url: "https://bestcarweb.jp/feed",
    sourceName: "ベストカーWeb",
    category: "Column",
  },
  {
    url: "https://motor-fan.jp/feed",
    sourceName: "Motor-Fan.jp",
    category: "Tech",
  },
  {
    url: "https://www.autocar.jp/feed",
    sourceName: "AUTOCAR JAPAN",
    category: "News",
  },
  {
    url: "https://topgear.tokyo/feed",
    sourceName: "TopGear Japan",
    category: "News",
  },

  // 海外メディア（EV・技術動向などスピード重視で数件追加）
  {
    url: "https://www.caranddriver.com/rss/all.xml",
    sourceName: "Car and Driver",
    category: "Global",
  },
  {
    url: "https://www.motor1.com/rss/news/",
    sourceName: "Motor1.com",
    category: "Global",
  },
  {
    url: "https://insideevs.com/news/rss/",
    sourceName: "InsideEVs",
    category: "EV",
  },
];

let parser: Parser | null = null;

function getParser() {
  if (!parser) {
    parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Car Boutique RSS Aggregator (+https://car-hp.vercel.app/)",
      },
    });
  }
  return parser;
}

// 制御文字や改行を軽く整えるだけ（文字コード変換はしない）
function normalizeText(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * RSSフィードから記事をまとめて取得
 * - フィードごとにエラーになっても他は継続
 * - 公開日の新しい順に並べ替え
 * - limit件まで返す
 */
export async function fetchRssArticles(limit: number = 50): Promise<RssArticle[]> {
  const p = getParser();
  const articles: RssArticle[] = [];

  for (const feed of rssFeeds) {
    try {
      const parsed = await p.parseURL(feed.url);

      for (const item of parsed.items ?? []) {
        const title = normalizeText(item.title as string | undefined);
        const link = (item.link || "").toString();

        if (!title || !link) continue;

        const rawDate =
          (item.isoDate as string | undefined) ||
          (item.pubDate as string | undefined) ||
          undefined;

        const publishedAt = rawDate
          ? new Date(rawDate).toISOString()
          : new Date().toISOString();

        const excerpt = normalizeText(
          (item.contentSnippet as string | undefined) ||
            (item.summary as string | undefined) ||
            (item.content as string | undefined),
        );

        articles.push({
          id: `rss-${encodeURIComponent(link)}`,
          title,
          link,
          sourceName: feed.sourceName,
          publishedAt,
          excerpt,
          category: feed.category ?? "News",
          tags: feed.tags ?? [],
        });
      }
    } catch (err) {
      console.error("[RSS] Failed to fetch:", feed.url, err);
      // このフィードはスキップして次へ
      continue;
    }
  }

  // 新しい順にソート
  articles.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  // 最新limit件だけ返す
  return articles.slice(0, limit);
}
