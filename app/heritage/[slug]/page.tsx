// app/heritage/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllHeritage,
  getHeritageBySlug,
  type HeritageItem,
} from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

type HeritageWithMeta = HeritageItem & {
  platformCode?: string | null;
  generationLabel?: string | null;
  titleEn?: string | null;
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(iso?: string | null): string | null {
  const d = parseDate(iso ?? null);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function sortWithinMaker(items: HeritageItem[]): HeritageItem[] {
  return [...items].sort((a, b) => {
    const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
    const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);
    if (ad && bd) return ad.getTime() - bd.getTime();
    if (bd && !ad) return 1;
    if (ad && !bd) return -1;
    return (a.title ?? "").localeCompare(b.title ?? "");
  });
}

function findNeighbors(
  chain: HeritageItem[],
  currentSlug: string,
): { prev: HeritageItem | null; next: HeritageItem | null } {
  const index = chain.findIndex((item) => item.slug === currentSlug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  const prev = index > 0 ? chain[index - 1] : null;
  const next = index < chain.length - 1 ? chain[index + 1] : null;
  return { prev, next };
}

// SSG用: 全HERITAGEのslugから動的パスを生成
export async function generateStaticParams() {
  const items = await getAllHeritage();
  return items.map((item) => ({
    slug: item.slug,
  }));
}

// SEOメタ
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    return {
      title: "HERITAGEが見つかりません | CAR BOUTIQUE",
      description: "指定されたHERITAGEの記事は見つかりませんでした。",
    };
  }

  const titleBase =
    heritage.titleJa ?? heritage.title ?? heritage.slug;
  const description =
    heritage.summary ??
    heritage.body ??
    "ブランドの系譜や名車の歴史を振り返るHERITAGEコンテンツです。";

  return {
    title: `${titleBase} | HERITAGE | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${titleBase} | HERITAGE | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/heritage/${encodeURIComponent(
        heritage.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title: `${titleBase} | HERITAGE | CAR BOUTIQUE`,
      description,
    },
  };
}

// Page本体
export default async function HeritageDetailPage({ params }: PageProps) {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    notFound();
  }

  const h = heritage as HeritageWithMeta;

  const all = await getAllHeritage();
  const sameMaker = sortWithinMaker(
    all.filter(
      (item) =>
        item.maker &&
        heritage.maker &&
        item.maker === heritage.maker,
    ),
  );

  const { prev, next } = findNeighbors(sameMaker, heritage.slug);

  const dateLabel =
    formatDateLabel(heritage.publishedAt) ??
    formatDateLabel(heritage.updatedAt);
  const tags = heritage.tags ?? [];

  const titleMain =
    heritage.titleJa ?? heritage.title ?? heritage.slug;

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 背景レイヤー：ヘリテイジ専用の静かなグラデーション */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[45vh] bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="absolute -left-[18%] top-[14%] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.3),_transparent_70%)] blur-[120px]" />
        <div className="absolute -right-[20%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(8,47,73,0.22),_transparent_75%)] blur-[130px]" />
      </div>

      {/* ヒーロー */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-slate-50/95 via-white/90 to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-8 sm:px-6 md:pb-12 md:pt-10">
          <Reveal>
            <nav className="flex items-center text-[11px] text-slate-500">
              <Link href="/" className="hover:text-slate-800">
                HOME
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <Link href="/heritage" className="hover:text-slate-800">
                HERITAGE
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="line-clamp-1 text-slate-400">
                {titleMain}
              </span>
            </nav>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  BRAND HERITAGE
                </p>
                <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-[2.1rem]">
                  {titleMain}
                </h1>

                {/* メタ情報群 */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  {heritage.maker && (
                    <span className="rounded-full border border-slate-300 bg-white/90 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-800">
                      {heritage.maker}
                    </span>
                  )}
                  {heritage.modelName && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">
                      {heritage.modelName}
                    </span>
                  )}
                  {h.titleEn && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] italic text-slate-500">
                      {h.titleEn}
                    </span>
                  )}
                  {heritage.eraLabel && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">
                      {heritage.eraLabel}
                    </span>
                  )}
                  {h.platformCode && (
                    <span className="rounded-full border border-slate-200 bg-slate-900 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.22em] text-slate-100">
                      {h.platformCode}
                    </span>
                  )}
                  {h.generationLabel && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">
                      {h.generationLabel}
                    </span>
                  )}
                  {dateLabel && (
                    <>
                      <span className="h-[1px] w-6 bg-slate-200" />
                      <span className="text-[10px] tracking-[0.18em] text-slate-400">
                        UPDATED {dateLabel}
                      </span>
                    </>
                  )}
                </div>

                {heritage.summary && (
                  <p className="max-w-3xl text-xs leading-relaxed text-text-sub sm:text-sm">
                    {heritage.summary}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文＋前後リンク */}
      <section className="border-b border-slate-200/70 bg-transparent">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:pb-14 md:pt-10">
          {/* 本文 */}
          <div className="space-y-6">
            <GlassCard className="border border-slate-200/80 bg-white/90 shadow-soft">
              <div className="space-y-5 p-4 sm:p-6">
                {heritage.body && (
                  <div className="article-body-heritage whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-[15px] sm:leading-[2rem]">
                    {heritage.body}
                  </div>
                )}
                {!heritage.body && heritage.summary && (
                  <p className="article-body-heritage whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-[15px] sm:leading-[2rem]">
                    {heritage.summary}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="pt-4">
                    <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-slate-500">
                      TAGS
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 下部ナビゲーション */}
            <div className="flex flex-col gap-3 pt-2 text-xs">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/heritage"
                  className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[11px]">
                    ←
                  </span>
                  HERITAGE一覧に戻る
                </Link>
              </div>

              {(prev || next) && (
                <div className="flex flex-col gap-2 pt-1 text-xs text-slate-600 md:flex-row md:justify-between">
                  {prev ? (
                    <Link
                      href={`/heritage/${encodeURIComponent(prev.slug)}`}
                      className="inline-flex max-w-xs flex-col gap-1 border border-slate-200 bg-white/80 px-3 py-2 hover:border-tiffany-300 hover:bg-white"
                    >
                      <span className="text-[10px] text-slate-500">
                        PREVIOUS
                      </span>
                      <span className="line-clamp-2 text-[12px] font-medium text-slate-800">
                        {prev.titleJa ?? prev.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}

                  {next ? (
                    <Link
                      href={`/heritage/${encodeURIComponent(next.slug)}`}
                      className="inline-flex max-w-xs flex-col items-end gap-1 border border-slate-200 bg-white/80 px-3 py-2 text-right hover:border-tiffany-300 hover:bg-white"
                    >
                      <span className="text-[10px] text-slate-500">
                        NEXT
                      </span>
                      <span className="line-clamp-2 text-[12px] font-medium text-slate-800">
                        {next.titleJa ?? next.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右カラム: 同一メーカーの簡易リストなどに将来拡張予定 */}
          <aside className="space-y-4">
            <GlassCard className="border border-slate-200/80 bg-white/90 shadow-soft">
              <div className="space-y-3 p-4 sm:p-5">
                <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                  SAME BRAND LINEUP
                </h2>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  同じメーカーのHERITAGEは、一覧ページから時系列で追いかけられます。
                  将来的には、このサイドバーに「同じ系譜のほかの年式」や「関連する名車」へのショートカットも追加していきます。
                </p>
              </div>
            </GlassCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
