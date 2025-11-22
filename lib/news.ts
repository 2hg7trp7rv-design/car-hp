// lib/news.ts

export type NewsItemType = "original" | "external";

export type NewsItem = {
  id: string; // /news/[id] で使うID
  type: NewsItemType;
  title: string;
  excerpt?: string; // 一言コメント／リード文
  content?: string; // オリジナル記事用の本文
  category?: string;
  maker?: string;
  tags?: string[];
  publishedAt: string; // ISO形式 "2025-01-10T09:00:00+09:00" など

  // 外部ニュース用
  sourceName?: string; // 出典
  sourceUrl?: string; // 元記事URL
};

// ダミーデータ（オリジナル記事の例）
const staticNewsItems: NewsItem[] = [
  {
    id: "quiet-long-drive-sedan",
    type: "original",
    title: "静かな長距離ドライブに向くミドルサイズセダンを考える",
    excerpt:
      "派手さよりも、疲れにくさと上質な静けさにフォーカスしたミドルサイズセダンの魅力を整理します。",
    content:
      "最新型から一世代前のモデルまで、ミドルサイズセダンには「数字以上の楽さ」を持つクルマが少なくありません。\n\n" +
      "ステアリングを切り込んだときの自然な初期応答、路面の荒れを角を立てずにいなすダンパーの仕事ぶり、そして高速巡航時の静けさ。\n" +
      "どれも特別な演出ではなく、淡々と高いレベルでまとまっているクルマほど、長距離になればなるほど真価が見えてきます。\n\n" +
      "この記事では、2リッタークラスのガソリンターボセダンを例に、静かな長距離ドライブに向くポイントを「シート」「遮音」「足まわり」の3つの視点から整理していきます。",
    category: "Drive Note",
    maker: "欧州車",
    tags: ["ミドルサイズセダン", "ロングドライブ", "高速道路"],
    publishedAt: "2025-01-10T09:00:00+09:00",
  },
  {
    id: "b48-vanos-tech",
    type: "original",
    title: "B48エンジンと可変バルブタイミング：VANOSの役割をやさしく整理",
    excerpt:
      "BMWのB48エンジンに搭載される可変バルブタイミング機構「VANOS」の仕組みと、トラブルシューティングの考え方をやわらかく解説します。",
    content:
      "B48エンジンは、直列4気筒ターボとしては非常にバランスの良い性格を持っています。その陰には、可変バルブタイミング機構「VANOS」の存在があります。\n\n" +
      "この記事では、難しい数式や専門用語を極力避けながら、「カムシャフトの位相をずらすと何が変わるのか」「アイドリング時と高回転ではどのように制御が違うのか」といったポイントを整理します。\n\n" +
      "また、実際のオーナー事例を直接特定できるような記述は避けつつ、一般論として症状とVANOSソレノイド不調との関係についても触れていきます。",
    category: "Tech",
    maker: "BMW",
    tags: ["B48", "VANOS", "可変バルブタイミング", "技術解説"],
    publishedAt: "2025-01-08T20:00:00+09:00",
  },
  {
    id: "used-bmw-5series-buy-guide",
    type: "original",
    title: "中古のBMW 5シリーズを選ぶときに見ておきたいポイント",
    excerpt:
      "歴代5シリーズを中古で検討するときのチェックポイントを、できるだけ落ち着いた目線で整理しました。",
    content:
      "中古の5シリーズを選ぶときに気になるのは、「どこまで気にすべきか」というラインです。\n\n" +
      "本記事では、走行距離や年式といった表面的な条件だけでなく、直近の整備履歴、タイヤやブレーキの残量、電装系の不具合傾向など、「試乗と簡単な確認」で見えてくるポイントに絞ってまとめています。\n\n" +
      "過度に不安になるのではなく、必要なところだけ冷静にチェックしていく。そのための目安として使っていただける内容を目指しました。",
    category: "Used",
    maker: "BMW",
    tags: ["中古車", "5シリーズ", "購入ガイド"],
    publishedAt: "2025-01-05T15:00:00+09:00",
  },
  {
    id: "heritage-bmw-5series-history",
    type: "original",
    title: "初代から現行型まで。ミドルクラスセダンの系譜を静かに振り返る",
    excerpt:
      "およそ半世紀にわたるミドルクラスセダンの流れを、カタログを眺めるような感覚でたどります。",
    content:
      "ミドルクラスセダンは、時代ごとの価値観や技術を一番素直に映すカテゴリーかもしれません。\n\n" +
      "この記事では、各世代ごとの代表的なグレードやデザインの特徴を、あくまで「ざっくりと」振り返ります。細かな年次変更や限定車の網羅ではなく、「この世代はこういう雰囲気だった」という印象を整理することが目的です。\n\n" +
      "最後に、現行モデルがどのようなポジションにいるのかも、静かなトーンでまとめてみます。",
    category: "Heritage",
    maker: "欧州車",
    tags: ["セダン", "ヒストリー", "ヘリテージ"],
    publishedAt: "2025-01-03T12:00:00+09:00",
  },
];

// Car Watch のRSSから外部ニュースを取得（ビルド時に実行）
async function fetchCarWatchNews(limit = 10): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://car.watch.impress.co.jp/data/rss/1.0/car/feed.rdf",
      {
        // 毎回新鮮な情報を取りにいく（ビルド時なので問題なし）
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return [];
    }

    const xml = await res.text();

    // <item>ごとにざっくり分割
    const rawItems = xml.split("<item").slice(1);

    const parsed: NewsItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const block = "<item" + rawItems[i];

      const title = matchTag(block, "title");
      const link = matchTag(block, "link");
      const date =
        matchTag(block, "dc:date") ?? new Date().toISOString().slice(0, 19) + "+09:00";

      if (!title || !link) {
        continue;
      }

      // タイトルから簡易スラッグ生成（日本語混じりでも動く程度）
      const baseSlug = title
        .toLowerCase()
        .replace(/[\s、。・「」『』【】()（）[\]{}<>]/g, "-")
        .replace(/[^a-z0-9\-ぁ-んァ-ン一-龠]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);

      const id = `carwatch-${baseSlug || "item"}-${i}`;

      parsed.push({
        id,
        type: "external",
        title,
        excerpt:
          "Car Watchの最新記事へのリンクです。詳細や写真は元記事でご覧ください。",
        category: "News",
        maker: "Car Watch",
        tags: ["Car Watch"],
        publishedAt: date,
        sourceName: "Car Watch",
        sourceUrl: link,
      });

      if (parsed.length >= limit) {
        break;
      }
    }

    return parsed;
  } catch {
    // 取得に失敗してもサイト全体が落ちないようにする
    return [];
  }
}

// シンプルなタグ抽出ヘルパー
function matchTag(block: string, tag: string): string | undefined {
  // <title>...</title> みたいな単純なタグだけを対象
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;

  // CDATA 対応（あれば外す）
  const raw = m[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[(.*)\]\]>$/s);
  if (cdata) {
    return cdata[1].trim();
  }
  return raw;
}

// ニュース一覧取得（オリジナル＋Car Watch RSS）
export async function getLatestNews(limit?: number): Promise<NewsItem[]> {
  const staticItems = [...staticNewsItems];

  const externalFromCarWatch = await fetchCarWatchNews(20);

  const merged = [...staticItems, ...externalFromCarWatch];

  const sorted = merged.sort((a, b) => {
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  if (typeof limit === "number") {
    return sorted.slice(0, limit);
  }
  return sorted;
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const items = await getLatestNews();
  return items.find((item) => item.id === id) ?? null;
}

// 車種ページ用 関連ニュース検索
export async function getNewsByCar(
  maker: string,
  name: string,
  limit?: number
): Promise<NewsItem[]> {
  const keyMaker = maker.toLowerCase();
  const keyName = name.toLowerCase();

  const items = await getLatestNews();

  const matched = items.filter((item) => {
    const makerText = (item.maker ?? "").toLowerCase();
    const titleText = (item.title ?? "").toLowerCase();
    const tagsText = Array.isArray(item.tags)
      ? item.tags.join(" ").toLowerCase()
      : "";

    const text = `${makerText} ${titleText} ${tagsText}`;

    return text.includes(keyMaker) || text.includes(keyName);
  });

  if (typeof limit === "number") {
    return matched.slice(0, limit);
  }

  return matched;
}
