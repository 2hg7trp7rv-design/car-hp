// lib/news.ts

// ニュース記事の型定義
export interface NewsItem {
  id: string;
  title: string;
  titleJa?: string;
  url?: string;
  sourceUrl?: string;
  sourceName: string;
  publishedAt: string;
  imageUrl?: string;
  
  // 【修正】UI側にあわせて summary ではなく excerpt に統一
  excerpt?: string;
  
  category?: 'Drive Note' | 'Tech' | 'Used' | 'Heritage' | 'News';
  type: 'original' | 'external'; 
  content?: string;
}

// 手動で追加するオリジナル記事
const staticNewsItems: NewsItem[] = [
  {
    id: 'welcome-car-boutique',
    title: 'Welcome to CAR BOUTIQUE',
    titleJa: '愛車との豊かな時間を紡ぐ、新しい場所へようこそ',
    sourceName: 'CAR BOUTIQUE',
    publishedAt: '2025-11-20T10:00:00Z',
    excerpt: '車のスペックだけでなく、その背景にある物語やライフスタイルを提案する新しいメディアです。',
    category: 'Drive Note',
    type: 'original',
    content: `
      CAR BOUTIQUEへようこそ。
      
      私たちは、単に車のスペックや価格を羅列するだけのメディアではありません。
      その車が持つ背景、開発者の想い、そしてオーナーのライフスタイルにどのような彩りを与えるのか。
      そうした「物語」を大切にする、新しい形のカーメディアです。
      
      コーヒーでも飲みながら、ゆっくりと記事を楽しんでいただければ幸いです。
    `,
  },
];

/**
 * RSSフィードのURLリスト
 */
const RSS_FEEDS = [
  {
    url: 'https://car.watch.impress.co.jp/data/rss/1.0/cw/index.xml',
    name: 'Car Watch',
    lang: 'ja',
  },
  {
    url: 'https://www.autoevolution.com/rss/backend.xml',
    name: 'autoevolution',
    lang: 'en',
  },
];

/**
 * シンプルなRSSパーサー
 */
async function fetchAndParseRSS(feed: { url: string; name: string; lang: string }): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(feed.url, { 
      signal: controller.signal,
      next: { revalidate: 600 } 
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Failed to fetch ${feed.name}`);

    const xmlText = await res.text();
    const items: NewsItem[] = [];

    const itemRegex = /<(item|entry)>([\s\S]*?)<\/(item|entry)>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const content = match[2];
      const extract = (tag: string) => {
        const regex = new RegExp(`<${tag}[^>]*>(<!\\[CDATA\\[)?(.*?)(]]>)?<\/${tag}>`, 'i');
        const m = content.match(regex);
        return m ? m[2].trim() : '';
      };

      const title = extract('title');
      const link = extract('link') || extract('url');
      const dateStr = extract('pubDate') || extract('dc:date') || extract('updated');
      const desc = extract('description') || extract('content:encoded');
      
      if (!title || !link) continue;

      items.push({
        id: btoa(link).slice(0, 10),
        title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
        titleJa: feed.lang === 'ja' ? title : undefined,
        sourceUrl: link,
        sourceName: feed.name,
        publishedAt: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
        // 【修正】ここを excerpt に格納
        excerpt: desc.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...',
        category: 'News',
        type: 'external',
      });
    }

    return items;

  } catch (error) {
    console.error(`Error fetching RSS from ${feed.name}:`, error);
    return [];
  }
}

/**
 * 最新ニュースを一括取得するメイン関数
 * 【修正】limit 引数を受け取れるように変更（アーカイブページ対応）
 */
export async function getLatestNews(limit?: number): Promise<NewsItem[]> {
  const rssPromises = RSS_FEEDS.map(feed => fetchAndParseRSS(feed));
  const rssResults = await Promise.all(rssPromises);
  const rssItems = rssResults.flat();
  const allItems = [...staticNewsItems, ...rssItems];

  allItems.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const uniqueItems = Array.from(
    new Map(allItems.map((item) => [item.sourceUrl || item.id, item])).values()
  );
  
  // limitがあれば切り取る
  if (limit) {
    return uniqueItems.slice(0, limit);
  }

  return uniqueItems;
}

export async function getNewsById(id: string): Promise<NewsItem | undefined> {
  const allNews = await getLatestNews();
  return allNews.find(item => item.id === id || item.sourceUrl?.includes(decodeURIComponent(id)));
}

export async function getNewsByCar(carName: string): Promise<NewsItem[]> {
  const allNews = await getLatestNews();
  const lowerName = carName.toLowerCase();

  return allNews.filter(item => 
    item.title.toLowerCase().includes(lowerName) ||
    (item.titleJa && item.titleJa.toLowerCase().includes(lowerName)) ||
    // 【修正】summary ではなく excerpt を参照
    (item.excerpt && item.excerpt.toLowerCase().includes(lowerName))
  );
}
