import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { PullQuote } from "@/components/content/PullQuote";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";

import type { CarItem, HeritageSection } from "@/lib/content-types";
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
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { isIndexableHeritage } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { ExhibitionLabel } from "@/components/content/ExhibitionLabel";

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
      title: "HERITAGE",
      description: "歴史・技術・背景を深掘りする読み物。",
    };
  }

  const preview = getHeritagePreviewText(item);
  const description = preview || item.summary || "歴史・技術・背景を深掘りする読み物。";

  const titleBase = `${item.title} | HERITAGE`;
  const canonical = `${getSiteUrl()}/heritage/${encodeURIComponent(item.slug)}`;

  const rawImage = item.heroImage ?? null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

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
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-")
    .slice(0, 80);
}

function normalizeKey(t: string): string {
  return t
    .replace(/[【】]/g, "")
    .replace(/[\s\u3000]/g, "")
    .replace(/[：:]/g, "")
    .toLowerCase();
}

/**
 * heritage の本文（Markdown風プレーンテキスト）を、「【章タイトル】」区切りで chapter 化する。
 * - sections（JSON）側に summary / carSlugs があれば章にマージする
 * - 空行・---・箇条書きも最低限扱う
 */
function parseHeritageChapters(
  body: string | undefined,
  sections: HeritageSection[] | null | undefined,
): HeritageChapter[] {
  const text = (body ?? "").trim();
  if (!text) return [];

  // 章タイトル照合に使うため、title が確実に存在するセクションだけを対象にする。
  const meta = (Array.isArray(sections) ? sections : []).filter(
    (s): s is HeritageSection & { title: string } =>
      typeof s?.title === "string" && s.title.trim().length > 0,
  );

  const findMetaByTitle = (title: string): HeritageSection | undefined => {
    const key = normalizeKey(title);
    const exact = meta.find((s) => normalizeKey(s.title) === key);
    if (exact) return exact;
    // ゆるい一致（序章/第◯章表記の揺れ吸収）
    return meta.find((s) => {
      const k = normalizeKey(s.title);
      return k.includes(key) || key.includes(k);
    });
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

  const startChapter = (title: string, prev: HeritageChapter | null): HeritageChapter => {
    closeCurrent(prev);

    const m = findMetaByTitle(title);
    const id = (m?.id ? m.id : slugifyId(title)) || `section-${chapters.length + 1}`;

    return {
      id,
      title,
      // ここは「string | null | undefined」が混ざりやすいので、null までに揃える
      summary: m?.summary ?? null,
      carSlugs: Array.isArray(m?.carSlugs) ? (m?.carSlugs ?? []) : [],
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

    // Chapter heading: 【...】
    const chapterMatch = trimmed.match(/^【(.+?)】$/);
    if (chapterMatch) {
      const title = chapterMatch[1]?.trim();
      if (title) current = startChapter(title, current);
      continue;
    }

    // Ensure at least one chapter exists before adding blocks.
    if (!current) current = startChapter("本文", current);

    // If we just ended a pullquote block, flush it before handling the next block.
    if (!trimmed.startsWith(">") && pullQuoteBuf.length > 0) {
      flushPullQuote(current);
    }

    // Pull quote (Markdown style)
    // Example:
    // > 2000GTは「売れるため」ではなく、
    // > 歴史を「演じるため」に生まれている。
    if (trimmed.startsWith(">")) {
      flushParagraph(current);
      flushList(current);
      const t = trimmed.replace(/^>+\s?/, "").trim();
      if (t) pullQuoteBuf.push(t);
      continue;
    }

    // Special heading
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

    // Sub heading (### ...)
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

    // Divider
    if (trimmed === "---") {
      flushPullQuote(current);
      flushParagraph(current);
      flushList(current);
      current.blocks.push({ type: "hr" });
      continue;
    }

    // Blank
    if (!trimmed) {
      flushPullQuote(current);
      flushParagraph(current);
      flushList(current);
      continue;
    }

    // List
    if (isListLine(trimmed)) {
      flushPullQuote(current);
      flushParagraph(current);
      listBuf.push(stripListMarker(trimmed));
      continue;
    }

    // Paragraph
    flushPullQuote(current);
    flushList(current);
    paraBuf.push(trimmed);
  }

  // last
  closeCurrent(current);

  return chapters;
}

function pickCarImage(car: CarItem | undefined | null): string | null {
  if (!car) return null;
  return car.heroImage || car.mainImage || null;
}

// Related cards (NEXT STORY / RECOMMEND) で使う安全なヒーロー画像選択
function pickHeroImage(src: string | null | undefined): string {
  const s = (src ?? "").trim();
  if (!s) return "/images/heritage/hero_default.jpg";
  if (s === "/ogp-default.jpg" || s === "/ogp-default.png") return "/images/heritage/hero_default.jpg";
  return s;
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

export default async function HeritageDetailPage({ params }: PageProps) {
  const item = await getHeritageBySlug(params.slug);
  if (!item) notFound();
  const linkIndex = await getInternalLinkIndex();
  const chapters = parseHeritageChapters(item.body, item.sections);
  const toc = chapters.map((c) => ({ id: c.id, title: c.title }));

  const carSlugs = extractHeritageCarSlugs(item);
  const relatedCars = carSlugs.length ? await getCarsBySlugs(carSlugs) : [];

  const guideSlugs = extractHeritageGuideSlugs(item);
  const relatedGuides = guideSlugs.length ? await getGuidesBySlugs(guideSlugs) : [];

  const relatedHeritage = await getNextReadHeritageV12(item, 2);

  const breadcrumbData = [
    { label: "HOME", href: "/" },
    { label: "HERITAGE", href: "/heritage" },
    { label: item.title },
  ];

  return (
    <main className="relative text-white">
      {/* Fixed background (CARS / HERITAGE / GUIDE / COLUMN で共通) */}
      <DetailFixedBackground />

      <div id="top" />

      {/* Hero (height is content-based; avoid empty screen space) */}
      <section className="relative">
        <div className="page-shell pb-24 pt-24">
          <Breadcrumb items={breadcrumbData} tone="light" />

        <ExhibitionLabel
          n="02"
          title={ item.title || item.slug }
          subtitle={ item.subtitle || null }
          meta={ item.eraLabel || (item.publishedAt ? String(item.publishedAt).slice(0,10) : null) }
        />


          <div className="mt-8 max-w-[860px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] tracking-[0.18em] text-white/75 backdrop-blur">
              HERITAGE
            </div>

            <h1 className="serif-heading mt-4 text-[30px] leading-[1.18] text-white sm:text-[44px]">
              {item.title}
            </h1>

            {item.summary ? (
              <p className="mt-5 max-w-[52rem] text-[13.5px] text-white/85 sm:text-[14.5px]">
                {item.summary}
              </p>
            ) : null}

            {item.heroCaption ? (
              <p className="mt-6 text-[11px] text-white/55">{item.heroCaption}</p>
            ) : null}
          </div>

          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </section>

      
      {/* pillar (本文前半に親Pillarへ戻す導線を固定) */}
      <section className="page-shell pb-10">
        <div className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60">
            PILLAR
          </p>
          <p className="mt-2 text-[13px] leading-relaxed tracking-[0.06em] text-white/85">
            この系統の背景・系譜は、HERITAGE一覧（Pillar）でまとめて辿れます。
          </p>
          <Link
            href="/heritage"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white hover:bg-white/15"
          >
            HERITAGE一覧へ戻る <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

{/* TOC (Highlights は仕様変更で撤去) */}
      {toc.length > 1 ? (
        <section className="page-shell pb-10 pt-10">
          <InThisStoryToc items={toc} sticky ariaLabel="ページ内目次" />
        </section>
      ) : null}

      {/* Chapters */}
      <div className="space-y-12 pb-4">
        {chapters.map((c, idx) => (
          <section
                  key={c.id}
                  id={c.id}
                  className={`scroll-mt-28 ${idx === 0 ? "" : "mt-16"}`}
                >
            <div className="page-shell">
              {/* Chapter head (transparent-ish) */}
              <div className="rounded-3xl border border-white/12 bg-black/15 px-7 py-7 backdrop-blur sm:px-9 sm:py-8">
                <p className="text-[12px] font-semibold tracking-[0.22em] text-white/65">
                  CHAPTER {chapterNo(idx)}
                </p>
                <h2 className="serif-heading mt-3 text-[22px] text-white sm:text-[26px]">
                  {c.title}
                </h2>

                {c.summary ? (
                  <p className="mt-4 max-w-[52rem] text-[13px] text-white/85">
                    {c.summary}
                  </p>
                ) : null}
              </div>

              {/* Chapter body (readability-first) */}
              <div
                className={cn(
                  "mt-4 max-w-[52rem] rounded-3xl border border-white/15",
                  "bg-black/28 p-6 text-white/85 shadow-soft backdrop-blur",
                  "sm:p-8",
                )}
              >
                <div className="space-y-8">
                  {c.blocks.map((b, bIdx) => {
                    if (b.type === "paragraph") {
                      return (
                        <TextWithInternalLinkCards
                          key={bIdx}
                          text={formatSentenceBreaks(b.text)}
                          linkIndex={linkIndex}
                          as="p"
                          textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
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
                          className="serif-heading scroll-mt-28 pt-2 text-[18px] font-semibold leading-relaxed text-white"
                        >
                          {b.heading.text}
                        </h3>
                      );
                    }
                    if (b.type === "list") {
                      return (
                        <ul key={bIdx} className="space-y-4">
                          {b.items.map((t, i2) => (
                            <li key={i2} className="flex gap-3">
                              <span className="mt-[0.62em] h-[6px] w-[6px] rounded-full bg-[#0ABAB5]" />
                              <TextWithInternalLinkCards
                                text={t}
                                linkIndex={linkIndex}
                                as="span"
                                className="flex-1"
                                textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                              />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (b.type === "hr") {
                      return <div key={bIdx} className="h-px w-full bg-white/10" />;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Bottom navigation (Next Story の直前まで背景を見せる) */}
      <section className="page-shell py-14">
        {/* Key models (small) */}
        {relatedCars.length > 0 ? (
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-white/65">KEY MODELS</p>
                <h2 className="serif-heading mt-2 text-[18px] text-white">登場車</h2>
              </div>
              <Link href="/cars" className="text-[12px] text-[#0ABAB5] hover:underline">
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
                    className="flex min-w-[220px] items-center gap-3 rounded-full border border-white/18 bg-white/85 px-4 py-2 shadow-soft backdrop-blur transition hover:-translate-y-0.5"
                  >
                    <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#222222]/10 bg-[#F4F4F5]">
                      {ENABLE_CAR_IMAGES && img ? (
                        <Image src={img} alt={car.name} fill className="object-cover" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] text-[#222222]/85">{car.name}</p>
                      {car.maker ? (
                        <p className="truncate text-[11px] text-[#222222]/55">{car.maker}</p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Related guides */}
        {relatedGuides.length > 0 ? (
          <div className={cn("mt-14", relatedCars.length > 0 ? "" : "mt-0")}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-white/65">RELATED GUIDE</p>
                <h2 className="serif-heading mt-2 text-[18px] text-white">深掘りする</h2>
              </div>
              <Link href="/guide" className="text-[12px] text-[#0ABAB5] hover:underline">
                GUIDE一覧
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {relatedGuides.slice(0, 3).map((g) => (
                <ContentRowCard
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  title={g.title}
                  excerpt={g.summary}
                  imageSrc={g.heroImage || "/images/heritage/hero_default.jpg"}
                  badge={null}
                  date={null}
                  size="md"
                  className="border-white/10 bg-white/92"
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Next story (ここから下は白背景に切り替え) */}
      {relatedHeritage.length > 0 ? (
        <section className="bg-white">
          <div className="page-shell py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">NEXT STORY</p>
                <h2 className="serif-heading mt-2 text-[18px]">次に読む</h2>
              </div>
              <Link href="/heritage" className="text-[12px] text-[#0ABAB5] hover:underline">
                HERITAGE一覧
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {relatedHeritage.map((h) => (
                <ContentRowCard
                  key={h.slug}
                  href={`/heritage/${h.slug}`}
                  title={h.title}
                  excerpt={getHeritagePreviewText(h) || h.summary}
                  imageSrc={pickHeroImage(h.heroImage)}
                  badge={null}
                  date={null}
                  size="md"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}