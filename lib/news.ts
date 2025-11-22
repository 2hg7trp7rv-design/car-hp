// lib/news.ts

export interface NewsItem {
  id: string;
  title: string;
  titleJa?: string;
  url?: string;
  sourceUrl?: string;
  sourceName: string;
  publishedAt: string;
  imageUrl?: string;
  excerpt?: string;
  summary?: string;
  category?: "Drive Note" | "Tech" | "Used" | "Heritage" | "News";
  type: "original" | "external";
  content?: string;
}

// 手動で追加するオリジナル記事
const staticNewsItems: NewsItem[] = [
  {
    id: "welcome-car-boutique",
    title: "Welcome to CAR BOUTIQUE",
    titleJa: "愛車との豊かな時間を紡ぐ、新しい場所へようこそ",
    sourceName: "CAR BOUTIQUE",
    publishedAt: "2025-11-20T10:00:00Z",
    excerpt:
      "車のスペックだけでなく、その背景にある物語やライフスタイルを提案する新しいメディアです。",
    summary:
      "車のスペックだけでなく、その背景にある物語やライフスタイルを提案する新しいメディアです。",
    category: "Drive Note",
    type: "original",
    content: `
CAR BOUTIQUEへようこそ。

私たちは、単に車のスペックや価格を羅列するだけのメディアではありません。
その車が持つ背景、開発者の想い、そしてオーナーのライフスタイルにどのような彩りを与えるのか。
そうした「物語」を大切にする、新しい形のカーメディアです。

コーヒーでも飲みながら、ゆっくりと記事を楽しんでいただければ幸いです。
    `.trim(),
  },
];

/**
 * RSSフィードのURLリスト
 */
const RSS_FEEDS = [
  {
    url: "https://car.watch.impress.co.jp/data/rss/1.0/cw/index.xml",
    name: "Car Watch",
    lang: "ja",
  },
  {
    url: "https://www.autoevolution.com/rss/backend.xml",
    name: "autoevolution",
    lang: "en",
  },
];

/**
 * シンプルなRSSパーサー
 */
async function fetchAndParseRSS(feed: {
  url: string;
  name: string;
  lang: string;
}): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${feed.name}`);
    }

    const xmlText = await res.text();
    const items: NewsItem[] = [];

    const itemRegex = /<(item|entry)>([\s\S]*?)<\/(item|entry)>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const content = match[2];

      const extract = (tag: string) => {
        const regex = new RegExp(
          `<${tag}[^>]*>(<!\\[CDATA\\[)?([\\s\\S]*?)(]]>)?<\\/${tag}>`,
          "i",
        );
        const m = content.match(regex);
        return m ? m[2].trim() : "";
      };

      const title = extract("title");
      const link = extract("link") || extract("url");
      const dateStr =
        extract("pubDate") || extract("dc:date") || extract("updated");
      const desc = extract("description") || extract("content:encoded");

      if (!title || !link) continue;

      const plainDesc = desc.replace(/<[^>]*>?/gm, "").trim();
      const teaser =
        plainDesc.length > 0
          ? plainDesc.slice(0, 100) + (plainDesc.length > 100 ? "..." : "")
          : "";

      items.push({
        // Node環境でも安全に動くよう、btoaは使わずURLそのものをidにする
        id: link,
        title: title.replace(/&amp;/g, "&").replace(/&quot;/g, '"'),
        titleJa: feed.lang === "ja" ? title : undefined,
        sourceUrl: link,
        sourceName: feed.name,
        publishedAt: dateStr
          ? new Date(dateStr).toISOString()
          : new Date().toISOString(),
        excerpt: teaser,
        summary: teaser,
        category: "News",
        type: "external",
      });
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS from ${feed.name}:`, error);
    return [];
  }
}

/**
 * 最新ニュースを一括取得
 * limitを指定すると、その件数でカット
 */
export async function getLatestNews(limit?: number): Promise<NewsItem[]> {
  const rssPromises = RSS_FEEDS.map((feed) => fetchAndParseRSS(feed));
  const rssResults = await Promise.all(rssPromises);
  const rssItems = rssResults.flat();

  const allItems = [...staticNewsItems, ...rssItems];

  allItems.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const uniqueItems = Array.from(
    new Map(
      allItems.map((item) => [item.sourceUrl || item.id, item]),
    ).values(),
  );

  if (typeof limit === "number") {
    return uniqueItems.slice(0, limit);
  }

  return uniqueItems;
}

/**
 * 特定IDの記事を取得
 */
export async function getNewsById(
  id: string,
): Promise<NewsItem | undefined> {
  const allNews = await getLatestNews();
  const decoded = decodeURIComponent(id);

  return allNews.find(
    (item) => item.id === decoded || item.sourceUrl?.includes(decoded),
  );
}

/**
 * 車種に関連するニュース取得
 * getNewsByCar("プリウス")
 * getNewsByCar("トヨタ","プリウス",5)
 * どちらの呼び出し方にも対応
 */
export function getNewsByCar(
  carName: string,
  limit?: number,
): Promise<NewsItem[]>;
export function getNewsByCar(
  maker: string,
  carName: string,
  limit?: number,
): Promise<NewsItem[]>;
export async function getNewsByCar(
  makerOrName: string,
  second?: string | number,
  third?: number,
): Promise<NewsItem[]> {
  const allNews = await getLatestNews();

  let keyword: string;
  let limit: number | undefined;

  if (typeof second === "string") {
    keyword = `${makerOrName} ${second}`.trim();
    limit = typeof third === "number" ? third : undefined;
  } else {
    keyword = makerOrName;
    limit = typeof second === "number" ? second : undefined;
  }

  const lower = keyword.toLowerCase();

  const filtered = allNews.filter((item) => {
    const title = item.title.toLowerCase();
    const titleJa = item.titleJa?.toLowerCase() ?? "";
    const excerpt = item.excerpt?.toLowerCase() ?? "";
    const summary = item.summary?.toLowerCase() ?? "";

    return (
      title.includes(lower) ||
      titleJa.includes(lower) ||
      excerpt.includes(lower) ||
      summary.includes(lower)
    );
  });

  if (typeof limit === "number") {
    return filtered.slice(0, limit);
  }

  return filtered;
}
