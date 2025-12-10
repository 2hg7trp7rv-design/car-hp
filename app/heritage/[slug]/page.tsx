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
  heroTitle?: string | null; // ヒーロー用タイトル（UI向けに追加）
  heroImage?: string | null;
  heroImageCredit?: string | null;
  heroCaption?: string | null; // ヒーロー画像下に置くキャプション
  periodLabel?: string | null; // 例: "1969–1973"
  eraStartYear?: number | null;
  eraEndYear?: number | null;
  eraRange?: string | null; // "1969–1973" のようなレンジ表記
  highlightQuote?: string | null;
  keyModels?: string[] | null; // 関連する代表車種名
  relatedCarSlugs?: string[] | null; // /cars/[slug] 連携用
  relatedNewsIds?: string[] | null; // /news/[id] 連携用
  relatedGuideSlugs?: string[] | null; // /guide/[slug] 連携用
  readingTimeMinutes?: number | null; // 手動で指定する場合

  // シリーズ情報（どちらか or 両方を data 側で使う想定）
  series?: string | null; // シリーズ名そのもの
  seriesTitle?: string | null; // 表示用タイトル
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
        ? "text-rose-500 font-semibold text-[1.15em]"
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
  // 日本語: 400〜600文字/分くらいを目安
  const minutes = Math.round(length / 550);
  return minutes <= 0 ? 1 : minutes;
}

// 本文セクション用
type BodySection = {
  title?: string;
  level: "heading" | "subheading" | null;
  lines: string[];
  // 「○○主なスペック〜」みたいなセクションをマージするためのブロック
  specBlocks?: { title: string; lines: string[] }[];
};

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

  // 同一メーカー内の「続きを読む」候補（なければ全体から）
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

  // 本文は body 優先、なければ summary をそのまま使う
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

  // 「。」のあとで改行を入れる
  const formattedBodyText = hasBody
    ? bodyText.replace(/。/g, "。\n")
    : "";

  const highlightRegex = createHighlightRegex([
    heritage.maker ?? "",
    ...(heritage.keyModels ?? []),
    ...(tags ?? []),
  ]);

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
  const bodySections: BodySection[] = [];
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
        bodySections.push(current);
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

  // 「○○主なスペック〜」のセクションは直前カードにマージ
  const mergedSections: BodySection[] = [];
  for (const section of bodySections) {
    const isSpecHeading =
      section.title && section.title.includes("主なスペック");

    if (isSpecHeading && mergedSections.length > 0) {
      const prev = mergedSections[mergedSections.length - 1];
      if (!prev.specBlocks) prev.specBlocks = [];
      prev.specBlocks.push({
        title: section.title!,
        lines: section.lines,
      });
    } else {
      mergedSections.push(section);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーローセクション */}
      <section className="relative border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.1),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(30,64,175,0.3),_transparent_60%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-10 pt-20 md:flex-row md:px-6 lg:px-8 lg:pt-24">
          {/* 左:タイトルとメタ情報 */}
          <Reveal className="flex-1">
            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                <span>CAR BOUTIQUE HERITAGE</span>
              </div>

              <div className="space-y-2">
                {heritage.maker && (
                  <p className="text-xs tracking-[0.3em] text-slate-300">
                    {heritage.maker}
                  </p>
                )}
                <h1 className="font-serif text-2xl leading-tight text-slate-50 sm:text-3xl lg:text-4xl">
                  {highlightInline(title, highlightRegex)}
                </h1>
                {heritage.periodLabel && (
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">
                    {heritage.periodLabel}
                  </p>
                )}
              </div>

              <div className="space-y-3">
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
                  <p className="max-w-xl text-sm leading-relaxed text-slate-100/90">
                    {heritage.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
                  {hasSeries(heritage) && (
                    <span className="rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                      {heritage.seriesTitle ?? heritage.series}
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
                      className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-950/80 px-2.5 py-0.5 text-[11px] text-slate-200 transition hover:border-rose-400/80 hover:bg-slate-900 hover:text-rose-50"
                    >
                      <span className="h-1 w-1 rounded-full bg-rose-400" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* 右:ヒーロー画像＋リード（テキストのみ） */}
          <Reveal className="flex-1">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-[0_24px_60px_rgba(15,23,42,0.9)] sm:h-72 md:h-80">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,250,252,0.24),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.18),_transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(15,23,42,0.6)_45%,_rgba(15,23,42,0.92)_90%)] mix-blend-multiply" />

              <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300/90">
                    HERITAGE STORY
                  </p>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-100/90">
                    {highlightInline(
                      heritage.heroTitle ??
                        (heritage as any).seoTitle ??
                        heritage.subtitle ??
                        heritage.lead ??
                        "ブランドや時代の変遷を、代表的なモデルとともに辿るロングストーリー。",
                      highlightRegex,
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-[11px] text-slate-300/90 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    {heritage.eraRange && (
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-200">
                        {heritage.eraRange}
                      </p>
                    )}
                    {heritage.heroCaption && (
                      <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-300/90">
                        {highlightInline(
                          heritage.heroCaption,
                          highlightRegex,
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {heritage.heroImageCredit && (
                      <p className="text-[10px] text-slate-400">
                        PHOTO: {heritage.heroImageCredit}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文＋サイドカラム */}
      <section className="border-t border-slate-800/60 bg-gradient-to-b from-slate-950 to-slate-900 py-10 md:py-14">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:px-6 lg:px-8">
          {/* 本文 */}
          <Reveal className="w-full md:w-[64%]" forceVisible>
            {hasBody ? (
              <div className="space-y-5">
                {mergedSections.length > 0 ? (
                  mergedSections.map((section, sectionIndex) => (
                    <GlassCard
                      key={sectionIndex}
                      className="border-slate-800/70 bg-slate-900/80 p-5 sm:p-6 lg:p-7"
                    >
                      {section.title && (
                        <h2
                          className={`mb-3 font-serif text-slate-50 ${
                            section.level === "heading"
                              ? "text-lg sm:text-xl"
                              : "text-base sm:text-lg"
                          }`}
                        >
                          {section.title}
                        </h2>
                      )}
                      {section.lines.length > 0 && (
                        <div className="space-y-2">
                          {section.lines.map((line, lineIndex) =>
                            line === "" ? (
                              <div
                                key={lineIndex}
                                className="h-2"
                              />
                            ) : (
                              <p
                                key={lineIndex}
                                className="whitespace-pre-line text-[15px] leading-relaxed text-slate-100 sm:text-[18px]"
                              >
                                {highlightInline(
                                  line,
                                  highlightRegex,
                                  "strong",
                                )}
                              </p>
                            ),
                          )}
                        </div>
                      )}

                      {/* 「主なスペック〜」をマージしたブロック */}
                      {section.specBlocks?.map((spec, specIndex) => (
                        <div
                          key={specIndex}
                          className="mt-5 border-t border-slate-700/70 pt-3"
                        >
                          <h3 className="mb-2 font-serif text-base text-slate-50 sm:text-lg">
                            {spec.title}
                          </h3>
                          <div className="space-y-2">
                            {spec.lines.map((line, lineIndex) =>
                              line === "" ? (
                                <div
                                  key={lineIndex}
                                  className="h-2"
                                />
                              ) : (
                                <p
                                  key={lineIndex}
                                  className="whitespace-pre-line text-[15px] leading-relaxed text-slate-100 sm:text-[18px]"
                                >
                                  {highlightInline(
                                    line,
                                    highlightRegex,
                                    "strong",
                                  )}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                    </GlassCard>
                  ))
                ) : (
                  <GlassCard className="border-slate-800/70 bg-slate-900/80 p-5 sm:p-6 lg:p-7">
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-100 sm:text-[18px]">
                      {highlightInline(
                        formattedBodyText,
                        highlightRegex,
                        "strong",
                      )}
                    </p>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="border-slate-800/70 bg-slate-900/80 p-5 sm:p-6 lg:p-7">
                <p className="text-[15px] leading-relaxed text-slate-100 sm:text-[18px]">
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
                <GlassCard className="border-slate-800/70 bg-slate-950/85 p-5">
                  <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-300">
                    KEY MODELS
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {heritage.keyModels?.map((model) => (
                      <span
                        key={model}
                        className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-slate-100"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 関連コンテンツ */}
              {(hasRelatedCars || hasRelatedNews || hasRelatedGuides) && (
                <GlassCard className="border-slate-800/70 bg-slate-950/85 p-5">
                  <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-300">
                    RELATED CONTENTS
                  </h2>

                  <div className="mt-3 space-y-2 text-[12px]">
                    {hasRelatedCars && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          CARS
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {heritage.relatedCarSlugs?.map((slug) => (
                            <Link
                              key={slug}
                              href={`/cars/${encodeURIComponent(slug)}`}
                              className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-slate-100 underline-offset-2 hover:bg-slate-800 hover:text-rose-100 hover:underline"
                            >
                              {slug}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasRelatedNews && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          NEWS
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {heritage.relatedNewsIds?.map((id) => (
                            <Link
                              key={id}
                              href={`/news/${encodeURIComponent(id)}`}
                              className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-slate-100 underline-offset-2 hover:bg-slate-800 hover:text-rose-100 hover:underline"
                            >
                              関連NEWS:id:{id}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasRelatedGuides && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          GUIDES
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {heritage.relatedGuideSlugs?.map((slug) => (
                            <Link
                              key={slug}
                              href={`/guide/${encodeURIComponent(slug)}`}
                              className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] text-slate-100 underline-offset-2 hover:bg-slate-800 hover:text-rose-100 hover:underline"
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
              <GlassCard className="border-slate-800/70 bg-slate-950/90 p-5">
                <div className="flex flex-col gap-3">
                  <div>
                    <Link
                      href="/heritage"
                      className="inline-flex items-center gap-1 text-[12px] text-slate-100 underline-offset-4 hover:text-rose-100 hover:underline"
                    >
                      <span className="text-[11px] text-slate-400">
                        ←
                      </span>
                      HERITAGE一覧に戻る
                    </Link>
                  </div>

                  {(prev || next) && (
                    <div className="flex flex-col gap-2 pt-1 text-xs text-slate-200 md:flex-row md:justify-between">
                      {prev ? (
                        <Link
                          href={`/heritage/${encodeURIComponent(
                            prev.slug,
                          )}`}
                          className="inline-flex max-w-xs flex-col gap-0.5 rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 hover:border-rose-400/70 hover:bg-slate-900"
                        >
                          <span className="text-[10px] text-slate-400">
                            PREVIOUS
                          </span>
                          <span className="truncate text-[12px] text-slate-100">
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
                          className="inline-flex max-w-xs flex-col gap-0.5 rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 hover:border-rose-400/70 hover:bg-slate-900"
                        >
                          <span className="text-[10px] text-slate-400">
                            NEXT
                          </span>
                          <span className="truncate text-[12px] text-slate-100">
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
              <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-300">
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
                    href={`/heritage/${encodeURIComponent(item.slug)}`}
                    className="group h-full"
                  >
                    <GlassCard className="flex h-full flex-col border-slate-800/70 bg-slate-950/85 p-4 transition group-hover:border-rose-400/70 group-hover:bg-slate-900">
                      <p className="text-[11px] tracking-[0.26em] text-slate-300">
                        {itemMaker || "HERITAGE"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-sm text-slate-50">
                        {itemTitle}
                      </h3>
                      {itemDateLabel && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {itemDateLabel}
                        </p>
                      )}
                      {itemTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {itemTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-200"
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
                  className="border-slate-700 bg-slate-950/80 text-[11px] text-slate-100 hover:border-rose-400 hover:bg-slate-900"
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
