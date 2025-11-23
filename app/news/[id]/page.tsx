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

// id文字列から元記事URLを取り出す
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
    "response.jp": "Response.jp",
    "www.autocar.jp": "AUTOCAR JAPAN",
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
  const content = m[1]?.trim();
  return content || null;
}

// URLからタイトル/説明/媒体名を取得
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

// 「ニュースが見つからない」デザイン（スクショのトーンに寄せる）
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
            className="inline-flex items-center rounded-full border border-[#0ABAB5]/40 px-6 py-2 text-sm font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-white/70"
          >
            ニュース一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

// SEOメタデータ
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
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500">
            NEWS
          </p>
          <h1 className="mt-5 text-lg font-medium leading-relaxed text-slate-700 md:text-xl">
            元記事を取得できませんでした。
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            サイト側の都合などで記事を読み込めませんでしたが、元記事は直接開くことができます。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              元記事を開く
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center rounded-full border border-[#0ABAB5]/40 px-6 py-2 text-sm font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-white/70"
            >
              ニュース一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { title, description, sourceName } = item;

  return (
    <main className="min-h-screen px-4 pt-24 pb-24 md:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-10">
        <div className="text-xs font-medium tracking-[0.25em] text-slate-500">
          THE JOURNAL
        </div>
        <p className="mt-2 text-xs font-semibold tracking-[0.3em] text-slate-500">
          NEWS
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{sourceName}</span>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-700">
          {description}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            元記事を読む
          </Link>

          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-full border border-[#0ABAB5]/40 px-5 py-2 text-sm font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-white/70"
          >
            ニュース一覧へ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
