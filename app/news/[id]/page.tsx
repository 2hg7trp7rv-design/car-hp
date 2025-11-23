// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  params: { id: string };
};

// 共通で使う「idからニュースを探す」関数
async function findNewsItemById(id: string): Promise<NewsItem | undefined> {
  // 十分多めに取っておく。必要に応じて増減してOK
  const items = await getLatestNews(200);

  // params.idはNext.js側で一度デコードされた値になる前提
  // NewsItem.idと完全一致するものを探す
  return items.find((item) => item.id === id);
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

  const title = item.titleJa ?? item.title;
  const description =
    item.excerpt ?? "車のニュースと、その先にある物語を。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/news/${encodeURIComponent(item.id)}`,
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

  const title = item.titleJa ?? item.title;
  const dateLabel = formatDate((item as any).publishedAt ?? (item as any).date);
  const sourceName = (item as any).sourceName ?? "";
  const sourceUrl =
    (item as any).sourceUrl ?? (item as any).link ?? (item as any).url ?? "";
  const editorComment =
    (item as any).editorComment ?? (item as any).comment ?? "";

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

        {item.excerpt && (
          <p className="mt-6 text-sm leading-relaxed text-slate-700">
            {item.excerpt}
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
