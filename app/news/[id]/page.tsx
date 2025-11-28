// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getNewsById,
  getLatestNews,
  type NewsItem,
} from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const item = await getNewsById(params.id);

  if (!item) {
    return {
      title: "記事が見つかりません | CAR BOUTIQUE",
      description: "指定されたニュース記事が見つかりませんでした。",
    };
  }

  const title = item.titleJa ?? item.title;
  const description =
    item.excerpt ??
    item.commentJa ??
    "クルマのニュースと、その先にある物語を届ける CAR BOUTIQUE のニュース詳細ページです。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: item.url || `https://car-hp.vercel.app/news/${encodeURIComponent(item.id)}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildSourceLabel(item: NewsItem): string {
  if (item.sourceName) return item.sourceName;
  if (item.maker) return item.maker;
  return "";
}

function buildTagList(item: NewsItem): string[] {
  return Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
}

export default async function NewsDetailPage({ params }: PageProps) {
  const item = await getNewsById(params.id);

  if (!item) {
    notFound();
  }

  const related = await getRelatedNews(item);

  const title = item.titleJa ?? item.title;
  const dateLabel =
    item.publishedAtJa ?? formatDate(item.publishedAt ?? item.createdAt);
  const sourceLabel = buildSourceLabel(item);
  const tags = buildTagList(item);

  const sourceDomain = item.url
    ? (() => {
        try {
          const u = new URL(item.url);
          return u.hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <Reveal>
          <nav
            aria-label="パンくずリスト"
            className="mb-6 text-[10px] text-slate-500"
          >
            <Link href="/" className="hover:text-slate-800">
              HOME
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link href="/news" className="hover:text-slate-800">
              NEWS
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="line-clamp-1 text-slate-400">
              DETAIL
            </span>
          </nav>
        </Reveal>

        {/* HERO バンド（雑誌の見出し帯イメージ） */}
        <Reveal>
          <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-900 via-obsidian to-slate-900/96 px-5 py-6 text-slate-100 shadow-soft-strong sm:px-7 sm:py-8">
            {/* Tiffany 光レイヤー */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.36),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-[-40%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.8),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.08),_transparent_55%)]" />

            <div className="relative z-10 space-y-4">
              {/* ラベル行 */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.26em] text-tiffany-100">
                <span className="inline-flex items-center gap-2">
                  <span className="h-[1px] w-6 bg-tiffany-300" />
                  NEWS DETAIL
                </span>
                {item.category && (
                  <>
                    <span className="h-[1px] w-6 bg-slate-500/60" />
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] tracking-[0.2em] text-slate-100">
                      {item.category.toUpperCase()}
                    </span>
                  </>
                )}
              </div>

              {/* タイトル */}
              <h1 className="serif-heading text-2xl font-medium leading-snug text-white sm:text-[1.8rem]">
                {title}
              </h1>

              {/* 原題（翻訳タイトルの場合のみ） */}
              {item.title !== title && (
                <p className="text-[10px] text-slate-300">
                  原題: <span className="opacity-90">{item.title}</span>
                </p>
              )}

              {/* メタ情報 */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-200/80">
                {sourceLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 tracking-[0.18em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {sourceLabel}
                  </span>
                )}
                {item.maker && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 tracking-[0.18em]">
                    {item.maker}
                  </span>
                )}
                {dateLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 tracking-[0.18em]">
                    {dateLabel}
                  </span>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* 本文 + サイドメタ */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.3fr)]">
          {/* 本文カード */}
          <Reveal>
            <GlassCard className="border border-slate-200/70 bg-white/90 px-4 py-5 text-[13px] leading-relaxed text-slate-800 shadow-soft sm:px-6 sm:py-6">
              {/* 要約 */}
              {item.excerpt && (
                <section className="mb-5 rounded-2xl border border-tiffany-100 bg-tiffany-50/60 px-4 py-3 text-[12px] leading-relaxed text-slate-800">
                  <h2 className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-tiffany-700">
                    SUMMARY
                  </h2>
                  <p className="font-body">{item.excerpt}</p>
                </section>
              )}

              {/* CAR BOUTIQUE の視点 */}
              {item.commentJa && (
                <section className="mb-6 rounded-2xl bg-slate-900/95 px-4 py-3 text-[12px] leading-relaxed text-slate-100 shadow-soft-glow">
                  <h2 className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-tiffany-200">
                    CAR BOUTIQUE&apos;S NOTE
                  </h2>
                  <p className="font-body">{item.commentJa}</p>
                </section>
              )}

              {/* タグ */}
              {(tags.length > 0 || item.category || item.maker) && (
                <section className="mt-2 space-y-3 text-[11px]">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] tracking-[0.14em] text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 出典リンク */}
              {item.url && item.url !== "#" && (
                <section className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="text-[10px] text-slate-400">
                    <p className="tracking-[0.16em]">ORIGINAL SOURCE</p>
                    {sourceDomain && (
                      <p className="mt-0.5 break-all text-[10px] text-slate-500">
                        {sourceDomain}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-900 bg-slate-900 px-4 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white transition hover:-translate-y-[1px] hover:bg-slate-800 hover:shadow-soft-card"
                    >
                      元記事を読む
                      {sourceDomain && (
                        <span className="text-[9px] text-slate-200">
                          ({sourceDomain})
                        </span>
                      )}
                      <span className="text-[9px] text-slate-200">↗</span>
                    </Link>
                  </div>
                </section>
              )}
            </GlassCard>
          </Reveal>

          {/* サイドメタ（PCのみ） */}
          <aside className="hidden lg:block">
            <Reveal delay={80}>
              <div className="sticky top-24 space-y-4">
                <GlassCard className="border border-slate-200/70 bg-white/90 px-4 py-4 text-[11px] text-slate-700 shadow-soft">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    ARTICLE META
                  </p>
                  <dl className="space-y-1.5">
                    {sourceLabel && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[10px] text-slate-400">
                          SOURCE
                        </dt>
                        <dd className="text-right">{sourceLabel}</dd>
                      </div>
                    )}
                    {item.maker && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[10px] text-slate-400">
                          MAKER
                        </dt>
                        <dd className="text-right">{item.maker}</dd>
                      </div>
                    )}
                    {item.category && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[10px] text-slate-400">
                          CATEGORY
                        </dt>
                        <dd className="text-right">
                          {item.category.toUpperCase()}
                        </dd>
                      </div>
                    )}
                    {dateLabel && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[10px] text-slate-400">
                          DATE
                        </dt>
                        <dd className="text-right">{dateLabel}</dd>
                      </div>
                    )}
                  </dl>
                </GlassCard>

                <GlassCard className="border border-slate-200/70 bg-white/90 px-4 py-4 text-[11px] text-slate-700 shadow-soft">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    BACK TO LIST
                  </p>
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] tracking-[0.18em] text-slate-700 transition hover:border-tiffany-300 hover:text-tiffany-700"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[11px]">
                      ←
                    </span>
                    NEWS 一覧に戻る
                  </Link>
                </GlassCard>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* 関連ニュース */}
        {related.length > 0 && (
          <section className="mt-12">
            <Reveal>
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                  RELATED NEWS
                </h2>
                <Link
                  href="/news"
                  className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  NEWS 一覧へ
                </Link>
              </div>
            </Reveal>
            <div className="space-y-3">
              {related.map((r) => {
                const relatedDate =
                  r.publishedAtJa ??
                  formatDate(r.publishedAt ?? r.createdAt);
                const relatedSource = buildSourceLabel(r);

                return (
                  <Reveal key={r.id}>
                    <Link
                      href={`/news/${encodeURIComponent(r.id)}`}
                      className="block"
                    >
                      <article className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:shadow-soft-card">
                        <div className="flex-1">
                          <p className="line-clamp-2 font-medium tracking-[0.06em] text-slate-900">
                            {r.titleJa ?? r.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                            {relatedSource && (
                              <span className="tracking-[0.16em]">
                                {relatedSource}
                              </span>
                            )}
                            {r.maker && (
                              <>
                                <span className="h-[1px] w-4 bg-slate-200" />
                                <span className="tracking-[0.16em]">
                                  {r.maker}
                                </span>
                              </>
                            )}
                            {relatedDate && (
                              <>
                                <span className="h-[1px] w-4 bg-slate-200" />
                                <span className="tracking-[0.16em]">
                                  {relatedDate}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="hidden pl-3 text-[9px] font-semibold tracking-[0.24em] text-slate-300 transition group-hover:text-tiffany-500 sm:block">
                          READ
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* モバイル向け戻る導線 */}
        <div className="mt-10 border-t border-slate-100 pt-5 lg:hidden">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-[11px] tracking-[0.18em] text-slate-700 transition hover:border-tiffany-300 hover:text-tiffany-700"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[11px]">
              ←
            </span>
            NEWS 一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

async function getRelatedNews(current: NewsItem): Promise<NewsItem[]> {
  const items = await getLatestNews(80);
  const { id, maker, category, tags: currentTags } = current;

  return items
    .filter((item) => item.id !== id)
    .filter((item) => {
      if (maker && item.maker === maker) return true;
      if (category && item.category === category) return true;
      if (currentTags && currentTags.length > 0) {
        const set = new Set(currentTags);
        const itemTags = item.tags ?? [];
        if (itemTags.some((t) => set.has(t))) return true;
      }
      return false;
    })
    .slice(0, 5);
}
