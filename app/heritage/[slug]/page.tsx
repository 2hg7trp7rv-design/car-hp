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
        className="font-semibold text-tiffany-700"
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
  const hasStructuredBody = blocks.length > 0;

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* ページ専用の光レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[34vh] bg-gradient-to-b from-white/95 via-white/85 to-transparent" />
        <div className="absolute -left-[18%] top-[14%] h-[38vw] w-[38vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.14),_transparent_72%)] blur-[110px]" />
        <div className="absolute -right-[22%] bottom-[-10%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.22),_transparent_75%)] blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ヒーロー */}
        <section className="border-b border-slate-200/70 bg-gradient-to-b from-vapor/70 via-white to-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-9 md:py-11">
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                    BRAND HERITAGE
                  </p>
                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem] md:text-[2.25rem]">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    {heritage.maker && (
                      <span className="rounded-full border border-slate-300 bg-white/70 px-2.5 py-0.5 uppercase tracking-[0.16em] text-slate-700">
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
                      <>
                        <span className="h-[1px] w-4 bg-slate-200" />
                        <span className="text-[11px] text-slate-400">
                          {dateLabel} 更新
                        </span>
                      </>
                    )}
                  </div>
                  {heritage.summary && (
                    <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
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
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:py-10">
            {/* 本文 */}
            <div className="space-y-6">
              <GlassCard className="border border-slate-200/80 bg-gradient-to-b from-white/96 via-white to-white/95 shadow-soft">
                <div className="space-y-5 p-4 md:p-6">
                  {hasStructuredBody ? (
                    <div className="space-y-5 text-sm leading-relaxed text-text-main sm:text-[15px] sm:leading-[1.9rem]">
                      {blocks.map((block, idx) => {
                        if (block.type === "heading") {
                          return (
                            <h2
                              key={`h-${idx}`}
                              className="mt-2 border-l-2 border-tiffany-400 pl-3 text-[11px] font-semibold tracking-[0.2em] text-slate-700"
                            >
                              {highlightText(block.text, tags)}
                            </h2>
                          );
                        }

                        return (
                          <p
                            key={`p-${idx}`}
                            className="text-sm leading-7 text-text-main sm:text-[15px] sm:leading-[1.9rem]"
                          >
                            {highlightText(block.text, tags)}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      {heritage.body && (
                        <div className="whitespace-pre-line text-sm leading-relaxed text-text-main sm:text-[15px] sm:leading-[1.9rem]">
                          {heritage.body}
                        </div>
                      )}
                      {!heritage.body && heritage.summary && (
                        <p className="whitespace-pre-line text-sm leading-relaxed text-text-main sm:text-[15px] sm:leading-[1.9rem]">
                          {heritage.summary}
                        </p>
                      )}
                    </>
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
              </GlassCard>

              <div className="flex flex-col gap-3 pt-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/heritage"
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
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

            {/* 右カラム: 将来拡張用の軽い説明 */}
            <aside className="space-y-4">
              <GlassCard className="border border-slate-200/80 bg-white/90">
                <div className="space-y-3 p-4 md:p-5">
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                    SAME BRAND LINEUP
                  </h2>
                  <p className="text-[11px] leading-relaxed text-text-sub">
                    同じメーカーのHERITAGEは一覧ページで年代順に並びます。
                    GT-RならR32・R33・R34…と、時代ごとのキャラクターの変化を
                    まとめて追いかけられるように整理していく予定です。
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
