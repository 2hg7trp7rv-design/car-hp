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

  const title = heritage.titleJa ?? heritage.title ?? heritage.slug;
  const description =
    heritage.summary ??
    heritage.body ??
    "ブランドの系譜や名車の歴史を振り返るHERITAGEコンテンツです。";

  return {
    title: `${title} | HERITAGE | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | HERITAGE | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/heritage/${encodeURIComponent(
        heritage.slug,
      )}`,
    },
  };
}

// Page本体
export default async function HeritageDetailPage({ params }: PageProps) {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    notFound();
  }

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

  const title = heritage.titleJa ?? heritage.title ?? heritage.slug;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* ヒーロー */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-10">
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
              <span className="line-clamp-1 text-slate-400">DETAIL</span>
            </nav>
          </Reveal>

          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  BRAND HERITAGE
                </p>
                <h1 className="text-[1.7rem] font-semibold tracking-wide text-slate-900 sm:text-[1.9rem] md:text-[2.1rem]">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  {heritage.maker && (
                    <span className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-slate-700">
                      {heritage.maker}
                    </span>
                  )}
                  {heritage.modelName && (
                    <span className="text-[11px] text-slate-500">
                      {heritage.modelName}
                    </span>
                  )}
                  {heritage.eraLabel && (
                    <span className="text-[11px] text-slate-500">
                      {heritage.eraLabel}
                    </span>
                  )}
                  {dateLabel && (
                    <span className="text-[11px] text-slate-400">
                      {dateLabel} 更新
                    </span>
                  )}
                </div>
                {heritage.summary && (
                  <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
                    {heritage.summary}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文＋前後リンク */}
      <section className="border-b border-slate-200 bg-slate-100/80">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:py-10">
          {/* 本文 */}
          <div className="space-y-6">
            <GlassCard className="bg-white/80">
              <div className="p-4 sm:p-6">
                <div className="mx-auto max-w-3xl space-y-5">
                  {heritage.body && (
                    <div className="whitespace-pre-line text-[15px] leading-8 text-slate-700 sm:text-[15px]">
                      {heritage.body}
                    </div>
                  )}
                  {!heritage.body && heritage.summary && (
                    <p className="whitespace-pre-line text-[15px] leading-8 text-slate-700 sm:text-[15px]">
                      {heritage.summary}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div className="pt-4">
                      <p className="mb-1 text-[11px] font-medium tracking-[0.16em] text-slate-500">
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
              </div>
            </GlassCard>

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
                <div className="flex flex-col gap-2 pt-1 text-[11px] text-slate-600 md:flex-row md:justify-between">
                  {prev ? (
                    <Link
                      href={`/heritage/${encodeURIComponent(prev.slug)}`}
                      className="inline-flex max-w-xs flex-col gap-1 border border-slate-200 bg-white/70 px-3 py-2 hover:border-tiffany-300 hover:bg-white"
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
                      className="inline-flex max-w-xs flex-col items-end gap-1 border border-slate-200 bg-white/70 px-3 py-2 text-right hover:border-tiffany-300 hover:bg-white"
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
            <GlassCard className="bg-white/80">
              <div className="space-y-3 p-4 md:p-5">
                <h2 className="text-[12px] font-semibold tracking-[0.16em] text-slate-500">
                  SAME BRAND LINEUP
                </h2>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  同じメーカーのHERITAGEは、一覧ページから時系列で追いかけられます。
                </p>
              </div>
            </GlassCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
