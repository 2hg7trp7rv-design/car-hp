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
import { Button } from "@/components/ui/button";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

// Heritage の拡張仕様（将来的な連携も見据えて optional で拡張）
type ExtendedHeritageItem = HeritageItem & {
  titleJa?: string | null;
  heroImage?: string | null;
  heroImageCredit?: string | null;
  periodLabel?: string | null; // 例: "1969–1973"
  eraStartYear?: number | null;
  eraEndYear?: number | null;
  highlightQuote?: string | null;
  keyModels?: string[] | null; // 関連する代表車種名
  relatedCarSlugs?: string[] | null; // /cars/[slug] 連携用
  relatedNewsIds?: string[] | null; // /news/[id] 連携用
  relatedGuideSlugs?: string[] | null; // /guide/[slug] 連携用
  readingTimeMinutes?: number | null; // 手動で指定する場合
};

// ---- 日付まわり ----

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

// ---- メーカー内の並び替え・前後記事 ----

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

// ---- インライン強調まわり ----

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const BASE_HIGHLIGHT_WORDS = [
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

function createHighlightRegex(extraWords: string[] = []): RegExp | null {
  const all = [
    ...BASE_HIGHLIGHT_WORDS,
    ...extraWords.filter((w) => w && w.length > 0),
  ];
  const unique = Array.from(new Set(all));
  if (unique.length === 0) return null;

  return new RegExp(unique.map(escapeRegExp).join("|"), "g");
}

function highlightInline(
  text: string,
  highlightRegex: RegExp | null,
): string | (string | JSX.Element)[] {
  if (!text || !highlightRegex) return text;

  let lastIndex = 0;
  const nodes: (string | JSX.Element)[] = [];

  text.replace(highlightRegex, (match, offset) => {
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

function renderChapterBody(content: string, highlightRegex: RegExp | null) {
  const lines = content.split(/\r?\n/);

  const elements: JSX.Element[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;

    if (listBuffer.type === "ul") {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="space-y-1 text-[14px] md:text-[15px] leading-relaxed text-slate-100"
        >
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-500" />
              <span>
                {highlightInline(item.replace(/^・\s*/, ""), highlightRegex)}
              </span>
            </li>
          ))}
        </ul>,
      );
    } else {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="space-y-1 text-[14px] md:text-[15px] leading-relaxed text-slate-100"
        >
          {listBuffer.items.map((item, idx) => {
            const numMatch = item.match(/^(\d+)\./);
            const num = numMatch ? numMatch[1] : String(idx + 1);
            return (
              <li key={idx} className="flex gap-2">
                <span className="mt-[1px] min-w-[1.5rem] text-right text-xs font-semibold text-slate-400">
                  {num}.
                </span>
                <span>
                  {highlightInline(
                    item.replace(/^\d+\.\s*/, ""),
                    highlightRegex,
                  )}
                </span>
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
        className="text-[14px] md:text-[15px] leading-relaxed text-slate-100"
      >
        {highlightInline(line, highlightRegex)}
      </p>,
    );
  }

  flushList();

  return (
    <div className="mx-auto max-w-3xl space-y-3 md:space-y-4">{elements}</div>
  );
}

function renderToc(chapters: Chapter[], highlightRegex: RegExp | null) {
  if (chapters.length === 0) return null;

  return (
    <ol className="mx-auto max-w-3xl space-y-1.5 text-[13px] md:text-sm leading-relaxed text-slate-100">
      {chapters.map((chapter, index) => (
        <li key={chapter.id} className="flex gap-2">
          <span className="mt-[1px] min-w-[1.5rem] text-right text-xs font-semibold text-slate-400">
            {index + 1}.
          </span>
          <a
            href={`#${chapter.id}`}
            className="inline-block text-slate-100 underline-offset-4 hover:text-rose-200 hover:underline"
          >
            {highlightInline(chapter.title, highlightRegex)}
          </a>
        </li>
      ))}
    </ol>
  );
}

// HeritageItem に series があるケースだけを安全に扱うための type guard
type HeritageItemWithSeries = HeritageItem & { series?: string };

function hasSeries(heritage: HeritageItem): heritage is HeritageItemWithSeries {
  return typeof (heritage as any).series === "string";
}

// ---- 読了時間のざっくり推定 ----

function estimateReadingTimeMinutes(body: string): number {
  const plain = body.replace(/\s+/g, "");
  const length = plain.length;
  if (length === 0) return 0;
  // 日本語: 400〜600文字/分くらいを目安
  const minutes = Math.round(length / 550);
  return Math.max(3, Math.min(30, minutes)); // 3〜30分の間にクリップ
}

// ------------ SSG・メタデータ ------------

export async function generateStaticParams() {
  const items = await getAllHeritage();
  return items.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const heritage = (await getHeritageBySlug(
    params.slug,
  )) as ExtendedHeritageItem | null;

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
  const heritage = (await getHeritageBySlug(
    params.slug,
  )) as ExtendedHeritageItem | null;

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

  const highlightRegex = createHighlightRegex([
    heritage.maker ?? "",
    ...(heritage.keyModels ?? []),
    ...(tags ?? []),
  ]);

  const readingTimeMinutes =
    heritage.readingTimeMinutes ?? estimateReadingTimeMinutes(body);

  const hasRelatedCars =
    Array.isArray(heritage.relatedCarSlugs) &&
    heritage.relatedCarSlugs.length > 0;
  const hasRelatedNews =
    Array.isArray(heritage.relatedNewsIds) &&
    heritage.relatedNewsIds.length > 0;
  const hasRelatedGuides =
    Array.isArray(heritage.relatedGuideSlugs) &&
    heritage.relatedGuideSlugs.length > 0;

  const hasRelated =
    hasRelatedCars || hasRelatedNews || hasRelatedGuides || !!heritage.maker;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーロー */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950">
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
              <span className="line-clamp-1 text-slate-400">
                {title}
              </span>
            </nav>
          </Reveal>

          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items中心 gap-3 text-[11px] tracking-[0.26em] text-slate-300">
                  <span className="uppercase">BRAND HERITAGE</span>
                  <span className="h-px w-10 bg-slate-500/60" />
                  {heritage.maker && (
                    <span className="rounded-full border border-slate-600/80 px-2.5 py-0.5 uppercase tracking-[0.16em]">
                      {heritage.maker}
                    </span>
                  )}
                  {heritage.periodLabel && (
                    <span className="rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] tracking-[0.16em] text-slate-300">
                      {heritage.periodLabel}
                    </span>
                  )}
                  {dateLabel && (
                    <span className="tracking-normal text-slate-400">
                      UPDATED {dateLabel}
                    </span>
                  )}
                  {readingTimeMinutes > 0 && (
                    <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-0.5 text-[10px] tracking-[0.14em] text-slate-200">
                      READING {readingTimeMinutes} min
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-semibold tracking-wide text-slate-50 md:text-3xl lg:text-[2.1rem]">
                  {title}
                </h1>

                {heritage.highlightQuote && (
                  <p className="max-w-3xl border-l-2 border-rose-400/70 pl-4 text-[13px] md:text-[15px] leading-relaxed text-slate-100">
                    {heritage.highlightQuote}
                  </p>
                )}

                {heritage.summary && (
                  <p className="max-w-3xl text-[13px] md:text-[15px] leading-relaxed text-slate-100/90">
                    {heritage.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
                  {hasSeries(heritage) && heritage.series && (
                    <span className="rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                      {heritage.series}
                    </span>
                  )}
                  {heritage.keyModels?.map((model) => (
                    <span
                      key={model}
                      className="rounded-full border border-slate-700/70 bg-slate-900/70 px-2.5 py-0.5 text-[11px] text-slate-100"
                    >
                      {model}
                    </span>
                  ))}
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/heritage?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-slate-700/60 bg-slate-900/70 px-2.5 py-0.5 text-[11px] text-slate-200 underline-offset-4 hover:border-rose-400/80 hover:text-rose-100 hover:underline"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 簡易 TOC / ページ内ナビ */}
              {chapters.length > 0 && (
                <aside className="w-full max-w-xs rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-[11px] text-slate-200 md:self-start">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.24em] text-slate-400">
                    ON THIS PAGE
                  </p>
                  <ul className="space-y-1.5">
                    {introChapter && (
                      <li>
                        <a
                          href={`#${introChapter.id}`}
                          className="line-clamp-2 text-[11px] text-slate-100 underline-offset-4 hover:text-rose-200 hover:underline"
                        >
                          {highlightInline(
                            introChapter.title,
                            highlightRegex,
                          )}
                        </a>
                      </li>
                    )}
                    {contentChapters.slice(0, 4).map((chapter) => (
                      <li key={chapter.id}>
                        <a
                          href={`#${chapter.id}`}
                          className="line-clamp-2 text-[11px] text-slate-300 underline-offset-4 hover:text-rose-200 hover:underline"
                        >
                          {highlightInline(chapter.title, highlightRegex)}
                        </a>
                      </li>
                    ))}
                    {contentChapters.length > 4 && (
                      <li className="text-[10px] text-slate-500">
                        以降の章は本文内で順番に続きます
                      </li>
                    )}
                  </ul>
                </aside>
              )}
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
                <div
                  id={introChapter.id}
                  className="space-y-4 p-5 md:p-7"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                      01 CHAPTER
                    </p>
                  </div>
                  <h2 className="text-[15px] md:text-lg font-semibold text-slate-50">
                    {highlightInline(introChapter.title, highlightRegex)}
                  </h2>
                  {renderChapterBody(introChapter.content, highlightRegex)}
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
                  {renderToc(chapters, highlightRegex)}
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
                  <div
                    id={chapter.id}
                    className="space-y-4 p-5 md:p-7"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                        {chapterLabel} CHAPTER
                      </p>
                    </div>
                    <h2 className="text-[15px] md:text-lg font-semibold text-slate-50">
                      {highlightInline(chapter.title, highlightRegex)}
                    </h2>
                    {renderChapterBody(chapter.content, highlightRegex)}
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}

          {/* 関連コンテンツへの導線 */}
          {hasRelated && (
            <Reveal>
              <GlassCard className="bg-slate-900/90 ring-1 ring-slate-800/80">
                <div className="space-y-4 p-5 md:p-7">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                        RELATED CONTENTS
                      </p>
                      <h2 className="mt-1 text-[15px] md:text-lg font-semibold text-slate-50">
                        このHERITAGEとつながるコンテンツ
                      </h2>
                      <p className="mt-2 max-w-xl text-[12px] md:text-[13px] leading-relaxed text-slate-300">
                        ブランドの歴史を押さえたうえで
                        実際の車種ページやニュース
                        お金まわりのガイドをあわせて読む前提の導線
                      </p>
                    </div>
                    {heritage.maker && (
                      <div className="pt-1 md:pt-0">
                        <Button
                          asChild
                          size="sm"
                          variant="primary"
                          className="rounded-full px-5 py-2 text-[11px] tracking-[0.16em]"
                        >
                          <Link
                            href={`/cars?maker=${encodeURIComponent(
                              heritage.maker,
                            )}`}
                          >
                            {heritage.maker} のCARSを見る
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {heritage.relatedCarSlugs?.map((slug) => (
                      <Link
                        key={slug}
                        href={`/cars/${encodeURIComponent(slug)}`}
                        className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100 underline-offset-4 hover:bg-slate-700 hover:text-rose-100 hover:underline"
                      >
                        関連CARS:{slug}
                      </Link>
                    ))}
                    {heritage.relatedNewsIds?.map((id) => (
                      <Link
                        key={id}
                        href={`/news/${encodeURIComponent(id)}`}
                        className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100 underline-offset-4 hover:bg-slate-700 hover:text-rose-100 hover:underline"
                      >
                        関連NEWS:id:{id}
                      </Link>
                    ))}
                    {heritage.relatedGuideSlugs?.map((slug) => (
                      <Link
                        key={slug}
                        href={`/guide/${encodeURIComponent(slug)}`}
                        className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100 underline-offset-4 hover:bg-slate-700 hover:text-rose-100 hover:underline"
                      >
                        関連GUIDE:{slug}
                      </Link>
                    ))}
                    {!hasRelatedCars &&
                      !hasRelatedNews &&
                      !hasRelatedGuides &&
                      heritage.maker && (
                        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-400">
                          今はブランド単位の導線のみ
                          詳細な紐付けは順次追加予定
                        </span>
                      )}
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          )}

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
                        {(prev as ExtendedHeritageItem).titleJa ??
                          prev.title}
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
                        {(next as ExtendedHeritageItem).titleJa ??
                          next.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
