// app/news/[id]/page.tsx
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { getNewsById } from "@/lib/news";

type Props = {
  params: { id: string };
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedId = decodeURIComponent(params.id);
  const item = await getNewsById(decodedId);

  if (!item) {
    return {
      title: "ニュースが見つかりません | CAR BOUTIQUE",
      description: "指定されたニュース記事が見つかりませんでした。",
    };
  }

  const title = item.titleJa ?? item.title;
  const description =
    item.excerpt ?? "クルマのニュースと、その先にあるストーリーを届けます。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/news/${encodeURIComponent(
        decodedId,
      )}`,
    },
    twitter: {
      card: "summary",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const decodedId = decodeURIComponent(params.id);
  const item = await getNewsById(decodedId);

  if (!item) {
    notFound();
  }

  const title = item.titleJa ?? item.title;
  const dateLabel = formatDate(item.publishedAt);
  const sourceName = item.sourceName ?? "EXTERNAL";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* パンくず */}
        <nav className="mb-4 text-[11px] text-text-sub">
          <Link href="/" className="hover:underline">
            HOME
          </Link>
          <span className="mx-1">/</span>
          <Link href="/news" className="hover:underline">
            NEWS
          </Link>
          <span className="mx-1">/</span>
          <span className="text-slate-700 line-clamp-1">{title}</span>
        </nav>

        {/* メインレイアウト */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          {/* 左: 記事概要 */}
          <GlassCard as="article" padding="lg" className="h-full">
            <div className="flex items-center justify-between gap-3 text-[10px] text-text-sub">
              <p className="font-body-light tracking-[0.25em] text-brand-tiffanySoft">
                {item.category || "NEWS"}
              </p>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-medium tracking-[0.18em] text-white">
                {sourceName}
              </span>
            </div>

            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text-sub">
              {dateLabel && <span>{dateLabel}</span>}
              {item.maker && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {item.maker}
                </span>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {item.excerpt && (
              <p className="mt-5 text-sm leading-relaxed text-text-sub sm:text-[15px]">
                {item.excerpt}
              </p>
            )}

            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              記事本文は著作権の都合上このサイトには掲載せず、
              見出しと要約・メモを中心に整理する方針です。
              詳細は必ず元記事のリンクからご確認ください。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-tiffany-500 px-6 py-2 text-xs font-medium tracking-[0.18em] text-white shadow-soft-strong hover:bg-tiffany-600 hover:shadow-soft-stronger"
                >
                  元記事を開く
                </a>
              )}
              <Link
                href="/news"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-2 text-xs font-medium tracking-[0.18em] text-slate-700 hover:bg-white"
              >
                ニュース一覧へ戻る
              </Link>
            </div>
          </GlassCard>

          {/* 右: メタ情報・メモ枠 */}
          <div className="space-y-4">
            <GlassCard padding="lg">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                SUMMARY NOTE
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                このニュースについての補足コメントや、
                関連する他社動向との比較メモなどを、
                今後少しずつ追記していく予定です。
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-text-sub">
                <li>・元記事のポイントを短く整理</li>
                <li>・他メーカー/他モデルとの比較視点</li>
                <li>・オーナー目線で気になる点のメモ</li>
              </ul>
            </GlassCard>

            <GlassCard padding="lg">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                RELATED NAVIGATION
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <Link
                  href="/news"
                  className="rounded-full border border-tiffany-400/70 bg-white/80 px-4 py-1.5 font-medium text-tiffany-700 hover:bg-white"
                >
                  NEWS一覧へ
                </Link>
                {item.maker && (
                  <Link
                    href={`/news?maker=${encodeURIComponent(item.maker)}`}
                    className="rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-slate-700 hover:bg-white"
                  >
                    同じメーカーのニュース
                  </Link>
                )}
                {item.tags && item.tags.length > 0 && (
                  <Link
                    href={`/news?tag=${encodeURIComponent(item.tags[0])}`}
                    className="rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-slate-700 hover:bg-white"
                  >
                    関連タグのニュース
                  </Link>
                )}
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}
