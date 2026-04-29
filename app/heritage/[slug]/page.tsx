import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { PullQuote } from "@/components/content/PullQuote";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";

import type { CarItem, HeritageItem, HeritageSection } from "@/lib/content-types";
import { getCarsBySlugs } from "@/lib/cars";
import { getGuidesBySlugs } from "@/lib/guides";
import { ENABLE_CAR_IMAGES } from "@/lib/features";
import {
  extractHeritageCarSlugs,
  extractHeritageGuideSlugs,
  getAllHeritage,
  getHeritageBySlug,
  getHeritagePreviewText,
  getNextReadHeritageV12,
} from "@/lib/heritage";
import { cn } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site";
import { resolveOgImageUrl } from "@/lib/public-assets";
import { pickEditorialImage } from "@/lib/editorial-media";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { isIndexableHeritage } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getEditorialSurfaceClass } from "@/lib/detail-theme";
import { buildEditorialPullQuote } from "@/lib/editorial-quote";
import { normalizeEditorialHeadingLabel } from "@/lib/editorial-heading";
import { resolveHeritageCardImage } from "@/lib/display-tag-media";

type PageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const all = await getAllHeritage();
  return all.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getHeritageBySlug(params.slug);
  if (!item) {
    return {
      title: "系譜",
      description: "歴史・技術・背景を深掘りする読み物。",
    };
  }

  const preview = getHeritagePreviewText(item);
  const description = preview || item.summary || "歴史・技術・背景を深掘りする読み物。";

  const titleBase = `${item.title}`;
  const canonical = `${getSiteUrl()}/heritage/${encodeURIComponent(item.slug)}`;

  const rawImage = pickHeroImage(resolveHeritageCardImage(item) ?? item.heroImage ?? null);
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

  return {
    title: titleBase,
    description,
    alternates: { canonical },
    openGraph: {
      title: titleBase,
      description,
      url: canonical,
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: titleBase,
      description,
      images: [image],
    },
    robots: isIndexableHeritage(item) ? undefined : NOINDEX_ROBOTS,
  };
}


type ContentBlock =
  | { type: "heading"; heading: { level: 3; id: string; text: string } }
  | { type: "paragraph"; text: string }
  | { type: "pullquote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "hr" };

type HeritageChapter = {
  id: string;
  title: string;
  summary?: string | null;
  carSlugs: string[];
  blocks: ContentBlock[];
};

function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function normalizeKey(t: string): string {
  return t
    .replace(/[【】]/g, "")
    .replace(/[\s\u3000]/g, "")
    .replace(/[：:]/g, "")
    .toLowerCase();
}

function stripChapterPrefix(raw: string): string {
  return String(raw ?? "")
    .trim()
    .replace(/^(序章|第[0-9０-９一二三四五六七八九十]+章)\s*[：:\-－]\s*/u, "")
    .trim();
}

function resolveChapterLineTitle(rawTitle: string, rawTail?: string): string {
  const tail = String(rawTail ?? "").trim();
  if (tail) return tail;
  const cleaned = stripChapterPrefix(rawTitle);
  return cleaned || rawTitle.trim();
}

/**
 * heritage の本文（Markdown風プレーンテキスト）を chapter 化する。
 * - 「【第1章】原点」「【序章：背景】」の両方を吸収
 * - sections 側の summary / carSlugs があれば章にマージ
 * - 本文内に平文で残る【序章】【第1章】を UI から排除
 */
function parseHeritageChapters(
  body: string | undefined,
  sections: HeritageSection[] | null | undefined,
): HeritageChapter[] {
  const text = (body ?? "").trim();
  if (!text) return [];

  const meta = (Array.isArray(sections) ? sections : []).filter(
    (s): s is HeritageSection & { title: string } =>
      typeof s?.title === "string" && s.title.trim().length > 0,
  );

  const findMetaByTitle = (title: string): HeritageSection | undefined => {
    const candidates = Array.from(
      new Set([title, stripChapterPrefix(title), resolveChapterLineTitle(title)]),
    )
      .map((t) => t.trim())
      .filter(Boolean);

    for (const candidate of candidates) {
      const key = normalizeKey(candidate);
      const exact = meta.find((s) => normalizeKey(s.title) === key);
      if (exact) return exact;
      const loose = meta.find((s) => {
        const k = normalizeKey(s.title);
        return k.includes(key) || key.includes(k);
      });
      if (loose) return loose;
    }

    return undefined;
  };

  const lines = text.split(/\r?\n/);

  const chapters: HeritageChapter[] = [];
  let current: HeritageChapter | null = null;

  let paraBuf: string[] = [];
  let listBuf: string[] = [];
  let pullQuoteBuf: string[] = [];

  const flushParagraph = (c: HeritageChapter | null) => {
    if (!c) return;
    const joined = paraBuf
      .map((l) => l.replace(/\s+$/g, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (joined) c.blocks.push({ type: "paragraph", text: joined });
    paraBuf = [];
  };

  const flushList = (c: HeritageChapter | null) => {
    if (!c) return;
    const items = listBuf.map((s) => s.trim()).filter(Boolean);
    if (items.length) c.blocks.push({ type: "list", items });
    listBuf = [];
  };

  const flushPullQuote = (c: HeritageChapter | null) => {
    if (!c) return;
    const t = pullQuoteBuf
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n")
      .trim();
    if (t) c.blocks.push({ type: "pullquote", text: t });
    pullQuoteBuf = [];
  };

  const closeCurrent = (c: HeritageChapter | null) => {
    flushParagraph(c);
    flushList(c);
    flushPullQuote(c);
    if (!c) return;
    const hasContent = c.blocks.some((b) => b.type !== "hr");
    if (hasContent) chapters.push(c);
  };

  const startChapter = (rawTitle: string, prev: HeritageChapter | null, rawTail?: string): HeritageChapter => {
    closeCurrent(prev);

    const displayTitle = resolveChapterLineTitle(rawTitle, rawTail);
    const metaMatch = findMetaByTitle(rawTitle) ?? findMetaByTitle(displayTitle);
    const id = (metaMatch?.id ? metaMatch.id : slugifyId(displayTitle)) || `section-${chapters.length + 1}`;

    return {
      id,
      title: displayTitle,
      summary: metaMatch?.summary ?? null,
      carSlugs: Array.isArray(metaMatch?.carSlugs) ? (metaMatch?.carSlugs ?? []) : [],
      blocks: [],
    };
  };

  const isListLine = (l: string) => {
    const t = l.trim();
    return /^(-\s+|\*\s+|・)/.test(t);
  };

  const stripListMarker = (l: string) => {
    const t = l.trim();
    if (t.startsWith("-")) return t.replace(/^-\s+/, "").trim();
    if (t.startsWith("*")) return t.replace(/^\*\s+/, "").trim();
    if (t.startsWith("・")) return t.replace(/^・\s*/, "").trim();
    return t;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, "");
    const trimmed = line.trim();

    const chapterWithTailMatch = trimmed.match(/^【(.+?)】\s*(.+)$/);
    if (chapterWithTailMatch) {
      const rawTitle = chapterWithTailMatch[1]?.trim();
      const rawTail = chapterWithTailMatch[2]?.trim();
      if (rawTitle) current = startChapter(rawTitle, current, rawTail);
      continue;
    }

    const chapterMatch = trimmed.match(/^【(.+?)】$/);
    if (chapterMatch) {
      const rawTitle = chapterMatch[1]?.trim();
      if (rawTitle) current = startChapter(rawTitle, current);
      continue;
    }

    if (!current) current = startChapter("本文", current);

    if (!trimmed.startsWith(">") && pullQuoteBuf.length > 0) {
      flushPullQuote(current);
    }

    if (trimmed.startsWith(">")) {
      flushParagraph(current);
      flushList(current);
      const t = trimmed.replace(/^>+\s?/, "").trim();
      if (t) pullQuoteBuf.push(t);
      continue;
    }

    if (trimmed.startsWith("__SPEC_HEADING__")) {
      flushPullQuote(current);
      flushParagraph(current);
      flushList(current);
      const t = trimmed.replace("__SPEC_HEADING__", "").trim();
      if (t) {
        current.blocks.push({
          type: "heading",
          heading: { level: 3, id: `spec-${slugifyId(t)}` || `spec-${Date.now()}`, text: t },
        });
      }
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      flushPullQuote(current);
      flushParagraph(current);
      flushList(current);
      const t = (h3[1] ?? "").trim();
      if (t) {
        current.blocks.push({
          type: "heading",
          heading: { level: 3, id: `h-${slugifyId(t)}` || `h-${Date.now()}`, text: t },
        });
      }
      continue;
    }

    if (trimmed === "---") {
      flushPullQuote(current);
      flushParagraph(current);
      flushList(current);
      current.blocks.push({ type: "hr" });
      continue;
    }

    if (!trimmed) {
      flushPullQuote(current);
      flushParagraph(current);
      flushList(current);
      continue;
    }

    if (isListLine(trimmed)) {
      flushPullQuote(current);
      flushParagraph(current);
      listBuf.push(stripListMarker(trimmed));
      continue;
    }

    flushPullQuote(current);
    flushList(current);
    paraBuf.push(trimmed);
  }

  closeCurrent(current);

  return chapters;
}

function pickCarImage(car: CarItem | undefined | null): string | null {
  if (!car) return null;
  return car.heroImage || car.mainImage || null;
}

// Related cards (次に読む / RECOMMEND) で使う安全なヒーロー画像選択
function pickHeroImage(src: string | null | undefined): string {
  return pickEditorialImage(src, "heritage", "desktop");
}

function chapterNo(idx: number) {
  return String(idx + 1).padStart(2, "0");
}

/**
 * 読みやすさ向上: 日本語の句点「。」で強制改行。
 * - 要望: Heritage本文が読みにくい → 「。」ごとに改行
 */
function formatSentenceBreaks(text: string): string {
  const src = (text ?? "").toString();
  if (!src) return "";
  // Add gentle sentence breaks for readability (keeps Japanese "。" cadence).
  return src.replace(/。/g, "。\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildHeritageSummaryPoints(item: HeritageItem, chapters: HeritageChapter[]): string[] {
  const fromHighlights = Array.isArray(item.highlights)
    ? item.highlights.map((s: string | null | undefined) => String(s ?? "").trim()).filter(Boolean)
    : [];
  if (fromHighlights.length > 0) return fromHighlights.slice(0, 3);

  const fromSummary = String(item.summary ?? "")
    .split(/。|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((s) => (s.endsWith("。") ? s : `${s}。`));
  if (fromSummary.length > 0) return fromSummary;

  return chapters
    .slice(0, 3)
    .map((c) => String(c.summary ?? c.title ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

type TurningPoint = { label: string; title: string; description?: string | null };

function buildHeritageTurningPoints(item: HeritageItem, chapters: HeritageChapter[]): TurningPoint[] {
  const fromSections = (item.sections ?? []).reduce<TurningPoint[]>((acc, section, index) => {
    const title = String(section.title ?? "").trim();
    if (!title) return acc;
    acc.push({
      label: `転換点 ${String(index + 1).padStart(2, "0")}`,
      title,
      description: String(section.summary ?? "").trim() || null,
    });
    return acc;
  }, []).slice(0, 3);

  if (fromSections.length > 0) return fromSections;

  return chapters.slice(0, 3).map((chapter, index) => ({
    label: `転換点 ${String(index + 1).padStart(2, "0")}`,
    title: normalizeEditorialHeadingLabel(chapter.title),
    description: chapter.summary ?? null,
  }));
}

type TimelineEvent = { year: string; text: string };

function buildHeritageTimeline(item: HeritageItem): TimelineEvent[] {
  const lines = String(item.body ?? "").split(/\r?\n/);
  const events: TimelineEvent[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const match = line.match(/^・\s*(19\d{2}|20\d{2})(?:年)?[:：-]?\s*(.+)$/);
    if (!match) continue;
    const year = match[1];
    const text = match[2]?.trim();
    if (!year || !text) continue;
    events.push({ year, text });
    if (events.length >= 5) break;
  }
  if (events.length > 0) return events;

  const era = String(item.eraLabel ?? item.years ?? "").trim();
  if (era) return [{ year: era, text: String(item.summary ?? item.title).trim() }];

  return [];
}

export default async function HeritageDetailPage({ params }: PageProps) {
  const item = await getHeritageBySlug(params.slug);
  if (!item) notFound();
  const linkIndex = await getInternalLinkIndex();
  const chapters = parseHeritageChapters(item.body, item.sections);
  const toc = chapters.map((c) => ({ id: c.id, title: normalizeEditorialHeadingLabel(c.title) }));

  const carSlugs = extractHeritageCarSlugs(item);
  const relatedCars = carSlugs.length ? await getCarsBySlugs(carSlugs) : [];

  const guideSlugs = extractHeritageGuideSlugs(item);
  const relatedGuides = guideSlugs.length ? await getGuidesBySlugs(guideSlugs) : [];

  const relatedHeritage = await getNextReadHeritageV12(item, 2);
  const relatedGuideLead = relatedGuides.slice(0, 2);
  const relatedGuideRows = relatedGuides.slice(2, 4);
  const summaryPoints = buildHeritageSummaryPoints(item, chapters);
  const turningPoints = buildHeritageTurningPoints(item, chapters);
  const timelineEvents = buildHeritageTimeline(item);
  const introParagraph =
    chapters
      .flatMap((chapter) => chapter.blocks)
      .find(
        (block): block is Extract<ContentBlock, { type: "paragraph" }> => block.type === "paragraph",
      )?.text ?? null;
  const introQuoteText = buildEditorialPullQuote([
    item.subtitle,
    item.lead,
    item.summary,
    summaryPoints[0],
    turningPoints[0]?.description,
    turningPoints[0]?.title,
    introParagraph,
  ]);

  const breadcrumbData = [
    { label: "ホーム", href: "/" },
    { label: "系譜", href: "/heritage" },
    { label: item.title },
  ];

  const metaChips = [
    item.kind === "BRAND" ? "ブランド" : item.kind === "CAR" ? "モデル" : item.kind === "ERA" ? "時代" : "",
    (item.eraLabel ?? "").trim(),
    (item.years ?? "").trim(),
    item.readingTimeMinutes ? `${item.readingTimeMinutes}分` : "",
  ].filter(Boolean);

  const leadText = (item.lead ?? item.summary ?? "").trim() || null;

  return (
    <main className="detail-page">
      <DetailFixedBackground seed={params.slug} imageSrc={(resolveHeritageCardImage(item) ?? item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null} />

      <div id="top" />

      <div className="detail-shell pb-24 pt-24 sm:pt-28">
        <Breadcrumb items={breadcrumbData} tone="paper" />

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
          <div className="order-1">
            <div className="detail-photo-frame relative aspect-[16/10] w-full">
              {pickHeroImage(resolveHeritageCardImage(item) ?? item.heroImage ?? null) ? (
                <Image
                  src={pickHeroImage(resolveHeritageCardImage(item) ?? item.heroImage ?? null)!}
                  alt={item.heroTitle ?? item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover saturate-[0.92]"
                  priority
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(160deg,rgba(229,235,239,0.94),rgba(246,242,235,1))] p-7">
                  <div>
                    <p className="detail-kicker">系譜</p>
                    <p className="mt-3 max-w-[16ch] text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
                      {item.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {item.heroCaption ? <p className="detail-photo-caption">{item.heroCaption}</p> : null}
          </div>

          <div className="order-2">
            <div className="flex flex-wrap items-center gap-2">
              {metaChips.map((chip) => (
                <span key={chip} className="detail-chip detail-chip-accent">
                  {chip}
                </span>
              ))}
            </div>

            <h1 className="page-title mt-5 max-w-[12ch]">{item.heroTitle ?? item.title}</h1>

            {item.subtitle ? (
              <p className="mt-4 text-[14px] leading-relaxed tracking-[0.08em] text-[var(--text-tertiary)]">
                {item.subtitle}
              </p>
            ) : null}

            {leadText ? <p className="detail-lead mt-6 max-w-[40rem]">{leadText}</p> : null}

            <div className="detail-inline-meta mt-6">
              {item.brandName ? (
                <span>
                  <strong>ブランド</strong> {item.brandName}
                </span>
              ) : null}
              {item.maker ? (
                <span>
                  <strong>メーカー</strong> {item.maker}
                </span>
              ) : null}
              {item.modelName ? (
                <span>
                  <strong>モデル</strong> {item.modelName}
                </span>
              ) : null}
              {item.generationCode ? (
                <span>
                  <strong>型式</strong> {item.generationCode}
                </span>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/heritage" className="detail-button-secondary">
                系譜一覧へ
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {summaryPoints.length > 0 ? (
          <section className="mt-8">
            <section className="detail-card-wash p-6 sm:p-8">
              <p className="detail-kicker">要点</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                押さえておきたい点
              </h2>
              <ul className="mt-5 space-y-4">
                {summaryPoints.map((point, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-[0.72em] h-[6px] w-[6px] rounded-full bg-[var(--accent-base)]" />
                    <span className="flex-1 cb-stage-body cb-stage-body-strong">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          </section>
        ) : null}

        {(turningPoints.length > 0 || timelineEvents.length > 0) ? (
          <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_360px]">
            {turningPoints.length > 0 ? (
              <div className="detail-card p-6 sm:p-7">
                <p className="detail-kicker">転換点</p>
                <div className="mt-4 space-y-4">
                  {turningPoints.map((point, idx) => (
                    <div key={`${point.label}-${idx}`} className="rounded-[22px] border border-[rgba(14,12,10,0.08)] bg-[rgba(251,248,243,0.82)] p-5">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">{point.label}</p>
                      <h2 className="mt-2 text-[20px] font-semibold leading-[1.45] text-[var(--text-primary)]">{point.title}</h2>
                      {point.description ? (
                        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{point.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div />
            )}

            {timelineEvents.length > 0 ? (
              <div className="detail-card-fog p-6 sm:p-7">
                <p className="detail-kicker">年表</p>
                <div className="mt-4 space-y-4">
                  {timelineEvents.map((event, idx) => (
                    <div key={`${event.year}-${idx}`} className="relative pl-5">
                      <span className="absolute left-[4px] top-0 h-full w-px bg-[rgba(14,12,10,0.12)]" aria-hidden />
                      <span className="absolute left-0 top-[0.45em] h-[9px] w-[9px] rounded-full border border-[rgba(14,12,10,0.12)] bg-[var(--accent-base)]" aria-hidden />
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--text-primary)]">{event.year}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">{event.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {introQuoteText ? (
          <section className="mt-8">
            <PullQuote text={introQuoteText} />
          </section>
        ) : null}

        {toc.length > 1 ? (
          <section className="mt-10">
            <InThisStoryToc items={toc} sticky ariaLabel="ページ内目次" />
          </section>
        ) : null}

        <div className="mt-12 space-y-8">
          {chapters.map((c, idx) => (
            <section
              key={c.id}
              id={c.id}
              className={`${getEditorialSurfaceClass(idx)} scroll-mt-28 overflow-hidden`}
            >
              <div className="cb-stage-chapter">
                <p className="cb-stage-chapterLabel"><span className="cb-stage-chapterNumber">{chapterNo(idx)}</span>.</p>
                <h2 className="cb-stage-chapterTitle">{normalizeEditorialHeadingLabel(c.title)}</h2>

                {c.summary ? (
                  <p className="cb-stage-chapterSummary">{c.summary}</p>
                ) : null}
              </div>

              <div className="mx-6 h-px bg-[rgba(14,12,10,0.08)]" />

              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <div className="space-y-8 cb-prose">
                  {c.blocks.map((b, bIdx) => {
                    if (b.type === "paragraph") {
                      return (
                        <TextWithInternalLinkCards
                          key={bIdx}
                          text={formatSentenceBreaks(b.text)}
                          linkIndex={linkIndex}
                          as="p"
                          textClassName="cb-stage-body cb-stage-body-strong"
                        />
                      );
                    }

                    if (b.type === "pullquote") {
                      return <PullQuote key={bIdx} text={b.text} />;
                    }

                    if (b.type === "heading") {
                      return (
                        <h3
                          key={bIdx}
                          id={b.heading.id}
                          className="cb-stage-h3 scroll-mt-28 pt-2"
                        >
                          {normalizeEditorialHeadingLabel(b.heading.text)}
                        </h3>
                      );
                    }
                    if (b.type === "list") {
                      return (
                        <ul key={bIdx} className="space-y-4">
                          {b.items.map((t, i2) => (
                            <li key={i2} className="flex gap-3">
                              <span className="mt-[0.62em] h-[6px] w-[6px] rounded-full bg-[var(--accent-base)]" />
                              <TextWithInternalLinkCards
                                text={t}
                                linkIndex={linkIndex}
                                as="span"
                                className="flex-1"
                                textClassName="cb-stage-body cb-stage-body-strong"
                              />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (b.type === "hr") {
                      return <div key={bIdx} className="h-px w-full bg-[rgba(14,12,10,0.08)]" />;
                    }
                    return null;
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 space-y-10">
          {relatedCars.length > 0 ? (
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="detail-kicker">関連車種</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">登場車</h2>
                </div>
                <Link href="/cars" className="text-[12px] tracking-[0.18em] text-[var(--accent-strong)] hover:text-[var(--accent-base)]">
                  車種DBへ
                </Link>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {relatedCars.slice(0, 10).map((car) => {
                  const img = pickCarImage(car);
                  return (
                    <Link
                      key={car.slug}
                      href={`/cars/${car.slug}`}
                      className="cb-tap flex min-w-[220px] items-center gap-3 rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.94)] px-4 py-2 shadow-soft-card transition hover:-translate-y-0.5"
                    >
                      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[rgba(14,12,10,0.08)] bg-[var(--surface-2)]">
                        {ENABLE_CAR_IMAGES && img ? (
                          <Image src={img} alt={car.name} fill className="object-cover" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-[var(--accent-base)]" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] text-[var(--text-secondary)]">{car.name}</p>
                        {car.maker ? (
                          <p className="truncate text-[11px] text-[var(--text-tertiary)]">{car.maker}</p>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {relatedGuides.length > 0 ? (
            <div className={cn(relatedCars.length > 0 ? "" : "mt-0")}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="detail-kicker">関連ガイド</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">深掘りする</h2>
                </div>
                <Link href="/guide" className="text-[12px] tracking-[0.18em] text-[var(--accent-strong)] hover:text-[var(--accent-base)]">
                  ガイド一覧
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedGuideLead.map((g) => (
                  <ContentGridCard
                    key={g.slug}
                    href={`/guide/${g.slug}`}
                    title={g.title}
                    imageSrc={g.thumbnail ?? g.heroImage ?? "/images/heritage/hero_default.jpg"}
                    eyebrow={(g.tags ?? [])[0] ?? "実用ガイド"}
                    excerpt={g.summary ?? g.lead ?? undefined}
                    aspect="portrait"
                    seedKey={g.slug}
                    posterVariant="guide"
                  />
                ))}
              </div>

              {relatedGuideRows.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {relatedGuideRows.map((g) => (
                    <ContentRowCard
                      key={g.slug}
                      href={`/guide/${g.slug}`}
                      title={g.title}
                      excerpt={g.summary ?? g.lead ?? undefined}
                      imageSrc={g.thumbnail ?? g.heroImage ?? "/images/heritage/hero_default.jpg"}
                      badge={(g.tags ?? [])[0] ?? "実用ガイド"}
                      badgeTone="accent"
                      date={null}
                      size="sm"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {relatedHeritage.length > 0 ? (
            <div className="detail-card-muted p-6 shadow-soft-card">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="detail-kicker">次に読む</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">次に読む</h2>
                </div>
                <Link href="/heritage" className="text-[12px] tracking-[0.18em] text-[var(--accent-strong)] hover:text-[var(--accent-base)]">
                  系譜一覧
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedHeritage.map((h) => (
                  <ContentGridCard
                    key={h.slug}
                    href={`/heritage/${h.slug}`}
                    title={h.title}
                    imageSrc={resolveHeritageCardImage(h)}
                    eyebrow={h.eraLabel ?? "系譜"}
                    excerpt={getHeritagePreviewText(h) || h.summary}
                    aspect="portrait"
                    seedKey={h.slug}
                    posterVariant="heritage"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="#top" className="detail-button-secondary">
            TOPへ戻る <span aria-hidden>↑</span>
          </Link>
          <Link href="/heritage" className="detail-button">
            系譜一覧へ <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
