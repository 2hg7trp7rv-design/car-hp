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
  sourceName?: string; // 出典: レスポンス など
  sourceUrl?: string; // 元記事URL
};

// ダミーデータ（外部ニュース＋オリジナル記事の例）
const newsItems: NewsItem[] = [
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
      "B48エンジンは、直列4気筒ターボとしては非常にバランスの良い性格を持っています。その陰には、可変バルブタイミング機構「VANOS」の存在があります。\n\nこの記事では、難しい数式や専門用語を極力避けながら、「カムシャフトの位相をずらすと何が変わるのか」「アイドリング時と高回転ではどのように制御が違うのか」といったポイントを整理します。\n\nまた、実際にオーナーとして感じる症状と、VANOSソレノイド不調との関係についても、あくまで一般論として触れていきます。",
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
      "G30だけでなく、F10やE60など歴代5シリーズを中古で検討するときのチェックポイントを、オーナー目線で整理しました。",
    content:
      "中古の5シリーズを選ぶときに気になるのは、「どこまで気にすべきか」というラインです。\n\n本記事では、走行距離や年式といった表面的な条件だけでなく、直近の整備履歴、タイヤやブレーキの残量、電装系の不具合傾向など、「試乗と簡単な確認」で見えてくるポイントに絞ってまとめています。\n\n過度に不安になるのではなく、必要なところだけ冷静にチェックしていく。そのための目安として使っていただける内容を目指しました。",
    category: "Used",
    maker: "BMW",
    tags: ["中古車", "5シリーズ", "購入ガイド"],
    publishedAt: "2025-01-05T15:00:00+09:00",
  },
  {
    id: "heritage-bmw-5series-history",
    type: "original",
    title: "初代からG30まで。BMW 5シリーズの系譜を静かに振り返る",
    excerpt:
      "E12からG30まで、およそ半世紀にわたるBMW 5シリーズの流れを、カタログを眺めるような感覚でたどります。",
    content:
      "BMW 5シリーズは、初代E12のデビューから半世紀近い時間をかけて進化してきました。\n\nこの記事では、各世代ごとの代表的なグレードやデザインの特徴を、あくまで「ざっくりと」振り返ります。細かな年次変更や限定車の網羅ではなく、「この世代はこういう雰囲気だった」という印象を整理することが目的です。\n\n最後に、現行G30/G60世代がどのようなポジションにいるのかも、静かなトーンでまとめてみます。",
    category: "Heritage",
    maker: "BMW",
    tags: ["5シリーズ", "ヒストリー", "ヘリテージ"],
    publishedAt: "2025-01-03T12:00:00+09:00",
  },
  {
    id: "external-response-ev-news",
    type: "external",
    title: "欧州で進むEVインフラ整備の最新動向",
    excerpt:
      "欧州主要国で進む急速充電ネットワークの整備状況を追ったニュースへのリンクです。当サイトでは要約ではなく、静かな一言コメントだけを添えて紹介します。",
    category: "EV",
    maker: "欧州",
    tags: ["EV", "充電インフラ", "欧州"],
    publishedAt: "2025-01-09T10:30:00+09:00",
    sourceName: "レスポンス",
    sourceUrl: "https://response.jp/",
  },
  {
    id: "external-carwatch-new-lexus",
    type: "external",
    title: "新型レクサスのフラッグシップセダンが欧州デビュー",
    excerpt:
      "静粛性と乗り心地に磨きをかけた新型フラッグシップセダンに関する外部ニュースです。詳細は元記事で確認できます。",
    category: "New Model",
    maker: "LEXUS",
    tags: ["レクサス", "フラッグシップ", "欧州"],
    publishedAt: "2025-01-07T18:00:00+09:00",
    sourceName: "Car Watch",
    sourceUrl: "https://car.watch.impress.co.jp/",
  },
];

export async function getLatestNews(limit?: number): Promise<NewsItem[]> {
  const sorted = [...newsItems].sort((a, b) => {
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
