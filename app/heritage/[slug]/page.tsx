// app/heritage/[slug]/page.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
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

type BodyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string };

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

// 本文を「■〜」「【〜】」で見出し、それ以外を段落に分解
function parseBody(text?: string | null): BodyBlock[] {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const blocks: BodyBlock[] = [];
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
      flushParagraph();
      continue;
    }

    // ■ や 【〜】 で始まる行 → 見出し扱い
    if (/^(■|【)/.test(line)) {
      flushParagraph();

      let heading = line.replace(/^■\s*/, "");
      if (heading.startsWith("【") && heading.endsWith("】")) {
        heading = heading.slice(1, -1).trim();
      }

      if (heading) {
        blocks.push({ type: "heading", text: heading });
      }
      continue;
    }

    currentParagraph.push(line);
  }

  flushParagraph();

  return blocks;
}

// タグに入っているキーワードを本文中でハイライト
function highlightText(text: string, terms: string[]): ReactNode {
  if (!terms.length) return text;

  const escaped = terms
    .filter((t) => t && t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!escaped.length) return text;

  const pattern = new RegExp(escaped.join("|"), "g");
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push(
      <span
        key={`${match[0]}-${match.index}`}
        className="font-semibold text-rose-300"
      >
        {match[0]}
      </span>,
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
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
      (item) => item.maker && heritage.maker && item.maker === heritage.maker,
    ),
  );

  const { prev, next } = findNeighbors(sameMaker, heritage.slug);

  const dateLabel =
    formatDateLabel(heritage.publishedAt) ??
    formatDateLabel(heritage.updatedAt);
  const tags = (heritage.tags ?? []).filter(
    (t): t is string => typeof t === "string" && t.trim().length > 0,
  );

  const title = heritage.titleJa ?? heritage.title ?? heritage.slug;

  const blocks = parseBody(heritage.body);

  // セクション分割（見出しごとに1セクション）
  const sections: { heading?: string; paragraphs: string[] }[] = [];
  let current: { heading?: string; paragraphs: string[] } | null = null;

  for (const block of blocks) {
    if (block.type === "heading") {
      if (current) sections.push(current);
      current = { heading: block.text, paragraphs: [] };
    } else {
      if (!current) {
        current = { heading: undefined, paragraphs: [] };
      }
      current.paragraphs.push(block.text);
    }
  }
  if (current) sections.push(current);

  const introSection =
    sections.length > 0 && !sections[0].heading ? sections[0] : undefined;
  const mainSections =
    sections.length > 0 && !sections[0].heading
      ? sections.slice(1)
      : sections;

  const introParagraphs = introSection?.paragraphs ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ページ全体の光レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[38vh] bg-gradient-to-b from-black via-slate-950 to-transparent" />
        <div className="absolute -left-[18%] top-[18%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(248,250,252,0.16),_transparent_72%)] blur-[120px]" />
        <div className="absolute -right-[20%] bottom-[-10%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(127,29,29,0.34),_transparent_75%)] blur-[130px]" />
      </div>

      <div className="relative z-10">
        {/* ヒーロー（表紙イメージ） */}
        <section className="border-b border-white/5 bg-gradient-to-b from-black/90 via-slate-950 to-slate-950/95">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-9 md:py-11">
            <Reveal>
              <nav className="flex items-center text-[11px] text-slate-400">
                <Link href="/" className="hover:text-slate-100">
                  HOME
                </Link>
                <span className="mx-2 text-slate-600">/</span>
                <Link href="/heritage" className="hover:text-slate-100">
                  HERITAGE
                </Link>
                <span className="mx-2 text-slate-600">/</span>
                <span className="line-clamp-1 text-slate-500">DETAIL</span>
              </nav>
            </Reveal>

            <Reveal>
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                <div className="flex-1 space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                    BRAND HERITAGE
                  </p>
                  <h1 className="serif-heading text-3xl font-semibold tracking-tight text-slate-50 sm:text-[2.4rem] md:text-[2.7rem]">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                    {heritage.maker && (
                      <span className="rounded-full border border-slate-500/70 bg-slate-900/80 px-3 py-0.5 uppercase tracking-[0.18em] text-slate-100">
                        {heritage.maker}
                      </span>
                    )}
                    {heritage.modelName && (
                      <span className="text-[11px] text-slate-300">
                        {heritage.modelName}
                      </span>
                    )}
                    {heritage.eraLabel && (
                      <span className="text-[11px] text-slate-300">
                        {heritage.eraLabel}
                      </span>
                    )}
                    {dateLabel && (
                      <>
                        <span className="h-[1px] w-4 bg-slate-700" />
                        <span className="text-[11px] text-slate-400">
                          {dateLabel} UPDATED
                        </span>
                      </>
                    )}
                  </div>
                  {heritage.summary && (
                    <p className="max-w-2xl text-[13px] leading-relaxed text-slate-200/90 sm:text-sm sm:leading-7">
                      {heritage.summary}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 本文＋前後リンク */}
        <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-black">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-9 md:grid-cols-[minmax(0,2.1fr)_minmax(0,0.95fr)] md:py-11">
            {/* 本文エリア */}
            <div className="space-y-8">
              {/* 導入部：雑誌のリードページ風 */}
              <GlassCard className="border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-black/90 shadow-[0_18px_45px_rgba(0,0,0,0.6)]">
                <div className="space-y-5 p-5 md:p-7">
                  {introParagraphs.length > 0 ? (
                    <>
                      {introParagraphs.map((p, index) => {
                        // 最初の段落だけドロップキャップ
                        if (index === 0 && p.trim().length > 0) {
                          const firstChar = p[0] ?? "";
                          const rest = p.slice(1);
                          return (
                            <p
                              key={`intro-${index}`}
                              className="text-[13px] leading-8 text-slate-100 sm:text-[15px] sm:leading-[2rem]"
                            >
                              <span className="mr-1 inline-block align-top text-5xl font-semibold leading-[0.8] text-rose-300">
                                {firstChar}
                              </span>
                              <span>{highlightText(rest, tags)}</span>
                            </p>
                          );
                        }
                        return (
                          <p
                            key={`intro-${index}`}
                            className="text-[13px] leading-8 text-slate-100/95 sm:text-[15px] sm:leading-[2rem]"
                          >
                            {highlightText(p, tags)}
                          </p>
                        );
                      })}
                    </>
                  ) : heritage.body ? (
                    <div className="whitespace-pre-line text-[13px] leading-8 text-slate-100 sm:text-[15px] sm:leading-[2rem]">
                      {heritage.body}
                    </div>
                  ) : heritage.summary ? (
                    <p className="whitespace-pre-line text-[13px] leading-8 text-slate-100 sm:text-[15px] sm:leading-[2rem]">
                      {heritage.summary}
                    </p>
                  ) : null}
                </div>
              </GlassCard>

              {/* 各世代セクション：交互レイアウト */}
              <div className="space-y-7">
                {mainSections.map((section, index) => {
                  const isEven = index % 2 === 0;

                  return (
                    <div
                      key={section.heading ?? `sec-${index}`}
                      className="overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950/90 via-slate-900/95 to-black/90 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
                    >
                      <div
                        className={`grid gap-6 p-5 md:p-7 lg:grid-cols-12 lg:items-start ${
                          isEven ? "" : "lg:[&>*:first-child]:order-2"
                        }`}
                      >
                        {/* 見出しブロック */}
                        <div className="lg:col-span-4">
                          {section.heading && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-semibold tracking-[0.3em] text-slate-500">
                                {`0${index + 1}`.slice(-2)} CHAPTER
                              </p>
                              <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-50 sm:text-base">
                                {highlightText(section.heading, tags)}
                              </h2>
                              <div className="h-[1px] w-10 bg-gradient-to-r from-rose-400 via-rose-500/70 to-transparent" />
                            </div>
                          )}
                        </div>

                        {/* 本文ブロック */}
                        <div className="lg:col-span-8">
                          <div className="space-y-4 text-[13px] leading-7 text-slate-100/95 sm:text-[15px] sm:leading-[1.9rem]">
                            {section.paragraphs.map((p, i) => (
                              <p key={`sec-${index}-p-${i}`}>
                                {highlightText(p, tags)}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TAGS */}
              {tags.length > 0 && (
                <div className="pt-4">
                  <p className="mb-2 text-[11px] font-medium tracking-[0.2em] text-slate-400">
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

              {/* 一覧・前後リンク */}
              <div className="flex flex-col gap-3 pt-4 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/heritage"
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 underline-offset-4 hover:text-slate-50 hover:underline"
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
                        className="inline-flex max-w-xs flex-col gap-1 border border-slate-700 bg-slate-900/80 px-3 py-2 hover:border-rose-400 hover:bg-slate-900"
                      >
                        <span className="text-[10px] text-slate-400">
                          PREVIOUS
                        </span>
                        <span className="line-clamp-2 text-[12px] font-medium text-slate-50 sm:text-[13px]">
                          {prev.titleJa ?? prev.title}
                        </span>
                      </Link>
                    ) : (
                      <span />
                    )}

                    {next ? (
                      <Link
                        href={`/heritage/${encodeURIComponent(next.slug)}`}
                        className="inline-flex max-w-xs flex-col items-end gap-1 border border-slate-700 bg-slate-900/80 px-3 py-2 text-right hover:border-rose-400 hover:bg-slate-900"
                      >
                        <span className="text-[10px] text-slate-400">
                          NEXT
                        </span>
                        <span className="line-clamp-2 text-[12px] font-medium text-slate-50 sm:text-[13px]">
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

            {/* 右カラム：簡易説明（将来ここに画像や年代表なども追加可能） */}
            <aside className="space-y-4">
              <GlassCard className="border border-slate-800/80 bg-slate-900/90">
                <div className="space-y-3 p-4 md:p-5">
                  <h2 className="text-[11px] font-semibold tracking-[0.2em] text-slate-300">
                    THE GT-R CHRONICLE
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    HERITAGEでは、各ブランドの「系譜」を一本のストーリーとして整理していきます。
                    GT-Rであれば、ハコスカ・ケンメリ・R32・R33・R34・R35…と、時代ごとのキャラクターの
                    変化を雑誌の特集のようなトーンで追いかけられることを目指しています。
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    今後はここに、同一ブランドの年代表や、代表的なスペック変遷、
                    コラムへの導線なども追加していく予定です。
                  </p>
                </div>
              </GlassCard>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
