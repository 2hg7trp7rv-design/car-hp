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

// Heritage の拡張仕様
type ExtendedHeritageItem = HeritageItem & {
  titleJa?: string | null;
  heroTitle?: string | null;
  heroImage?: string | null;
  heroImageCredit?: string | null;
  heroCaption?: string | null;
  periodLabel?: string | null;
  eraStartYear?: number | null;
  eraEndYear?: number | null;
  eraRange?: string | null;
  highlightQuote?: string | null;
  keyModels?: string[] | null;
  relatedCarSlugs?: string[] | null;
  relatedNewsIds?: string[] | null;
  relatedGuideSlugs?: string[] | null;
  readingTimeMinutes?: number | null;
  series?: string | null;
  seriesTitle?: string | null;
  sections?: {
    id: string;
    title?: string | null;
    summary?: string | null;
  }[] | null;
};

// ---- 日付まわり ----

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(iso?: string | null): string | null {
  const d = parseDate(iso);
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
  items: HeritageItem[],
  currentSlug: string,
): { prev: HeritageItem | null; next: HeritageItem | null } {
  const index = items.findIndex((item) => item.slug === currentSlug);
  if (index === -1) {
    return { prev: null, next: null };
  }

  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;

  return { prev, next };
}

// ---- 簡易ハイライト用正規表現 ----

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createHighlightRegex(keywords: string[]): RegExp | null {
  const cleaned = keywords
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  if (cleaned.length === 0) return null;

  const pattern = cleaned.map(escapeRegExp).join("|");
  return new RegExp(`(${pattern})`, "gi");
}

/**
 * 車名 (keyModels) とキーワード (highlights) を 1 本の正規表現で走査し、
 * - 車名       → 赤文字＋フォント大きめ
 * - キーワード → 波線アンダーライン（heritage-highlight-wave）
 * で装飾する。
 */
function highlightRich(
  text: string,
  regex: RegExp | null,
  carKeywordSet: Set<string>,
  keywordSet: Set<string>,
): (string | JSX.Element)[] {
  if (!regex) return [text];

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const source = text;
  const r = new RegExp(regex.source, regex.flags);

  while ((match = r.exec(source)) !== null) {
    const start = match.index;
    const end = r.lastIndex;

    if (start > lastIndex) {
      parts.push(source.slice(lastIndex, start));
    }

    const matchedText = match[0];
    const normalized = matchedText.toLowerCase();

    let spanClassName = "";

    if (carKeywordSet.has(normalized)) {
      // 車種名: 赤＋1.4倍くらい
      spanClassName =
        "text-rose-500 font-semibold text-[1.4em] leading-tight";
    } else if (keywordSet.has(normalized)) {
      // 重要キーワード: 波線アンダーライン（CSS は globals.css で定義）
      spanClassName = "heritage-highlight-wave";
    } else {
      // 念のためのフォールバック（通常ハイライト）
      spanClassName = "bg-rose-100 px-0.5 text-rose-900";
    }

    parts.push(
      <span key={`${start}-${end}`} className={spanClassName}>
        {matchedText}
      </span>,
    );

    lastIndex = end;
  }

  if (lastIndex < source.length) {
    parts.push(source.slice(lastIndex));
  }

  return parts;
}

// 旧 highlightInline は使わなくなったが、
// 必要なら他のバリアントで再利用できるように残しておく。
function highlightInline(
  text: string,
  regex: RegExp | null,
  variant: "default" | "strong" = "default",
): (string | JSX.Element)[] {
  if (!regex) return [text];

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const source = text;
  const r = new RegExp(regex.source, regex.flags);

  while ((match = r.exec(source)) !== null) {
    const start = match.index;
    const end = r.lastIndex;

    if (start > lastIndex) {
      parts.push(source.slice(lastIndex, start));
    }

    const matchedText = match[0];

    const spanClassName =
      variant === "strong"
        ? "text-rose-500 font-semibold text-[1.4em]"
        : "bg-rose-100 px-0.5 text-rose-900";

    parts.push(
      <span key={`${start}-${end}`} className={spanClassName}>
        {matchedText}
      </span>,
    );

    lastIndex = end;
  }

  if (lastIndex < source.length) {
    parts.push(source.slice(lastIndex));
  }

  return parts;
}

// HeritageItem に series / seriesTitle があるケースだけを安全に扱うための type guard
type HeritageItemWithSeries = ExtendedHeritageItem & {
  series?: string | null;
  seriesTitle?: string | null;
};

function hasSeries(
  heritage: ExtendedHeritageItem,
): heritage is HeritageItemWithSeries {
  const s = heritage.series;
  const st = heritage.seriesTitle;
  return (
    (typeof s === "string" && s.length > 0) ||
    (typeof st === "string" && st.length > 0)
  );
}

// ---- 読了時間のざっくり推定 ----

function estimateReadingTimeMinutes(body: string): number {
  const plain = body.replace(/\s+/g, "");
  const length = plain.length;
  if (length === 0) return 0;
  const minutes = Math.round(length / 550);
  return minutes <= 0 ? 1 : minutes;
}

// 本文セクション用
type BodySection = {
  title?: string;
  level: "heading" | "subheading" | null;
  lines: string[];
};

const SPEC_HEADING_PREFIX = "__SPEC_HEADING__";

// ---- メタデータ生成 ----

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const heritage = (await getHeritageBySlug(
    params.slug,
  )) as ExtendedHeritageItem | null;

  if (!heritage) {
    return {
      title: "HERITAGEが見つかりません | CAR BOUTIQUE",
      description:
        "指定されたHERITAGEコンテンツが見つかりませんでした。",
    };
  }

  const title =
    heritage.title ??
    heritage.titleJa ??
    `${heritage.maker ?? ""} HERITAGE`.trim();

  const description =
    heritage.summary ??
    heritage.lead ??
    "CAR BOUTIQUEによるブランド/時代のストーリーと代表車をまとめたHERITAGEコンテンツ。";

  const images: string[] = [];
  if ((heritage as any).ogImageUrl) {
    images.push((heritage as any).ogImageUrl as string);
  } else if (heritage.heroImage) {
    images.push(heritage.heroImage);
  }

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      images,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

// ---- ページ本体 ----

export default async function HeritageDetailPage({
  params,
}: PageProps) {
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

  const moreFromMaker = sameMaker.filter(
    (item) => item.slug !== heritage.slug,
  );
  const moreHeritageBase =
    moreFromMaker.length > 0
      ? moreFromMaker
      : all.filter((item) => item.slug !== heritage.slug);
  const moreHeritage = moreHeritageBase.slice(0, 3);

  const dateLabel =
    formatDateLabel(heritage.publishedAt) ??
    formatDateLabel(heritage.updatedAt);
  const tags = heritage.tags ?? [];
  const title = heritage.title ?? heritage.titleJa ?? heritage.slug;

  const bodyText = (() => {
    const candidates = [
      heritage.body,
      (heritage as any).content,
      (heritage as any).fullText,
      heritage.summary,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim().length > 0) {
        return c.trim();
      }
    }
    return "";
  })();
  const hasBody = bodyText.length > 0;

  const formattedBodyText = hasBody
    ? bodyText.replace(/。/g, "。\n")
    : "";

  // 車種名ハイライト用キーワード
  const carKeywords: string[] = [];
  if (heritage.keyModels && heritage.keyModels.length > 0) {
    carKeywords.push(...heritage.keyModels);
  }
  if (heritage.relatedCarSlugs && heritage.relatedCarSlugs.length > 0) {
    carKeywords.push(...heritage.relatedCarSlugs);
  }
  const relatedCarIds =
    ((heritage as any).relatedCarIds as string[] | undefined) ??
    [];
  if (relatedCarIds.length > 0) {
    carKeywords.push(...relatedCarIds);
  }

  // 重要キーワード（波線アンダーライン用）
  const highlightKeywords: string[] =
    heritage.highlights && heritage.highlights.length > 0
      ? heritage.highlights
      : [];

  // 正規化済みセット（小文字で比較）
  const carKeywordSet = new Set(
    carKeywords.map((k) => k.toLowerCase().trim()),
  );
  const keywordSet = new Set(
    highlightKeywords.map((k) => k.toLowerCase().trim()),
  );

  // 車名＋キーワードをまとめたハイライト用正規表現
  const combinedKeywords = Array.from(
    new Set([...carKeywords, ...highlightKeywords]),
  );
  const combinedHighlightRegex =
    createHighlightRegex(combinedKeywords);

  const readingTimeMinutes =
    heritage.readingTimeMinutes ??
    (hasBody ? estimateReadingTimeMinutes(bodyText) : 0);

  const hasRelatedCars =
    Array.isArray(heritage.relatedCarSlugs) &&
    heritage.relatedCarSlugs.length > 0;
  const hasRelatedNews =
    Array.isArray(heritage.relatedNewsIds) &&
    heritage.relatedNewsIds.length > 0;
  const hasRelatedGuides =
    Array.isArray(heritage.relatedGuideSlugs) &&
    heritage.relatedGuideSlugs.length > 0;

  // 本文をセクション単位に分解（【…】/■… を見出し扱い）
  const rawSections: BodySection[] = [];
  if (formattedBodyText) {
    const lines = formattedBodyText
      .split(/\r?\n/)
      .map((line) => line.trim());

    let current: BodySection | null = null;

    const pushCurrent = () => {
      if (
        current &&
        (current.title ||
          current.lines.some((l) => l && l.length > 0))
      ) {
        rawSections.push(current);
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (current && current.lines.length > 0) {
          current.lines.push("");
        }
        continue;
      }

      const headingMatch = line.match(/^【(.+?)】$/);
      if (headingMatch) {
        pushCurrent();
        current = {
          title: headingMatch[1],
          level: "heading",
          lines: [],
        };
        continue;
      }

      if (line.startsWith("■")) {
        pushCurrent();
        current = {
          title: line.replace(/^■\s*/, ""),
          level: "subheading",
          lines: [],
        };
        continue;
      }

      if (!current) {
        current = { title: undefined, level: null, lines: [] };
      }
      current.lines.push(line);
    }

    pushCurrent();
  }

  // 「○○主なスペック…」セクションは直前のカードに統合
  const bodySections: BodySection[] = [];
  for (const section of rawSections) {
    if (
      section.title &&
      section.title.includes("主なスペック") &&
      bodySections.length > 0
    ) {
      const prev = bodySections[bodySections.length - 1];
      if (prev.lines.length > 0) {
        prev.lines.push("");
      }
      prev.lines.push(`${SPEC_HEADING_PREFIX}${section.title}`);
      for (const line of section.lines) {
        prev.lines.push(line);
      }
    } else {
      bodySections.push(section);
    }
  }

  // sections 配列からセクションを生成（Ferrari など JSON 主体）
  const sectionsFromData: BodySection[] =
    Array.isArray(heritage.sections) && heritage.sections.length > 0
      ? heritage.sections.map((sec) => {
          const raw =
            typeof sec.summary === "string" ? sec.summary : "";
          const lines = raw
            ? raw
                .replace(/。/g, "。\n")
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter((l) => l.length > 0)
            : [];
          return {
            title: sec.title ?? undefined,
            level: "heading",
            lines,
          };
        })
      : [];

  // sections があればそちらを優先して使う
  const contentSections =
    sectionsFromData.length > 0 ? sectionsFromData : bodySections;
  const hasStructuredContent = contentSections.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーローセクション（ここは背景が濃いので白字のまま） */}
      <section className="relative border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.1),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(30,64,175,0.3),_transparent_60%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-10 pt-20 md:px-6 lg:px-8 lg:pt-24">
          <Reveal className="flex-1">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                <span>CAR BOUTIQUE HERITAGE</span>
              </div>

              <div className="space-y-3">
                {heritage.maker && (
                  <p className="text-xs tracking-[0.3em] text-slate-300">
                    {heritage.maker}
                  </p>
                )}
                <h1 className="font-serif text-3xl leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
                  {highlightRich(
                    title,
                    combinedHighlightRegex,
                    carKeywordSet,
                    keywordSet,
                  )}
                </h1>
                {heritage.periodLabel && (
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">
                    {heritage.periodLabel}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
                  {dateLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2.5 py-0.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{dateLabel}</span>
                    </span>
                  )}
                  {readingTimeMinutes > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2.5 py-0.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>READ {readingTimeMinutes} min</span>
                    </span>
                  )}
                  {heritage.kind && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{heritage.kind}</span>
                    </span>
                  )}
                </div>

                {heritage.summary && (
                  <p className="max-w-xl text-[15px] leading-relaxed text-slate-100">
                    {heritage.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-200">
                  {hasSeries(heritage) && (
                    <span className="rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-200">
                      {heritage.seriesTitle ?? heritage.series}
                    </span>
                  )}
                  {heritage.keyModels?.map((model) => (
                    <span
                      key={model}
                      className="rounded-full border border-slate-700/70 bg-slate-900/70 px-2.5 py-0.5 text-[11px] text-slate-50"
                    >
                      {model}
                    </span>
                  ))}
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/heritage?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-950/80 px-2.5 py-0.5 text-[11px] text-slate-100 transition hover:border-rose-400/80 hover:bg-slate-900 hover:text-rose-50"
                    >
                      <span className="h-1 w-1 rounded-full bg-rose-400" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文＋サイドカラム（ここからはカードが明るいので文字色を黒系に統一） */}
      <section className="border-t border-slate-800/60 bg-gradient-to-b from-slate-950 to-slate-900 py-10 md:py-14">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:px-6 lg:px-8">
          {/* 本文 */}
          <Reveal className="w-full md:w-[64%]" forceVisible>
            {hasBody || hasStructuredContent ? (
              <div className="space-y-6">
                {hasStructuredContent ? (
                  contentSections.map((section, sectionIndex) => (
                    <GlassCard
                      key={sectionIndex}
                      className="border border-white/40 bg-white/90 p-5 text-slate-900 sm:p-6 lg:p-7"
                    >
                      {section.title && (
                        <h2
                          className={`mb-4 font-serif ${
                            section.level === "heading"
                              ? "text-2xl sm:text-3xl"
                              : "text-xl sm:text-2xl"
                          }`}
                        >
                          {highlightRich(
                            section.title,
                            combinedHighlightRegex,
                            carKeywordSet,
                            keywordSet,
                          )}
                        </h2>
                      )}
                      {section.lines.length > 0 && (
                        <div className="space-y-2">
                          {(() => {
                            const blocks: JSX.Element[] = [];
                            const lines = section.lines;
                            for (
                              let i = 0;
                              i < lines.length;
                              i++
                            ) {
                              const line = lines[i];

                              if (!line) {
                                blocks.push(
                                  <div
                                    key={`spacer-${i}`}
                                    className="h-2"
                                  />,
                                );
                                continue;
                              }

                              // スペック枠検出
                              if (
                                line.startsWith(
                                  SPEC_HEADING_PREFIX,
                                )
                              ) {
                                const label = line.slice(
                                  SPEC_HEADING_PREFIX.length,
                                );
                                const specs: string[] = [];

                                let j = i + 1;
                                for (; j < lines.length; j++) {
                                  const nextLine = lines[j];
                                  if (
                                    nextLine &&
                                    nextLine.startsWith("・")
                                  ) {
                                    specs.push(nextLine);
                                  } else if (
                                    nextLine &&
                                    nextLine.length === 0
                                  ) {
                                    continue;
                                  } else {
                                    break;
                                  }
                                }
                                i = j - 1;

                                blocks.push(
                                  <div
                                    key={`spec-${i}`}
                                    className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[13px] sm:text-sm"
                                  >
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                                      SPEC
                                    </p>
                                    <p className="mt-1 text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                                      {highlightRich(
                                        label,
                                        combinedHighlightRegex,
                                        carKeywordSet,
                                        keywordSet,
                                      )}
                                    </p>
                                    {specs.length > 0 && (
                                      <ul className="mt-2 space-y-1">
                                        {specs.map(
                                          (specLine, idx) => {
                                            const text =
                                              specLine.replace(
                                                /^・\s*/,
                                                "",
                                              );
                                            return (
                                              <li
                                                key={`spec-line-${i}-${idx}`}
                                                className="flex gap-1"
                                              >
                                                <span className="mt-1 block h-[3px] w-[3px] rounded-full bg-slate-400" />
                                                <span className="text-[13px] leading-relaxed text-slate-900 sm:text-[14px]">
                                                  {highlightRich(
                                                    text,
                                                    combinedHighlightRegex,
                                                    carKeywordSet,
                                                    keywordSet,
                                                  )}
                                                </span>
                                              </li>
                                            );
                                          },
                                        )}
                                      </ul>
                                    )}
                                  </div>,
                                );

                                continue;
                              }

                              // 通常の本文段落
                              blocks.push(
                                <p
                                  key={`p-${i}`}
                                  className="whitespace-pre-line text-[15px] leading-relaxed text-slate-900 sm:text-[18px]"
                                >
                                  {highlightRich(
                                    line,
                                    combinedHighlightRegex,
                                    carKeywordSet,
                                    keywordSet,
                                  )}
                                </p>,
                              );
                            }
                            return blocks;
                          })()}
                        </div>
                      )}
                    </GlassCard>
                  ))
                ) : (
                  <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900 sm:p-6 lg:p-7">
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-900 sm:text-[18px]">
                      {highlightRich(
                        formattedBodyText,
                        combinedHighlightRegex,
                        carKeywordSet,
                        keywordSet,
                      )}
                    </p>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900 sm:p-6 lg:p-7">
                <p className="text-[15px] leading-relaxed text-slate-900 sm:text-[18px]">
                  このHERITAGEの本文は現在準備中です。
                  ブランドや代表モデルの詳しいストーリーは、順次追加していきます。
                </p>
              </GlassCard>
            )}
          </Reveal>

          {/* サイドカラム */}
          <Reveal className="w-full md:w-[36%]" forceVisible>
            <div className="flex flex-col gap-6">
              {/* 代表モデル */}
              {(heritage.keyModels?.length ?? 0) > 0 && (
                <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                  <h2 className="font-serif text-sm uppercase tracking-[0.25em]">
                    KEY MODELS
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {heritage.keyModels?.map((model) => (
                      <span
                        key={model}
                        className="rounded-full border border-slate-300/80 bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-900"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 関連コンテンツ */}
              {(hasRelatedCars || hasRelatedNews || hasRelatedGuides) && (
                <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                  <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-900">
                    RELATED CONTENTS
                  </h2>

                  <div className="mt-3 space-y-2 text-[12px]">
                    {hasRelatedCars && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-slate-600">
                          CARS
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {heritage.relatedCarSlugs?.map((slug) => (
                            <Link
                              key={slug}
                              href={`/cars/${encodeURIComponent(
                                slug,
                              )}`}
                              className="rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[11px] text-slate-50 underline-offset-2 hover:bg-slate-800 hover:text-rose-100 hover:underline"
                            >
                              {slug}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasRelatedNews && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-slate-600">
                          NEWS
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {heritage.relatedNewsIds?.map((id) => (
                            <Link
                              key={id}
                              href={`/news/${encodeURIComponent(
                                id,
                              )}`}
                              className="rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[11px] text-slate-50 underline-offset-2 hover:bg-slate-800 hover:text-rose-100 hover:underline"
                            >
                              関連NEWS:id:{id}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasRelatedGuides && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-slate-600">
                          GUIDES
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {heritage.relatedGuideSlugs?.map((slug) => (
                            <Link
                              key={slug}
                              href={`/guide/${encodeURIComponent(
                                slug,
                              )}`}
                              className="rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[11px] text-slate-50 underline-offset-2 hover:bg-slate-800 hover:text-rose-100 hover:underline"
                            >
                              {slug}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* 一覧への戻り＋前後ナビ */}
              <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                <div className="flex flex-col gap-3">
                  <div>
                    <Link
                      href="/heritage"
                      className="inline-flex items-center gap-1 text-[12px] text-slate-900 underline-offset-4 hover:text-rose-700 hover:underline"
                    >
                      <span className="text-[11px] text-slate-700">
                        ←
                      </span>
                      HERITAGE一覧に戻る
                    </Link>
                  </div>

                  {(prev || next) && (
                    <div className="flex flex-col gap-2 pt-1 text-xs text-slate-900 md:flex-row md:justify-between">
                      {prev ? (
                        <Link
                          href={`/heritage/${encodeURIComponent(
                            prev.slug,
                          )}`}
                          className="inline-flex max-w-xs flex-col gap-0.5 rounded-xl border border-slate-300/80 bg-slate-50 px-3 py-2 hover:border-rose-400/70 hover:bg-rose-50"
                        >
                          <span className="text-[10px] text-slate-500">
                            PREVIOUS
                          </span>
                          <span className="truncate text-[12px] text-slate-900">
                            {(prev as any).titleJa ?? prev.title}
                          </span>
                        </Link>
                      ) : (
                        <span />
                      )}

                      {next ? (
                        <Link
                          href={`/heritage/${encodeURIComponent(
                            next.slug,
                          )}`}
                          className="inline-flex max-w-xs flex-col gap-0.5 rounded-xl border border-slate-300/80 bg-slate-50 px-3 py-2 hover:border-rose-400/70 hover:bg-rose-50"
                        >
                          <span className="text-[10px] text-slate-500">
                            NEXT
                          </span>
                          <span className="truncate text-[12px] text-slate-900">
                            {(next as any).titleJa ?? next.title}
                          </span>
                        </Link>
                      ) : (
                        <span />
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 下部「MORE HERITAGE」セクション */}
      {moreHeritage.length > 0 && (
        <section className="border-t border-slate-800/70 bg-slate-950 py-10 md:py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <Reveal className="max-w-xl">
              <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-200">
                MORE HERITAGE
              </h2>
            </Reveal>

            <Reveal className="mt-5 grid gap-4 md:grid-cols-3">
              {moreHeritage.map((item) => {
                const itemDateLabel =
                  formatDateLabel(item.publishedAt) ??
                  formatDateLabel(item.updatedAt);
                const itemTitle =
                  (item as any).titleJa ?? item.title ?? item.slug;
                const itemMaker = item.maker ?? "";
                const itemTags = item.tags ?? [];

                return (
                  <Link
                    key={item.slug}
                    href={`/heritage/${encodeURIComponent(
                      item.slug,
                    )}`}
                    className="group h-full"
                  >
                    <GlassCard className="flex h-full flex-col border border-white/40 bg-white/90 p-4 text-slate-900 transition group-hover:border-rose-400/70 group-hover:bg-rose-50">
                      <p className="text-[11px] tracking-[0.26em] text-slate-500">
                        {itemMaker || "HERITAGE"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-sm text-slate-900">
                        {itemTitle}
                      </h3>
                      {itemDateLabel && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          {itemDateLabel}
                        </p>
                      )}
                      {itemTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {itemTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-300/80 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </Link>
                );
              })}
            </Reveal>

            <Reveal className="mt-6">
              <div className="flex justify-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-500 bg-slate-950/80 text-[11px] text-slate-50 hover:border-rose-400 hover:bg-slate-900"
                >
                  <Link href="/heritage">HERITAGE一覧をもっと見る</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
