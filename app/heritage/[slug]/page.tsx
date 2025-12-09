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
  if (index === -1) return { prev: null, next: null };
  const prev = index > 0 ? chain[index - 1] : null;
  const next = index < chain.length - 1 ? chain[index + 1] : null;
  return { prev, next };
}

// ------------ 本文パーサーまわり ------------

type Chapter = {
  id: string;
  title: string;
  content: string;
};

function parseChapters(body: string): Chapter[] {
  const lines = body.split(/\r?\n/);

  const chapters: Chapter[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];

  const pushCurrent = () => {
    if (!currentTitle) return;
    chapters.push({
      id: `chapter-${chapters.length + 1}`,
      title: currentTitle.trim(),
      content: currentLines.join("\n").trim(),
    });
    currentTitle = null;
    currentLines = [];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      currentLines.push("");
      continue;
    }

    if (trimmed.startsWith("■")) {
      // 新しい章の開始
      pushCurrent();
      currentTitle = trimmed.replace(/^■\s*/, "");
    } else {
      currentLines.push(raw);
    }
  }

  pushCurrent();
  return chapters;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const HIGHLIGHT_WORDS = [
  "GT-R",
  "スカイラインGT-R",
  "スカイライン",
  "ハコスカ",
  "ケンメリ",
  "R32",
  "R33",
  "R34",
  "R35",
  "PGC10",
  "KPGC10",
  "KPGC110",
  "BNR32",
  "BCNR33",
  "BNR34",
  "S20型",
  "RB26DETT",
  "VR38DETT",
  "NISSAN",
];

const HIGHLIGHT_REGEX = new RegExp(
  HIGHLIGHT_WORDS.map(escapeRegExp).join("|"),
  "g",
);

function highlightInline(text: string) {
  if (!text) return text;

  let lastIndex = 0;
  const nodes: (string | JSX.Element)[] = [];

  text.replace(HIGHLIGHT_REGEX, (match, offset) => {
    if (offset > lastIndex) {
      nodes.push(text.slice(lastIndex, offset));
    }
    nodes.push(
      <span
        key={`${match}-${offset}`}
        className="font-semibold text-rose-300"
      >
        {match}
      </span>,
    );
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex === 0) {
    // ハイライト対象なし
    return text;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderChapterBody(content: string) {
  const lines = content.split(/\r?\n/);

  const elements: JSX.Element[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;

    if (listBuffer.type === "ul") {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="space-y-1 text-[13px] md:text-sm leading-relaxed text-slate-100"
        >
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-500" />
              <span>{highlightInline(item.replace(/^・\s*/, ""))}</span>
            </li>
          ))}
        </ul>,
      );
    } else {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="space-y-1 text-[13px] md:text-sm leading-relaxed text-slate-100"
        >
          {listBuffer.items.map((item, idx) => {
            const numMatch = item.match(/^(\d+)\./);
            const num = numMatch ? numMatch[1] : String(idx + 1);
            return (
              <li key={idx} className="flex gap-2">
                <span className="mt-[1px] min-w-[1.5rem] text-right text-xs font-semibold text-slate-400">
                  {num}.
                </span>
                <span>{highlightInline(item.replace(/^\d+\.\s*/, ""))}</span>
              </li>
            );
          })}
        </ol>,
      );
    }

    listBuffer = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    // 空行→段落区切り
    if (!line) {
      flushList();
      continue;
    }

    // 番号付きリスト
    if (/^\d+\./.test(line)) {
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(line);
      continue;
    }

    // 箇条書き
    if (line.startsWith("・")) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(line);
      continue;
    }

    // 通常段落
    flushList();
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="text-[13px] md:text-[15px] leading-relaxed text-slate-100"
      >
        {highlightInline(line)}
      </p>,
    );
  }

  flushList();

  return (
    <div className="mx-auto max-w-3xl space-y-3 md:space-y-4">{elements}</div>
  );
}

function renderToc(chapters: Chapter[]) {
  if (chapters.length === 0) return null;

  return (
    <ol className="mx-auto max-w-3xl space-y-1.5 text-[13px] md:text-sm leading-relaxed text-slate-100">
      {chapters.map((chapter, index) => (
        <li key={chapter.id} className="flex gap-2">
          <span className="mt-[1px] min-w-[1.5rem] text-right text-xs font-semibold text-slate-400">
            {index + 1}.
          </span>
          <span>{highlightInline(chapter.title)}</span>
        </li>
      ))}
    </ol>
  );
}

// ------------ メタデータ ------------

export async function generateStaticParams() {
  const items = await getAllHeritage();
  return items.map((item) => ({
    slug: item.slug,
  }));
}

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

// ------------ Page本体 ------------

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

  const body = heritage.body ?? heritage.summary ?? "";
  const chapters = parseChapters(body);
  const introChapter = chapters[0] ?? null;
  const contentChapters = chapters.slice(1);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーロー */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
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
              <span className="line-clamp-1 text-slate-400">DETAIL</span>
            </nav>
          </Reveal>

          <Reveal>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.26em] text-slate-300">
                <span className="uppercase">BRAND HERITAGE</span>
                <span className="h-px w-10 bg-slate-500/60" />
                {dateLabel && (
                  <span className="tracking-normal text-slate-400">
                    UPDATED {dateLabel}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-semibold tracking-wide text-slate-50 md:text-3xl">
                {title}
              </h1>
              {heritage.summary && (
                <p className="max-w-3xl text-[13px] md:text-[15px] leading-relaxed text-slate-200">
                  {heritage.summary}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
                {heritage.maker && (
                  <span className="rounded-full border border-slate-600/80 px-2.5 py-0.5 uppercase tracking-[0.16em]">
                    {heritage.maker}
                  </span>
                )}
                {heritage.series && (
                  <span className="rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                    {heritage.series}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文エリア */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 pb-10 pt-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4">
          {/* 01: 導入チャプター */}
          {introChapter && (
            <Reveal>
              <GlassCard className="bg-slate-900/80 ring-1 ring-slate-800/80">
                <div className="space-y-4 p-5 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                      01 CHAPTER
                    </p>
                  </div>
                  <h2 className="text-[15px] md:text-lg font-semibold text-slate-50">
                    {highlightInline(introChapter.title)}
                  </h2>
                  {renderChapterBody(introChapter.content)}
                </div>
              </GlassCard>
            </Reveal>
          )}

          {/* 02: 目次 */}
          {chapters.length > 0 && (
            <Reveal>
              <GlassCard className="bg-slate-900/80 ring-1 ring-slate-800/80">
                <div className="space-y-4 p-5 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                      02 CHAPTER
                    </p>
                  </div>
                  <h2 className="text-[15px] md:text-lg font-semibold text-slate-50">
                    目次
                  </h2>
                  {renderToc(chapters)}
                </div>
              </GlassCard>
            </Reveal>
          )}

          {/* 03以降: 各世代チャプター */}
          {contentChapters.map((chapter, index) => {
            const chapterNo = index + 3;
            const chapterLabel = String(chapterNo).padStart(2, "0");
            return (
              <Reveal key={chapter.id}>
                <GlassCard className="bg-slate-900/80 ring-1 ring-slate-800/80">
                  <div className="space-y-4 p-5 md:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                        {chapterLabel} CHAPTER
                      </p>
                    </div>
                    <h2 className="text-[15px] md:text-lg font-semibold text-slate-50">
                      {highlightInline(chapter.title)}
                    </h2>
                    {renderChapterBody(chapter.content)}
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}

          {/* 下部ナビ */}
          <Reveal>
            <div className="flex flex-col gap-3 pt-2 text-xs">
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
                      className="inline-flex max-w-xs flex-col gap-1 border border-slate-700/80 bg-slate-900/80 px-3 py-2 hover:border-rose-400/70 hover:bg-slate-900"
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
                      className="inline-flex max-w-xs flex-col items-end gap-1 border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-right hover:border-rose-400/70 hover:bg-slate-900"
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
          </Reveal>

          {/* 右カラムにしていた説明カードは、読みやすさ優先で省略 */}
        </div>
      </section>
    </main>
  );
}
