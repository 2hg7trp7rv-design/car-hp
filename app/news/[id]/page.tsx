// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: { id: string };
};

type FetchedNews = {
  url: string;
  title: string;
  description: string;
  sourceName: string;
};

// 安全にdecodeするヘルパー
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// ID→URLの解読ロジック
function decodeIdToUrl(rawId: string): string | null {
  let v = rawId;

  // 何重かエンコードされていることを想定して数回decode
  for (let i = 0; i < 4; i++) {
    const decoded = safeDecode(v);
    if (decoded === v) break;
    v = decoded;
  }

  // rss-プレフィックスを外す
  if (v.startsWith("rss-")) {
    v = v.slice(4);
  }

  // 先頭の http/https を探す（位置だけゆるく見る）
  const idx = v.indexOf("http");
  if (idx === -1) return null;

  const urlCandidate = v.slice(idx);

  // 単純に「://」が含まれていればURLとして扱う
  if (!urlCandidate.includes("://")) return null;

  return urlCandidate;
}

// hostname→媒体名
function getSourceNameFromHost(host: string): string {
  const map: Record<string, string> = {
    "response.jp": "Response",
    "www.honda.co.jp": "Honda",
    "global.honda": "Honda Global",
    "www.toyota.co.jp": "Toyota",
    "global.toyota": "Toyota Global",
    "www.nissan.co.jp": "Nissan",
    "newsroom.nissan-global.com": "Nissan Global",
    "www.bmw.co.jp": "BMW Japan",
    "www.mercedes-benz.jp": "Mercedes-Benz Japan",
    "www.subaru.jp": "SUBARU",
    "www.mazda.co.jp": "Mazda",
    "www.mitsubishi-motors.co.jp": "Mitsubishi Motors",
    "www.lexus.jp": "LEXUS",
    "www.audi.co.jp": "Audi Japan",
    "www.vw.co.jp": "Volkswagen Japan",
    "www.porsche.com": "Porsche",
    "car.watch.impress.co.jp": "Car Watch",
    "www.webcg.net": "webCG",
    "www.motor1.com": "Motor1.com",
    "insideevs.com": "InsideEVs",
  };

  const lower = host.toLowerCase();
  if (map[lower]) return map[lower];

  return host;
}

// HTMLから<meta>や<title>を抜き出す簡易関数
function extractBetween(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  if (!m) return null;
  return m[1]?.trim() || null;
}

async function fetchNewsFromUrl(url: string): Promise<FetchedNews | null> {
  const res = await fetch(url, {
    // 元記事サイトへのアクセス頻度を抑えるためにキャッシュ
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return null;
  }

  const html = await res.text();

  const ogTitle =
    extractBetween(
      html,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ??
    extractBetween(
      html,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );

  const titleTag = extractBetween(html, /<title[^>]*>([^<]+)<\/title>/i);

  const title = ogTitle ?? titleTag ?? url;

  const ogDesc =
    extractBetween(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ??
    extractBetween(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ) ??
    extractBetween(
      html,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );

  const description =
    ogDesc ??
    "元記事の概要を表示できませんでしたが、以下のボタンから記事全体を確認できます。";

  const host = new URL(url).host;
  const sourceName = getSourceNameFromHost(host);

  return {
    url,
    title,
    description,
    sourceName,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const url = decodeIdToUrl(params.id);

  if (!url) {
    return {
      title: "記事が見つかりません | CAR BOUTIQUE",
      description: "指定されたニュースが見つかりませんでした。",
    };
  }

  const item = await fetchNewsFromUrl(url);

  if (!item) {
    return {
      title: "元記事を取得できません | CAR BOUTIQUE",
      description: "元記事を取得できませんでした。",
    };
  }

  return {
    title: `${item.title} | CAR BOUTIQUE`,
    description: item.description,
    openGraph: {
      title: `${item.title} | CAR BOUTIQUE`,
      description: item.description,
      type: "article",
      url: `https://car-hp.vercel.app/news/${encodeURIComponent(params.id)}`,
    },
    twitter: {
      card: "summary",
      title: `${item.title} | CAR BOUTIQUE`,
      description: item.description,
    },
  };
}

// 「ニュースが見つからない」デザイン
function NotFoundView() {
  return (
    <main className="min-h-screen px-4 pt-24 pb-16 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.25em] text-slate-500">
          NEWS
        </p>
        <h1 className="mt-5 text-lg font-medium leading-relaxed text-slate-700 md:text-xl">
          指定されたニュースが見つかりませんでした。
        </h1>
        <div className="mt-8">
          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-full border border-[#0ABAB5]/50 bg-white/80 px-6 py-2 text-sm font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-white/70"
          >
            ニュース一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

// 本文
export default async function NewsDetailPage({ params }: Props) {
  const url = decodeIdToUrl(params.id);

  if (!url) {
    return <NotFoundView />;
  }

  const item = await fetchNewsFromUrl(url);

  if (!item) {
    // URLは解読できたが、記事取得に失敗したケース
    return (
      <main className="min-h-screen px-4 pt-24 pb-16 md:px-8">
        <article className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500">
            NEWS
          </p>
          <h1 className="mt-5 text-lg font-medium leading-relaxed text-slate-800 md:text-xl">
            元記事を取得できませんでした。
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            RSSで取得したURLにアクセスしましたが、現在ページが存在しないか、一時的に取得できない状態になっている可能性があります。
          </p>
          <div className="mt-8">
            <Link
              href="/news"
              className="inline-flex items-center justify-center rounded-full border border-[#0ABAB5]/50 bg-white/80 px-6 py-2 text-sm font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-white/70"
            >
              ニュース一覧へ戻る
            </Link>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white px-4 pt-20 pb-16 md:px-8 md:pt-24">
      <article className="mx-auto max-w-3xl rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-md md:p-8">
        <div className="text-xs font-semibold tracking-[0.25em] text-slate-500">
          NEWS
        </div>
        <h1 className="mt-4 text-xl font-semibold leading-relaxed text-slate-900 md:text-2xl">
          {item.title}
        </h1>
        <p className="mt-2 text-xs text-slate-500">{item.sourceName}</p>

        <p className="mt-5 text-sm leading-relaxed text-slate-700">
          {item.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            元記事の内容は、リンク先の媒体側で最新の情報に更新される場合があります。
          </p>
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#0ABAB5] px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(10,186,181,0.45)] hover:bg-[#08a19d]"
          >
            元記事を読む
          </Link>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-full border border-[#0ABAB5]/50 bg-white/80 px-6 py-2 text-sm font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-white/70"
          >
            ニュース一覧へ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
