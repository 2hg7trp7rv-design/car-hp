// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  params: { id: string };
};

// 安全にdecodeするヘルパー
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// params.idからNewsItemを探す共通関数
async function findNewsItemById(rawId: string): Promise<NewsItem | undefined> {
  // 多めに取得しておく
  const items = await getLatestNews(200);

  const decoded1 = safeDecode(rawId);
  const decoded2 = safeDecode(decoded1);

  // 比較候補となる文字列たち
  const idCandidates = Array.from(
    new Set([rawId, decoded1, decoded2].filter(Boolean)),
  );

  // rss-プレフィックスを外した「記事URL」候補たち
  const urlCandidates = idCandidates
    .map((v) => (v.startsWith("rss-") ? v.slice(4) : v))
    .filter(Boolean);

  // 1.id同士の完全一致で探す（lib/news側がidを持っている場合）
  const itemById = items.find((item: any) => {
    const itemId = item.id as string | undefined;
    return itemId && idCandidates.includes(itemId);
  });
  if (itemById) return itemById as NewsItem;

  // 2.元記事URLで探す（idがURL由来の場合）
  const itemByUrl = items.find((item: any) => {
    const link =
      (item.sourceUrl as string | undefined) ??
      (item.link as string | undefined) ??
      (item.url as string | undefined);

    if (!link) return false;

    // linkそのもの、またはエンコード/デコードされた形が一致しないかを見ておく
    const linkDecoded1 = safeDecode(link);
    const linkDecoded2 = safeDecode(linkDecoded1);

    const linkCandidates = Array.from(
      new Set([link, linkDecoded1, linkDecoded2]),
    );

    return linkCandidates.some((lc) => urlCandidates.includes(lc));
  });

  if (itemByUrl) return itemByUrl as NewsItem;

  // ここまでで見つからなければundefined
  return undefined;
}

// 日付表示用フォーマッタ
function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// SEO: 動的にメタデータを生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await findNewsItemById(params.id);

  if (!item) {
    return {
      title: "記事が見つかりません | CAR BOUTIQUE",
      description: "指定されたニュースが見つかりませんでした。",
    };
  }

  const anyItem = item as any;
  const title = anyItem.titleJa ?? anyItem.title;
  const description =
    anyItem.excerpt ?? "車のニュースと、その先にある物語を。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/news/${encodeURIComponent(params.id)}`,
    },
    twitter: {
      card: "summary",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const item = await findNewsItemById(params.id);

  if (!item) {
    return (
      <main className="min-h-screen px-4 pt-24 pb-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-slate-500">
            NEWS
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            指定されたニュースが見つかりませんでした。
          </h1>
          <div className="mt-8">
            <Link
              href="/news"
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-white/60"
            >
              ニュース一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const anyItem = item as any;
  const title = anyItem.titleJa ?? anyItem.title;
  const dateLabel = formatDate(anyItem.publishedAt ?? anyItem.date);
  const sourceName = anyItem.sourceName ?? "";
  const sourceUrl =
    anyItem.sourceUrl ?? anyItem.link ?? anyItem.url ?? "";
  const editorComment = anyItem.editorComment ?? anyItem.comment ?? "";

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
          {dateLabel && <span>{dateLabel}</span>}
          {sourceName && <span>•{sourceName}</span>}
        </div>

        {anyItem.excerpt && (
          <p className="mt-6 text-sm leading-relaxed text-slate-700">
            {anyItem.excerpt}
          </p>
        )}

        {editorComment && (
          <div className="mt-8 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800">
            {editorComment}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          {sourceUrl && (
            <Link
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              元記事を読む
            </Link>
          )}

          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-white/60"
          >
            ニュース一覧へ戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
