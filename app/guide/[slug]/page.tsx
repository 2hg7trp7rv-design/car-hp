// app/guide/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { GuideMonetizeBlock } from "@/components/guide/GuideMonetizeBlock";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, getGuideBySlug, type GuideItem } from "@/lib/guides";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";

import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

type HeadingBlock = {
  id: string;
  text: string;
  level: 2 | 3;
};

type ContentBlock =
  | { type: "heading"; heading: HeadingBlock }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "divider" }
  | { type: "list"; items: string[] }
  | {
      type: "callout";
      title: string;
      body: string[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    };

type GuideWithMeta = GuideItem & {
  tag?: string | null;
  tags?: string[] | null;
  relatedCarSlugs?: (string | null)[];
  relatedColumnSlugs?: (string | null)[];
  relatedHeritageSlugs?: (string | null)[];
};

type ColumnWithMeta = ColumnItem & {
  readMinutes?: number | null;
  tags?: string[] | null;
  relatedCarSlugs?: (string | null)[];
};

type HeritageWithMeta = HeritageItem & {
  keyCarSlugs?: (string | null)[];
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function slugifyId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseContent(content: string): ContentBlock[] {
  const lines = content.split("\n");

  const blocks: ContentBlock[] = [];
  let pendingList: string[] = [];
  let pendingCallout: { title: string; body: string[] } | null = null;

  const flushList = () => {
    if (pendingList.length > 0) {
      blocks.push({ type: "list", items: pendingList });
      pendingList = [];
    }
  };

  const flushCallout = () => {
    if (pendingCallout) {
      blocks.push({
        type: "callout",
        title: pendingCallout.title,
        body: pendingCallout.body,
      });
      pendingCallout = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Callout syntax:
    // :::callout Title
    // body...
    // :::
    if (trimmed.startsWith(":::callout ")) {
      flushList();
      flushCallout();
      const title = normalizeText(trimmed.replace(":::callout ", ""));
      pendingCallout = { title, body: [] };
      continue;
    }
    if (trimmed === ":::") {
      flushList();
      flushCallout();
      continue;
    }
    if (pendingCallout) {
      if (trimmed.length > 0) {
        pendingCallout.body.push(trimmed);
      }
      continue;
    }

    // Image syntax:
    // ![alt](src "caption")
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
    if (imgMatch) {
      flushList();
      flushCallout();
      const alt = imgMatch[1] ?? "";
      const src = imgMatch[2] ?? "";
      const caption = imgMatch[3];
      blocks.push({
        type: "image",
        src,
        alt,
        caption: caption ? caption : undefined,
      });
      continue;
    }

    // Divider
    if (trimmed === "---") {
      flushList();
      flushCallout();
      blocks.push({ type: "divider" });
      continue;
    }

    // Headings
    if (trimmed.startsWith("## ")) {
      flushList();
      flushCallout();
      const text = normalizeText(trimmed.replace(/^##\s+/, ""));
      blocks.push({
        type: "heading",
        heading: {
          id: slugifyId(text),
          text,
          level: 2,
        },
      });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      flushCallout();
      const text = normalizeText(trimmed.replace(/^###\s+/, ""));
      blocks.push({
        type: "heading",
        heading: {
          id: slugifyId(text),
          text,
          level: 3,
        },
      });
      continue;
    }

    // Quote
    if (trimmed.startsWith("> ")) {
      flushList();
      flushCallout();
      blocks.push({ type: "quote", text: normalizeText(trimmed.slice(2)) });
      continue;
    }

    // List item
    if (trimmed.startsWith("- ")) {
      flushCallout();
      pendingList.push(normalizeText(trimmed.slice(2)));
      continue;
    }

    // Empty line flush list
    if (trimmed.length === 0) {
      flushList();
      flushCallout();
      continue;
    }

    // Paragraph
    flushList();
    flushCallout();
    blocks.push({ type: "paragraph", text: trimmed });
  }

  flushList();
  flushCallout();

  return blocks;
}

function extractToc(blocks: ContentBlock[]): HeadingBlock[] {
  return blocks
    .filter((b) => b.type === "heading")
    .map((b) => (b as any).heading as HeadingBlock)
    .filter(Boolean);
}

function formatDate(value: string | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function mapGuideCategoryLabel(category: GuideItem["category"]): string {
  switch (category) {
    case "MONEY":
      return "お金・維持費";
    case "SELL":
      return "売却・乗り換え";
    case "BUY":
      return "購入計画";
    case "MAINTENANCE_COST":
      return "維持費の考え方";
    default:
      return "ガイド";
  }
}

function pickRelatedGuides(
  guide: GuideWithMeta,
  all: GuideWithMeta[],
  limit = 6,
): GuideWithMeta[] {
  const tags = new Set((guide.tags ?? []).filter(Boolean) as string[]);
  const cat = guide.category ?? null;

  const score = (g: GuideWithMeta) => {
    if (g.slug === guide.slug) return -9999;

    let s = 0;
    if (cat && g.category === cat) s += 10;

    if (tags.size > 0 && g.tags && g.tags.length > 0) {
      const overlap = g.tags.filter((t) => (t ? tags.has(t) : false)).length;
      s += overlap * 2;
    }

    const recency = (() => {
      const d = new Date(g.publishedAt ?? g.updatedAt ?? "");
      if (Number.isNaN(d.getTime())) return 0;
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 30) return 5;
      if (days <= 120) return 2;
      return 0;
    })();
    s += recency;

    return s;
  };

  return [...all].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

function pickRelatedCars(guide: GuideWithMeta, cars: CarItem[], limit = 6) {
  const slugs = (guide.relatedCarSlugs ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );

  const picked = slugs
    .map((slug) => cars.find((c) => c.slug === slug))
    .filter(Boolean) as CarItem[];

  if (picked.length > 0) return picked.slice(0, limit);

  // Fallback: keyword match in title/summary
  const t = `${guide.title ?? ""} ${guide.summary ?? ""}`.toLowerCase();
  const score = (c: CarItem) => {
    const maker = (c.maker ?? "").toLowerCase();
    const series = (c.series ?? "").toLowerCase();
    const gen = (c.generation ?? "").toLowerCase();
    let s = 0;
    if (maker && t.includes(maker)) s += 6;
    if (series && t.includes(series)) s += 8;
    if (gen && t.includes(gen)) s += 4;
    return s;
  };

  return [...cars].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

function pickRelatedColumns(guide: GuideWithMeta, columns: ColumnWithMeta[], limit = 6) {
  const relatedSlugs = (guide.relatedColumnSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );

  if (relatedSlugs.length > 0) {
    const ordered = relatedSlugs
      .map((slug) => columns.find((c) => c.slug === slug))
      .filter((c): c is ColumnWithMeta => Boolean(c));
    if (ordered.length > 0) return ordered.slice(0, limit);
  }

  const tags = new Set((guide.tags ?? []).filter(Boolean) as string[]);
  const score = (c: ColumnWithMeta) => {
    let s = 0;
    if (tags.size > 0 && c.tags && c.tags.length > 0) {
      s += c.tags.filter((t) => (t ? tags.has(t) : false)).length * 2;
    }
    const hay = `${c.title ?? ""} ${c.summary ?? ""}`.toLowerCase();
    const words = `${guide.title ?? ""} ${guide.summary ?? ""}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);
    if (words.some((w) => hay.includes(w))) s += 1;
    return s;
  };

  return [...columns].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

function pickRelatedHeritage(guide: GuideWithMeta, heritageList: HeritageWithMeta[], limit = 3) {
  const relatedSlugs = (guide.relatedHeritageSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );

  if (relatedSlugs.length > 0) {
    const ordered = relatedSlugs
      .map((slug) => heritageList.find((h) => h.slug === slug))
      .filter((h): h is HeritageWithMeta => Boolean(h));
    if (ordered.length > 0) return ordered.slice(0, limit);
  }

  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) return {};

  const site = getSiteUrl();
  const url = `${site}/guide/${encodeURIComponent(guide.slug)}`;

  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: `/guide/${guide.slug}`,
    },
    openGraph: {
      title: guide.title,
      description: guide.summary,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.summary,
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const [guideRaw, allGuidesRaw, cars, allColumnsRaw, allHeritageRaw] =
    await Promise.all([
      getGuideBySlug(params.slug),
      getAllGuides(),
      getAllCars(),
      getAllColumns(),
      getAllHeritage(),
    ]);

  if (!guideRaw) notFound();

  const guide = guideRaw as GuideWithMeta;
  const allGuides = allGuidesRaw as GuideWithMeta[];
  const allColumns = allColumnsRaw as ColumnWithMeta[];
  const heritageList = allHeritageRaw as HeritageWithMeta[];

  const blocks = parseContent((guide as any).body ?? "");
  const toc = extractToc(blocks);
  const publishedAt = formatDate(guide.publishedAt ?? guide.updatedAt);

  const relatedGuides = pickRelatedGuides(guide, allGuides);
  const relatedCars = pickRelatedCars(guide, cars);
  const relatedColumns = pickRelatedColumns(guide, allColumns);
  const relatedHeritage = pickRelatedHeritage(guide, heritageList);

  const monetization = resolveAffiliateLinksForGuide(guide.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <Reveal delay={80}>
        <header className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            GUIDE
          </p>

          <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
            {guide.title}
          </h1>

          {guide.summary && (
            <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              {guide.summary}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] tracking-[0.18em] text-slate-500">
            {publishedAt && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                UPDATED {publishedAt}
              </span>
            )}
            {guide.category && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                CATEGORY {mapGuideCategoryLabel(guide.category)}
              </span>
            )}
            {guide.tag && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                TAG {guide.tag}
              </span>
            )}
          </div>
        </header>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Monetize block (top) */}
          <div className="mb-8">
            <GuideMonetizeBlock
              carSlug={null}
              guideSlug={guide.slug}
              placement="top"
              title={guide.title}
              links={monetization}
            />
          </div>

          {/* Content */}
          <article className="space-y-6">
            {blocks.map((block, index) => {
              if (block.type === "heading") {
                const h = block.heading;
                const Tag = h.level === 2 ? "h2" : "h3";
                const cls =
                  h.level === 2
                    ? "serif-heading mt-10 scroll-mt-24 text-xl text-slate-900 sm:text-2xl"
                    : "serif-heading mt-8 scroll-mt-24 text-lg text-slate-900 sm:text-xl";
                return (
                  <Reveal key={`${h.id}-${index}`} delay={120 + index * 8}>
                    <Tag id={h.id} className={cls}>
                      {h.text}
                    </Tag>
                  </Reveal>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <Reveal key={`p-${index}`} delay={120 + index * 8}>
                    <p className="text-[12px] leading-relaxed text-slate-700 sm:text-[14px]">
                      {block.text}
                    </p>
                  </Reveal>
                );
              }

              if (block.type === "quote") {
                return (
                  <Reveal key={`q-${index}`} delay={120 + index * 8}>
                    <blockquote className="rounded-2xl border border-slate-100 bg-white/70 p-4 text-[12px] leading-relaxed text-slate-700 shadow-soft sm:p-5 sm:text-[14px]">
                      {block.text}
                    </blockquote>
                  </Reveal>
                );
              }

              if (block.type === "divider") {
                return (
                  <div
                    key={`d-${index}`}
                    className="my-8 h-px w-full bg-slate-200/70"
                  />
                );
              }

              if (block.type === "list") {
                return (
                  <Reveal key={`l-${index}`} delay={120 + index * 8}>
                    <ul className="space-y-2 rounded-2xl border border-slate-100 bg-white/70 p-4 text-[12px] leading-relaxed text-slate-700 shadow-soft sm:p-5 sm:text-[14px]">
                      {block.items.map((it) => (
                        <li key={it} className="flex gap-2">
                          <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-tiffany-400" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                );
              }

              if (block.type === "callout") {
                return (
                  <Reveal key={`c-${index}`} delay={120 + index * 8}>
                    <GlassCard
                      padding="lg"
                      magnetic={false}
                      className="border border-slate-100 bg-white/80 shadow-soft-card"
                    >
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                        NOTE
                      </p>
                      <h3 className="serif-heading mt-2 text-lg text-slate-900">
                        {block.title}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {block.body.map((t) => (
                          <p
                            key={t}
                            className="text-[12px] leading-relaxed text-slate-700 sm:text-[14px]"
                          >
                            {t}
                          </p>
                        ))}
                      </div>
                    </GlassCard>
                  </Reveal>
                );
              }

              if (block.type === "image") {
                return (
                  <Reveal key={`img-${index}`} delay={120 + index * 8}>
                    <figure className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.src}
                        alt={block.alt}
                        className="h-auto w-full object-cover"
                      />
                      {block.caption && (
                        <figcaption className="border-t border-slate-100 px-4 py-3 text-[10px] tracking-[0.18em] text-slate-500">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                );
              }

              return null;
            })}
          </article>

          {/* Monetize block (bottom) */}
          <div className="mt-10">
            <GuideMonetizeBlock
              carSlug={null}
              guideSlug={guide.slug}
              placement="bottom"
              title={guide.title}
              links={monetization}
            />
          </div>

          {/* Related guides */}
          <Reveal delay={180}>
            <section className="mt-14">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    NEXT
                  </p>
                  <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                    関連GUIDE
                  </h2>
                </div>
                <Link
                  href="/guide"
                  className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
                >
                  GUIDE一覧へ →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {relatedGuides.map((g, idx) => {
                  const primary = g.publishedAt ?? g.updatedAt ?? undefined;
                  const date = formatDate(primary);
                  return (
                    <Reveal key={g.slug} delay={220 + idx * 30}>
                      <Link href={`/guide/${encodeURIComponent(g.slug)}`}>
                        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                          <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                              {mapGuideCategoryLabel(g.category)}
                            </span>
                            {date && (
                              <span className="ml-auto text-[10px] text-slate-400">
                                {date}
                              </span>
                            )}
                          </div>
                          <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                            {g.title}
                          </h3>
                          {g.summary && (
                            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                              {g.summary}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          </Reveal>

          {/* Related columns */}
          {relatedColumns.length > 0 && (
            <Reveal delay={180}>
              <section className="mt-12">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                      RELATED
                    </p>
                    <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                      関連COLUMN
                    </h2>
                  </div>
                  <Link
                    href="/column"
                    className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
                  >
                    COLUMN一覧へ →
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedColumns.map((c, idx) => (
                    <Reveal key={c.slug} delay={220 + idx * 30}>
                      <Link href={`/column/${encodeURIComponent(c.slug)}`}>
                        <GlassCard className="group h-full border border-slate-200/80 bg-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                          <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                            {c.title}
                          </h3>
                          {c.summary && (
                            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                              {c.summary}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* Related heritage */}
          {relatedHeritage.length > 0 && (
            <Reveal delay={180}>
              <section className="mt-12">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                      BRAND
                    </p>
                    <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                      関連HERITAGE
                    </h2>
                  </div>
                  <Link
                    href="/heritage"
                    className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
                  >
                    HERITAGE一覧へ →
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedHeritage.map((h, idx) => (
                    <Reveal key={h.slug} delay={220 + idx * 30}>
                      <Link href={`/heritage/${encodeURIComponent(h.slug)}`}>
                        <GlassCard className="border border-slate-200/80 bg-gradient-to-br from-vapor/90 via-white to-white p-5 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                            BRAND STORY
                          </p>
                          <h3 className="mt-2 text-[15px] font-serif font-semibold text-slate-900">
                            {h.heroTitle ?? h.title}
                          </h3>
                          {h.lead && (
                            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                              {h.lead}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </section>
            </Reveal>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* TOC */}
            {toc.length > 0 && (
              <Reveal delay={120}>
                <GlassCard
                  padding="lg"
                  magnetic={false}
                  className="border border-slate-100 bg-white/80 shadow-soft-card"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    CONTENTS
                  </p>
                  <ul className="mt-4 space-y-2 text-[11px] leading-relaxed text-slate-700">
                    {toc.map((h) => (
                      <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                        <a href={`#${h.id}`} className="hover:text-tiffany-700">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            )}

            {/* Related cars */}
            {relatedCars.length > 0 && (
              <Reveal delay={160}>
                <GlassCard
                  padding="lg"
                  magnetic={false}
                  className="border border-slate-100 bg-white/80 shadow-soft-card"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    RELATED CARS
                  </p>
                  <ul className="mt-4 space-y-3">
                    {relatedCars.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/cars/${encodeURIComponent(c.slug)}`}
                          className="group block"
                        >
                          <div className="text-[12px] font-semibold text-slate-900 group-hover:text-tiffany-700">
                            {c.maker} {c.series}
                          </div>
                          <div className="mt-0.5 text-[10px] tracking-[0.14em] text-slate-500">
                            {c.bodyType} / {c.generation}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
