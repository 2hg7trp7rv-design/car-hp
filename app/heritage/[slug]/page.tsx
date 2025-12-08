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

// --- 本文パース ---------------------------------------------------------

type ChapterBlock = {
  id: string;
  index: number;
  title: string;
  paragraphs: string[];
};

type ParsedBody = {
  introParagraphs: string[];
  chapters: ChapterBlock[];
};

function toParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length > 0) {
      paragraphs.push(buffer.join(" "));
      buffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    buffer.push(line);
  }
  flush();
  return paragraphs;
}

/**
 * heritage.body を
 * - 冒頭のイントロ
 * - 「■」から始まる行ごとのチャプター
 * に分解する。
 */
function parseHeritageBody(body?: string | null): ParsedBody {
  if (!body) {
    return { introParagraphs: [], chapters: [] };
  }

  const lines = body.split(/\r?\n/);
  const introLines: string[] = [];

  const chapters: ChapterBlock[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];
  let chapterStarted = false;

  const startNewChapter = () => {
    if (currentTitle !== null) {
      const idx = chapters.length + 1;
      chapters.push({
        id: `chapter-${idx}`,
        index: idx,
        title: currentTitle,
        paragraphs: toParagraphs(currentLines),
      });
    }
    currentLines = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/u, "");
    const trimmed = line.trim();

    if (/^■\s*/.test(trimmed)) {
      // 新チャプター開始
      startNewChapter();
      currentTitle = trimmed.replace(/^■\s*/, "");
      chapterStarted = true;
      continue;
    }

    if (!chapterStarted) {
      introLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  startNewChapter();

  return {
    introParagraphs: toParagraphs(introLines),
    chapters,
  };
}

// --- キーワード強調 -----------------------------------------------------

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * heritage から、デフォルトの強調キーワード候補をざっくり抽出。
 * - タイトルや modelName に含まれる GT-R / M3 / M5 など
 * - 足りない場合は JSON 側で highlightKeywords を持たせて補う想定
 */
function getDefaultHighlightKeywords(heritage: HeritageItem): string[] {
  const base =
    (heritage.titleJa ?? "") +
    " " +
    (heritage.title ?? "") +
    " " +
    (heritage.modelName ?? "");
  const list: string[] = [];

  if (base.includes("GT-R")) list.push("GT-R");
  if (base.includes("M3")) list.push("M3");
  if (base.includes("M5")) list.push("M5");

  return Array.from(new Set(list));
}

/**
 * 指定されたキーワードを本文中で強調表示する。
 * 例: ["GT-R", "M3"] を渡すと、その文字列だけ赤系でハイライト。
 */
function renderEmphasizedText(
  text: string,
  keywords: string[],
) {
  const valid = keywords.filter((k) => k && k.length > 0);
  if (valid.length === 0) {
    return text;
  }

  const pattern = new RegExp(
    `(${valid.map(escapeRegExp).join("|")})`,
    "g",
  );
  const parts = text.split(pattern);

  return parts.map((part, idx) =>
    valid.includes(part) ? (
      <span
        key={idx}
        className="font-semibold text-rose-400"
      >
        {part}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    ),
  );
}

// --- SSG ---------------------------------------------------------------

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

// --- Page本体 ----------------------------------------------------------

export default async function HeritageDetailPage({ params }: PageProps) {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    notFound();
  }

  // 拡張メタ（JSONにあれば使う。なければ型エラーにならないように intersection で扱う）
  const heritageWithMeta = heritage as HeritageItem & {
    highlightKeywords?: string[] | null;
  };

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

  // 強調キーワード: JSONに highlightKeywords があればそれを優先し、なければ自動推定
  const highlightKeywords =
    (heritageWithMeta.highlightKeywords &&
      heritageWithMeta.highlightKeywords.length > 0
      ? heritageWithMeta.highlightKeywords
      : getDefaultHighlightKeywords(heritage)) ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-900/70 to-slate-950 text-slate-50">
      {/* ヒーロー */}
      <section className="border-b border-white/10 bg-gradient-to-b from-slate-50/80 via-slate-900/90 to-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 md:py-12">
          <Reveal>
            <nav className="flex items-center text-[11px] text-slate-300">
              <Link href="/" className="hover:text-white/90">
                HOME
              </Link>
              <span className="mx-2 text-slate-500">/</span>
              <Link
                href="/heritage"
                className="hover:text-white/90"
              >
                HERITAGE
              </Link>
              <span className="mx-2 text-slate-500">/</span>
              <span className="line-clamp-1 text-slate-400">
                DETAIL
              </span>
            </nav>
          </Reveal>

          <Reveal delay={80}>
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-px w-6 bg-emerald-300/70" />
                  BRAND HERITAGE
                </span>
                {dateLabel && (
                  <>
                    <span className="h-px w-8 bg-slate-500/60" />
                    <span className="text-[10px] tracking-[0.18em] text-slate-400">
                      UPDATED {dateLabel}
                    </span>
                  </>
                )}
              </div>

              <h1 className="max-w-3xl text-[1.75rem] font-semibold leading-snug tracking-wide text-white sm:text-[2.1rem] md:text-[2.4rem]">
                {title}
              </h1>

              {heritage.summary && (
                <p className="max-w-3xl text-[14px] leading-7 text-slate-200 sm:text-[15px] sm:leading-8">
                  {heritage.summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                {heritage.maker && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 uppercase tracking-[0.16em]">
                    {heritage.maker}
                  </span>
                )}
                {heritage.modelName && (
                  <span className="text-[11px] text-slate-300">
                    {heritage.modelName}
                  </span>
                )}
                {heritage.eraLabel && (
                  <span className="text-[11px] text-slate-400">
                    {heritage.eraLabel}
                  </span>
                )}
              </div>
            </header>
          </Reveal>
        </div>
      </section>

      {/* 本文＋前後リンク */}
      <section className="border-b border-slate-900/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 md:pb-16 md:pt-10">
          {/* イントロ（body の最初に別パートがある場合） */}
          {parsed.introParagraphs.length > 0 && (
            <Reveal>
              <div className="mb-6 max-w-3xl text-[15px] leading-8 text-slate-100 sm:text-[15px] sm:leading-8">
                {parsed.introParagraphs.map((p, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-3" : ""}>
                    {renderEmphasizedText(p, highlightKeywords)}
                  </p>
                ))}
              </div>
            </Reveal>
          )}

          {/* CHAPTER カード */}
          <div className="space-y-8">
            {parsed.chapters.map((chapter) => (
              <Reveal key={chapter.id}>
                <GlassCard className="relative overflow-hidden rounded-[32px] border border-white/18 bg-gradient-to-br from-slate-900/85 via-slate-900/95 to-slate-950/95 shadow-[0_22px_60px_rgba(15,23,42,0.8)]">
                  {/* 光のエフェクト */}
                  <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.25),_transparent_70%)] blur-3xl" />
                  <div className="pointer-events-none absolute -right-28 bottom-[-40%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(251,113,133,0.2),_transparent_75%)] blur-3xl" />

                  <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-8 md:px-10 md:py-10">
                    {/* CHAPTER ラベル */}
                    <div className="mb-4 flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.22em] text-slate-300">
                      <span className="inline-flex items-center gap-3">
                        <span className="text-[10px] text-slate-400">
                          {chapter.index.toString().padStart(2, "0")} CHAPTER
                        </span>
                        <span className="h-px w-10 bg-rose-400/80" />
                      </span>
                    </div>

                    {/* 見出し */}
                    <h2 className="text-[17px] font-semibold tracking-wide text-white sm:text-[18px] md:text-[20px]">
                      {renderEmphasizedText(
                        chapter.title,
                        highlightKeywords,
                      )}
                    </h2>

                    {/* 本文 */}
                    <div className="mt-4 space-y-3 text-[15px] leading-8 text-slate-100 sm:text-[15px] sm:leading-8">
                      {chapter.paragraphs.map((p, idx) => (
                        <p key={idx}>
                          {renderEmphasizedText(p, highlightKeywords)}
                        </p>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}

            {/* body に「■」が無くて chapters が空だった場合は、従来どおり一括表示 */}
            {parsed.chapters.length === 0 && heritage.body && (
              <Reveal>
                <GlassCard className="rounded-[32px] border border-white/18 bg-gradient-to-br from-slate-900/85 via-slate-900/95 to-slate-950/95 px-5 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.8)] sm:px-7 sm:py-8 md:px-10 md:py-10">
                  <div className="whitespace-pre-line text-[15px] leading-8 text-slate-100 sm:text-[15px] sm:leading-8">
                    {renderEmphasizedText(
                      heritage.body,
                      highlightKeywords,
                    )}
                  </div>
                </GlassCard>
              </Reveal>
            )}
          </div>

          {/* TAGS */}
          {tags.length > 0 && (
            <div className="mt-8">
              <p className="mb-2 text-[11px] font-medium tracking-[0.18em] text-slate-400">
                TAGS
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 戻る & 前後ナビ */}
          <div className="mt-10 flex flex-col gap-4 text-[12px] text-slate-200 md:flex-row md:items-start md:justify-between">
            <Link
              href="/heritage"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-500 text-[11px]">
                ←
              </span>
              HERITAGE 一覧に戻る
            </Link>

            {(prev || next) && (
              <div className="flex flex-1 flex-col gap-3 md:flex-row md:justify-end">
                {prev && (
                  <Link
                    href={`/heritage/${encodeURIComponent(prev.slug)}`}
                    className="inline-flex max-w-xs flex-1 flex-col gap-1 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-left hover:border-emerald-400/60 hover:bg-slate-900"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                      PREVIOUS
                    </span>
                    <span className="line-clamp-2 text-[13px] font-medium text-slate-50">
                      {prev.titleJa ?? prev.title}
                    </span>
                  </Link>
                )}
                {next && (
                  <Link
                    href={`/heritage/${encodeURIComponent(next.slug)}`}
                    className="inline-flex max-w-xs flex-1 flex-col gap-1 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-right hover:border-emerald-400/60 hover:bg-slate-900"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                      NEXT
                    </span>
                    <span className="line-clamp-2 text-[13px] font-medium text-slate-50">
                      {next.titleJa ?? next.title}
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
