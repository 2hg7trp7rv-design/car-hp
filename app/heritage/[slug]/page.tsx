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

// ---- 本文用のシンプルなパーサー ----
// 「■ 見出し」行を h2 扱い、それ以外を段落としてまとめる
type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string };

function parseBody(body?: string | null): ContentBlock[] {
  if (!body) return [];
  const lines = body.split(/\r?\n/);

  const blocks: ContentBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (!currentParagraph.length) return;
    blocks.push({
      type: "paragraph",
      text: currentParagraph.join(" "),
    });
    currentParagraph = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      // 空行で段落区切り
      flushParagraph();
      continue;
    }

    // 「■ 見出し」形式
    if (line.startsWith("■")) {
      flushParagraph();
      const text = line.replace(/^■\s*/, "").trim();
      if (text) {
        blocks.push({ type: "heading", text });
      }
      continue;
    }

    // それ以外は段落に連結
    currentParagraph.push(line);
  }

  flushParagraph();
  return blocks;
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
  const blocks = parseBody(heritage.body);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      {/* 背景の光（さっきのHERITAGE用の世界観に寄せる） */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-[-20%] top-[-15%] h-[260px] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.5),_transparent_70%)]" />
        <div className="absolute inset-x-[-30%] bottom-[-30%] h-[320px] bg-[radial-gradient(circle_at_bottom,_rgba(8,47,73,0.9),_transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <Reveal>
          <nav className="mb-6 flex items-center text-[11px] text-slate-400">
            <Link href="/" className="hover:text-slate-100">
              HOME
            </Link>
            <span className="mx-2 text-slate-500">/</span>
            <Link href="/heritage" className="hover:text-slate-100">
              HERITAGE
            </Link>
            <span className="mx-2 text-slate-500">/</span>
            <span className="line-clamp-1 text-slate-500">DETAIL</span>
          </nav>
        </Reveal>

        {/* ヘッダー */}
        <header className="mb-10">
          <Reveal>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.26em] text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                BRAND HERITAGE
              </span>
              {heritage.maker && (
                <>
                  <span className="h-[1px] w-6 bg-slate-700/80" />
                  <span className="rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-[10px] tracking-[0.18em] text-slate-100">
                    {heritage.maker}
                  </span>
                </>
              )}
              {heritage.eraLabel && (
                <>
                  <span className="h-[1px] w-6 bg-slate-700/80" />
                  <span className="text-[10px] tracking-[0.18em] text-slate-400">
                    {heritage.eraLabel}
                  </span>
                </>
              )}
              {dateLabel && (
                <>
                  <span className="h-[1px] w-6 bg-slate-700/80" />
                  <span className="text-[10px] tracking-[0.18em] text-slate-500">
                    UPDATED {dateLabel}
                  </span>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="serif-heading text-[1.5rem] font-semibold leading-snug tracking-tight text-slate-50 sm:text-[1.8rem] lg:text-[2rem]">
              {title}
            </h1>
          </Reveal>

          {heritage.modelName && (
            <Reveal delay={120}>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {heritage.modelName}
              </p>
            </Reveal>
          )}

          {heritage.summary && (
            <Reveal delay={160}>
              <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-slate-300 sm:text-sm">
                {heritage.summary}
              </p>
            </Reveal>
          )}
        </header>

        {/* 本文 + サイド情報 */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          {/* 本文 */}
          <div>
            <GlassCard className="border border-slate-700/80 bg-slate-900/80 shadow-soft">
              <article className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-7">
                {/* カード内の薄い光 */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.32),_transparent_70%)] blur-3xl" />

                <div className="relative z-10">
                  {blocks.length === 0 && heritage.body && (
                    <p className="whitespace-pre-line text-[15px] leading-[2.1rem] text-slate-100 sm:text-base sm:leading-[2.1rem]">
                      {heritage.body}
                    </p>
                  )}

                  {blocks.map((block, index) => {
                    if (block.type === "heading") {
                      // CHAPTER番号っぽいラベル
                      const chapterIndex =
                        blocks
                          .slice(0, index + 1)
                          .filter((b) => b.type === "heading").length;

                      return (
                        <Reveal key={`h-${index}`} delay={index === 0 ? 0 : 60}>
                          <div className="mt-8 mb-4 border-l-2 border-tiffany-400/80 pl-4">
                            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                              {chapterIndex.toString().padStart(2, "0")} CHAPTER
                            </p>
                            <h2 className="mt-1 text-[15px] font-semibold leading-relaxed text-slate-50 sm:text-[16px]">
                              {block.text}
                            </h2>
                          </div>
                        </Reveal>
                      );
                    }

                    return (
                      <p
                        key={`p-${index}`}
                        className="mt-3 text-[15px] leading-[2.1rem] text-slate-100 sm:text-base sm:leading-[2.1rem]"
                      >
                        {block.text}
                      </p>
                    );
                  })}

                  {tags.length > 0 && (
                    <div className="mt-7 border-t border-slate-700 pt-4">
                      <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                        TAGS
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </GlassCard>

            {/* 下部ナビ（SPメイン） */}
            <div className="mt-8 flex flex-col gap-3 text-xs lg:hidden">
              <Link
                href="/heritage"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-200 underline-offset-4 hover:text-tiffany-300 hover:underline"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 text-[11px]">
                  ←
                </span>
                HERITAGE一覧に戻る
              </Link>

              {(prev || next) && (
                <div className="flex flex-col gap-2 pt-1">
                  {prev && (
                    <Link
                      href={`/heritage/${encodeURIComponent(prev.slug)}`}
                      className="inline-flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-left text-[12px] text-slate-100 hover:border-tiffany-300 hover:text-tiffany-50"
                    >
                      <span className="text-[10px] font-semibold text-slate-400">
                        PREVIOUS
                      </span>
                      <span className="line-clamp-2 font-medium">
                        {prev.titleJa ?? prev.title}
                      </span>
                    </Link>
                  )}
                  {next && (
                    <Link
                      href={`/heritage/${encodeURIComponent(next.slug)}`}
                      className="inline-flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-left text-[12px] text-slate-100 hover:border-tiffany-300 hover:text-tiffany-50"
                    >
                      <span className="text-[10px] font-semibold text-slate-400">
                        NEXT
                      </span>
                      <span className="line-clamp-2 font-medium">
                        {next.titleJa ?? next.title}
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右カラム（PC用） */}
          <aside className="hidden flex-col gap-4 text-[11px] text-slate-300 lg:flex">
            <GlassCard className="border border-slate-700/80 bg-slate-900/80">
              <div className="space-y-3 p-4">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
                  LINEUP GUIDE
                </p>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  同じメーカーのHERITAGEは、一覧ページから時系列でたどれるように
                  並べています。気になる年代のモデルも合わせてチェックしてみてください。
                </p>
                <Link
                  href="/heritage"
                  className="inline-flex items-center gap-2 text-[11px] font-medium text-tiffany-300 underline-offset-4 hover:underline"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-[11px]">
                    ←
                  </span>
                  HERITAGE 一覧へ
                </Link>
              </div>
            </GlassCard>

            {(prev || next) && (
              <GlassCard className="border border-slate-700/80 bg-slate-900/80">
                <div className="space-y-3 p-4">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
                    SAME BRAND HISTORY
                  </p>
                  <div className="space-y-2">
                    {prev && (
                      <Link
                        href={`/heritage/${encodeURIComponent(prev.slug)}`}
                        className="block rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-100 hover:border-tiffany-300"
                      >
                        <p className="text-[10px] font-semibold text-slate-400">
                          PREVIOUS
                        </p>
                        <p className="line-clamp-2 font-medium">
                          {prev.titleJa ?? prev.title}
                        </p>
                      </Link>
                    )}
                    {next && (
                      <Link
                        href={`/heritage/${encodeURIComponent(next.slug)}`}
                        className="block rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-100 hover:border-tiffany-300"
                      >
                        <p className="text-[10px] font-semibold text-slate-400">
                          NEXT
                        </p>
                        <p className="line-clamp-2 font-medium">
                          {next.titleJa ?? next.title}
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              </GlassCard>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
