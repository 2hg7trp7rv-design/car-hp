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

// 本文を「イントロ + ■見出しごとのチャプター」に分割する
type ParsedChapter = {
  index: number;
  title: string;
  body: string;
};

type ParsedBody = {
  intro: string;
  chapters: ParsedChapter[];
};

function parseHeritageBody(raw?: string | null): ParsedBody {
  if (!raw) {
    return { intro: "", chapters: [] };
  }

  const lines = raw.split(/\r?\n/);
  const introLines: string[] = [];
  const chapterBuckets: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const lineRaw of lines) {
    const line = lineRaw.trimEnd();

    if (line.trim().startsWith("■")) {
      // 新しいチャプター開始
      const title = line.replace(/^■\s*/, "").trim();
      if (current) {
        chapterBuckets.push(current);
      }
      current = { title, lines: [] };
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }

  if (current) {
    chapterBuckets.push(current);
  }

  const intro = introLines.join("\n").trim();

  const chapters: ParsedChapter[] = chapterBuckets
    .map((c, idx) => ({
      index: idx + 1,
      title: c.title.trim(),
      body: c.lines.join("\n").trim(),
    }))
    .filter((c) => c.title || c.body);

  return { intro, chapters };
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

// SSG用: 全HERITAGEのslugから動的パスを生成
export async function generateStaticParams() {
  const items = await getAllHeritage();
  return items.map((item) => ({
    slug: item.slug,
  }));
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

  const parsed = parseHeritageBody(heritage.body);
  const hasChapters = parsed.chapters.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーロー */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 via-slate-900/40 to-transparent" />
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.16),_transparent_70%)] blur-3xl" />
          <div className="absolute -right-24 bottom-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_75%)] blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
          <Reveal>
            <nav className="flex items-center text-xs text-slate-400">
              <Link href="/" className="hover:text-slate-100">
                HOME
              </Link>
              <span className="mx-2 text-slate-500">/</span>
              <Link href="/heritage" className="hover:text-slate-100">
                HERITAGE
              </Link>
              <span className="mx-2 text-slate-500">/</span>
              <span className="line-clamp-1 text-slate-500">
                DETAIL
              </span>
            </nav>
          </Reveal>

          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-4">
                <p className="text-[11px] uppercase tracking-[0.32em] text-sky-300/80">
                  BRAND HERITAGE
                </p>
                <h1 className="text-2xl font-semibold tracking-[0.04em] text-slate-50 md:text-3xl lg:text-[2rem]">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  {heritage.maker && (
                    <span className="rounded-full border border-slate-600/80 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.16em]">
                      {heritage.maker}
                    </span>
                  )}
                  {heritage.modelName && (
                    <span className="text-slate-300">
                      {heritage.modelName}
                    </span>
                  )}
                  {heritage.eraLabel && (
                    <span className="text-slate-400">
                      {heritage.eraLabel}
                    </span>
                  )}
                  {dateLabel && (
                    <>
                      <span className="h-[1px] w-6 bg-slate-700/70" />
                      <span className="text-slate-400">
                        {dateLabel} 更新
                      </span>
                    </>
                  )}
                </div>
                {heritage.summary && (
                  <p className="max-w-2xl text-xs leading-relaxed text-slate-200/80 sm:text-sm">
                    {heritage.summary}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文 */}
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:py-10">
          {/* 本文エリア */}
          <div className="space-y-6">
            <GlassCard className="relative overflow-hidden border-slate-700/80 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50/5 via-transparent to-transparent" />
                <div className="absolute right-[-10%] top-[15%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.26),_transparent_70%)] blur-3xl" />
                <div className="absolute -left-24 bottom-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_75%)] blur-3xl" />
              </div>

              <div className="relative space-y-8 p-5 sm:p-7">
                {/* イントロ：1回だけ表示 */}
                {parsed.intro && (
                  <section className="space-y-3">
                    <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-400">
                      INTRODUCTION
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100 sm:text-[15px] sm:leading-[1.9rem]">
                      {parsed.intro}
                    </p>
                  </section>
                )}

                {/* CHAPTER ブロック */}
                {hasChapters ? (
                  <section className="space-y-10">
                    {parsed.chapters.map((chapter) => (
                      <article
                        key={chapter.index}
                        className="rounded-3xl border border-slate-700/70 bg-slate-900/60 px-4 py-5 sm:px-6 sm:py-7 shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
                      >
                        <div className="mb-3 flex items-baseline justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-400">
                              {chapter.index.toString().padStart(2, "0")} CHAPTER
                            </p>
                            <h2 className="mt-1 text-[15px] font-semibold leading-relaxed text-slate-50 sm:text-[17px]">
                              {chapter.title}
                            </h2>
                            <div className="mt-1 h-[2px] w-16 bg-gradient-to-r from-emerald-400 via-sky-400 to-transparent" />
                          </div>
                        </div>
                        <div className="whitespace-pre-line text-[13px] leading-relaxed text-slate-100/90 sm:text-sm sm:leading-[1.9rem]">
                          {chapter.body}
                        </div>
                      </article>
                    ))}
                  </section>
                ) : (
                  // チャプターが取れない記事用のフォールバック
                  <section className="space-y-4">
                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-100 sm:text-[15px] sm:leading-[1.9rem]">
                      {heritage.body ?? heritage.summary}
                    </div>
                  </section>
                )}

                {/* TAGS */}
                {tags.length > 0 && (
                  <div className="pt-4">
                    <p className="mb-1 text-[11px] font-medium tracking-[0.18em] text-slate-400">
                      TAGS
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-600 bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-slate-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 下部ナビ */}
            <div className="flex flex-col gap-3 pt-2 text-xs">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/heritage"
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-200 underline-offset-4 hover:text-sky-300 hover:underline"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-[11px]">
                    ←
                  </span>
                  HERITAGE一覧に戻る
                </Link>
              </div>

              {(prev || next) && (
                <div className="flex flex-col gap-2 pt-1 text-xs text-slate-200 md:flex-row md:justify-between">
                  {prev ? (
                    <Link
                      href={`/heritage/${encodeURIComponent(prev.slug)}`}
                      className="inline-flex max-w-xs flex-col gap-1 border border-slate-700 bg-slate-900/80 px-3 py-2 hover:border-sky-400/70 hover:bg-slate-900"
                    >
                      <span className="text-[10px] text-slate-400">
                        PREVIOUS
                      </span>
                      <span className="line-clamp-2 text-[12px] font-medium text-slate-50">
                        {prev.titleJa ?? prev.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}

                  {next ? (
                    <Link
                      href={`/heritage/${encodeURIComponent(next.slug)}`}
                      className="inline-flex max-w-xs flex-col items-end gap-1 border border-slate-700 bg-slate-900/80 px-3 py-2 text-right hover:border-sky-400/70 hover:bg-slate-900"
                    >
                      <span className="text-[10px] text-slate-400">
                        NEXT
                      </span>
                      <span className="line-clamp-2 text-[12px] font-medium text-slate-50">
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

          {/* 右カラム（簡易案内） */}
          <aside className="space-y-4">
            <GlassCard className="border-slate-700/80 bg-slate-900/80">
              <div className="space-y-3 p-4 md:p-5">
                <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-200">
                  SAME BRAND LINEUP
                </h2>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  同じメーカーのHERITAGEは、
                  一覧ページから年代順にたどれるようになっています。
                </p>
              </div>
            </GlassCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
