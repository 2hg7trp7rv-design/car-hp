// lib/news.ts

// ニュース記事の型定義
export interface NewsItem {
  id: string;
  title: string;
  titleJa?: string; // 日本語タイトル（あれば優先表示）
  url?: string;     // 内部リンク用 (idベース)
  sourceUrl?: string; // 外部リンク用
  sourceName: string;
  publishedAt: string;
  imageUrl?: string;
  summary?: string;
  category?: 'Drive Note' | 'Tech' | 'Used' | 'Heritage' | 'News';
}

// 手動で追加するオリジナル記事（ここに自分の記事を書きます）
const staticNewsItems: NewsItem[] = [
  {
    id: 'welcome-car-boutique',
    title: 'Welcome to CAR BOUTIQUE',
    titleJa: '愛車との豊かな時間を紡ぐ、新しい場所へようこそ',
    sourceName: 'CAR BOUTIQUE',
    publishedAt: '2025-11-20T10:00:00Z',
    summary: '車のスペックだけでなく、その背景にある物語やライフスタイルを提案する新しいメディアです。',
    category: 'Drive Note',
  },
  // 記事を増やしたいときは、ここにカンマ区切りでオブジェクトを追加してください
];

/**
 * RSSフィードのURLリスト
 * Car Watch, autoevolutionなどを登録
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
 * シンプルなRSSパーサー（ライブラリ不要版）
 * iPhone環境等でnpm installが難しい場合でも動くように標準機能だけで実装
 */
async function fetchAndParseRSS(feed: { url: string; name: string; lang: string }): Promise<NewsItem[]> {
  try {
    // タイムアウト付きのフェッチ（5秒で諦める）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(feed.url, { 
      signal: controller.signal,
      next: { revalidate: 600 } // 10分キャッシュ
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Failed to fetch ${feed.name}`);

    const xmlText = await res.text();
    const items: NewsItem[] = [];

    // 正規表現で簡易的にパース（ライブラリ依存を排除するため）
    // <item>...</item> または <entry>...</entry> を抽出
    const itemRegex = /<(item|entry)>([\s\S]*?)<\/(item|entry)>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const content = match[2];
      
      // タグの中身を抽出するヘルパー
      const extract = (tag: string) => {
        const regex = new RegExp(`<${tag}[^>]*>(<!\\[CDATA\\[)?(.*?)(]]>)?<\/${tag}>`, 'i');
        const m = content.match(regex);
        return m ? m[2].trim() : '';
      };

      const title = extract('title');
      const link = extract('link') || extract('url'); // RSSのバージョンによって違うため
      const dateStr = extract('pubDate') || extract('dc:date') || extract('updated');
      
      // 必須項目がない場合はスキップ
      if (!title || !link) continue;

      items.push({
        id: btoa(link).slice(0, 10), // URLをBase64化してID生成
        title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
        titleJa: feed.lang === 'ja' ? title : undefined, // 日本語サイトならtitleJaに入れる
        sourceUrl: link,
        sourceName: feed.name,
        publishedAt: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
        category: 'News',
      });
    }

    return items;

  } catch (error) {
    console.error(`Error fetching RSS from ${feed.name}:`, error);
    return []; // エラー時は空配列を返し、全体を止めない
  }
}

/**
 * 最新ニュースを一括取得するメイン関数
 */
export async function getLatestNews(): Promise<NewsItem[]> {
  // 1. RSSの並列取得
  const rssPromises = RSS_FEEDS.map(feed => fetchAndParseRSS(feed));
  const rssResults = await Promise.all(rssPromises);
  
  // 2. 配列を平坦化（フラットにする）
  const rssItems = rssResults.flat();

  // 3. 静的記事と結合
  const allItems = [...staticNewsItems, ...rssItems];

  // 4. 日付順にソート（新しい順）
  allItems.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // 5. 重複除去（念のためURLでチェック）
  const uniqueItems = Array.from(
    new Map(allItems.map((item) => [item.sourceUrl || item.id, item])).values()
  );

  return uniqueItems;
}

/**
 * 特定のIDの記事を取得（詳細ページ用）
 */
export async function getNewsById(id: string): Promise<NewsItem | undefined> {
  const allNews = await getLatestNews();
  return allNews.find(item => item.id === id || item.sourceUrl?.includes(decodeURIComponent(id)));
}
