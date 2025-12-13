import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllGuides,
  getGuideBySlug,
  type GuideItem,
} from "@/lib/guides";
import {
  getAllColumns,
  type ColumnItem,
} from "@/lib/columns";
import {
  getAllCars,
  type CarItem,
} from "@/lib/cars";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { GuideMonetizeBlock } from "@/components/guide/GuideMonetizeBlock";
import { getSiteUrl } from "@/lib/site";

// ★ 解決レイヤー（affiliate link resolver）
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
    };

type GuideWithMeta = GuideItem & {
  relatedCarSlugs?: (string | null)[];
  relatedColumnSlugs?: (string | null)[];
};

type ColumnWithMeta = ColumnItem & {
  relatedCarSlugs?: (string | null)[];
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

function mapCategoryLabel(category: GuideItem["category"]): string {
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

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function pickRelatedGuides(
  guide: GuideWithMeta,
  all: GuideWithMeta[],
  limit = 6,
): GuideWithMeta[] {
  const candidates = all.filter((g) => g.slug !== guide.slug);

  const baseTags = new Set((guide.tags ?? []).filter(Boolean) as string[]);
  const baseCategory = guide.category ?? null;

  const score = (g: GuideWithMeta) => {
    let s = 0;

    if (baseCategory && g.category === baseCategory) s += 4;

    const tags = (g.tags ?? []).filter(Boolean) as string[];
    if (tags.length > 0 && baseTags.size > 0) {
      const overlap = tags.filter((t) => baseTags.has(t)).length;
      if (overlap > 0) s += 2 + overlap * 0.2;
    }

    // title keyword overlap (very light)
    const hay = `${g.title} ${g.summary ?? ""}`.toLowerCase();
    const words = `${guide.title} ${guide.summary ?? ""}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);
    if (words.some((w) => hay.includes(w))) s += 0.6;

    // recency
    const recency = (() => {
      const d = new Date(g.publishedAt ?? g.updatedAt ?? "");
      if (Number.isNaN(d.getTime())) return 0;
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 30) return 1.2;
      if (days <= 120) return 0.6;
      return 0;
    })();
    s += recency;

    return s;
  };

  return [...candidates]
    .map((g) => ({ g, s: score(g) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.g);
}

function pickRelatedColumnsForGuide(
  guide: GuideWithMeta,
  columns: ColumnWithMeta[],
  limit = 6,
): ColumnWithMeta[] {
  const relSlugs = (guide.relatedColumnSlugs ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );

  if (relSlugs.length > 0) {
    const ordered = relSlugs
      .map((slug) => columns.find((c) => c.slug === slug))
      .filter((c): c is ColumnWithMeta => Boolean(c));
    if (ordered.length > 0) return ordered.slice(0, limit);
  }

  // fallback: tag overlap
  const baseTags = new Set((guide.tags ?? []).filter(Boolean) as string[]);
  const score = (c: ColumnWithMeta) => {
    let s = 0;
    const tags = (c.tags ?? []).filter(Boolean) as string[];
    const overlap = tags.filter((t) => baseTags.has(t)).length;
    if (overlap > 0) s += overlap * 1.2;

    const hay = `${c.title} ${c.summary ?? ""}`.toLowerCase();
    const words = `${guide.title} ${guide.summary ?? ""}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);
    if (words.some((w) => hay.includes(w))) s += 0.5;

    return s;
  };

  return [...columns]
    .map((c) => ({ c, s: score(c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}

function pickRelatedCarsForGuide(
  guide: GuideWithMeta,
  cars: CarItem[],
  limit = 8,
): CarItem[] {
  const relSlugs = (guide.relatedCarSlugs ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  if (relSlugs.length > 0) {
    const ordered = relSlugs
      .map((slug) => cars.find((c) => c.slug === slug))
      .filter((c): c is CarItem => Boolean(c));
    if (ordered.length > 0) return ordered.slice(0, limit);
  }

  // fallback: keyword match in title
  const t = guide.title ?? "";
  const score = (c: CarItem) => {
    const maker = c.maker ?? "";
    const series = c.series ?? "";
    const gen = c.generation ?? "";
    let s = 0;
    if (maker && t.includes(maker)) s += 5;
    if (series && t.includes(series)) s += 7;
    if (gen && t.includes(gen)) s += 3;
    return s;
  };

  return [...cars].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
      images: guide.coverImage
        ? [
            {
              url: guide.coverImage,
              width: 1200,
              height: 630,
              alt: guide.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.summary,
      images: guide.coverImage ? [guide.coverImage] : undefined,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = (await getGuideBySlug(params.slug)) as GuideWithMeta | null;
  if (!guide) notFound();

  const [allGuidesRaw, allColumnsRaw, cars] = await Promise.all([
    getAllGuides(),
    getAllColumns(),
    getAllCars(),
  ]);

  const allGuides = allGuidesRaw as GuideWithMeta[];
  const allColumns = allColumnsRaw as ColumnWithMeta[];

  const blocks = parseContent(guide.content ?? "");
  const toc = extractToc(blocks);

  const primaryDate = guide.publishedAt ?? guide.updatedAt ?? null;
  const dateLabel = formatDate(primaryDate);

  // ★ affiliate link resolver（guide.slugベースで紐付け）
  const affiliateLinks = resolveAffiliateLinksForGuide(guide.slug);

  const relatedGuides = pickRelatedGuides(guide, allGuides);
  const relatedColumns = pickRelatedColumnsForGuide(guide, allColumns);
  const relatedCars = pickRelatedCarsForGuide(guide, cars);

  const categoryLabel = mapCategoryLabel(guide.category);

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* Hero */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-vapor/70 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6">
          <Reveal>
            <nav
              className="flex items-center text-[11px] text-slate-500"
              aria-label="パンくずリスト"
            >
              <Link href="/" className="hover:text-slate-800">
                HOME
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <Link href="/guide" className="hover:text-slate-800">
                GUIDE
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-400">{guide.slug}</span>
            </nav>
          </Reveal>

          <Reveal delay={80}>
            <header className="mt-6 space-y-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                GUIDE
              </p>

              <h1 className="serif-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.4rem]">
                {guide.title}
              </h1>

              {guide.summary && (
                <p className="max-w-3xl text-[13px] leading-relaxed text-text-sub sm:text-sm sm:leading-7">
                  {guide.summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.18em] text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                  CATEGORY {categoryLabel}
                </span>
                {dateLabel && (
                  <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                    UPDATED {dateLabel}
                  </span>
                )}
                {guide.tags && guide.tags.length > 0 && (
                  <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                    TAGS {(guide.tags ?? []).slice(0, 4).join(" / ")}
                    {(guide.tags ?? []).length > 4 ? " ..." : ""}
                  </span>
                )}
              </div>
            </header>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main */}
          <div className="lg:col-span-8">
            {/* Monetize / CTA block (top) */}
            <GuideMonetizeBlock
              guideSlug={guide.slug}
              affiliateLinks={affiliateLinks}
            />

            {/* Content */}
            <article className="mt-10 space-y-6">
              {blocks.map((block, index) => {
                if (block.type === "heading") {
                  const h = block.heading;
                  const Tag = h.level === 2 ? "h2" : "h3";
                  const cls =
                    h.level === 2
                      ? "serif-heading mt-10 scroll-mt-24 text-xl text-slate-900 sm:text-2xl"
                      : "serif-heading mt-8 scroll-mt-24 text-lg text-slate-900 sm:text-xl";
                  return (
                    <Reveal key={`${h.id}-${index}`} delay={80 + index * 6}>
                      <Tag id={h.id} className={cls}>
                        {h.text}
                      </Tag>
                    </Reveal>
                  );
                }

                if (block.type === "paragraph") {
                  return (
                    <Reveal key={`p-${index}`} delay={80 + index * 6}>
                      <p className="text-[12px] leading-relaxed text-slate-700 sm:text-[14px]">
                        {block.text}
                      </p>
                    </Reveal>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <Reveal key={`q-${index}`} delay={80 + index * 6}>
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
                    <Reveal key={`l-${index}`} delay={80 + index * 6}>
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
                    <Reveal key={`c-${index}`} delay={80 + index * 6}>
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

                return null;
              })}
            </article>

            {/* Monetize / CTA block (bottom) */}
            <div className="mt-14">
              <GuideMonetizeBlock
                guideSlug={guide.slug}
                affiliateLinks={affiliateLinks}
              />
            </div>

            {/* Related columns */}
            {relatedColumns.length > 0 && (
              <section className="mt-14">
                <Reveal>
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
                </Reveal>

                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedColumns.map((c, idx) => (
                    <Reveal key={c.slug} delay={120 + idx * 30}>
                      <Link href={`/column/${encodeURIComponent(c.slug)}`}>
                        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
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
            )}

            {/* Related guides */}
            {relatedGuides.length > 0 && (
              <section className="mt-14">
                <Reveal>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                        NEXT READ
                      </p>
                      <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                        次に読むべきGUIDE
                      </h2>
                    </div>
                    <Link
                      href="/guide"
                      className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
                    >
                      GUIDE一覧へ →
                    </Link>
                  </div>
                </Reveal>

                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedGuides.map((g, idx) => (
                    <Reveal key={g.slug} delay={120 + idx * 25}>
                      <Link href={`/guide/${encodeURIComponent(g.slug)}`}>
                        <GlassCard className="group h-full border border-slate-200/80 bg-white/92 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                          <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] tracking-[0.18em] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                              {mapCategoryLabel(g.category)}
                            </span>
                            {g.publishedAt && (
                              <span className="ml-auto text-[10px] text-slate-400">
                                {formatDate(g.publishedAt)}
                              </span>
                            )}
                          </div>

                          <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                            {g.title}
                          </h3>

                          {g.summary && (
                            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                              {g.summary}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* TOC */}
              {toc.length > 0 && (
                <Reveal delay={80}>
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

              {/* Related Cars */}
              {relatedCars.length > 0 && (
                <Reveal delay={120}>
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
    </main>
  );
}
