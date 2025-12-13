// app/guide/[slug]/page.tsx
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
  | { type: "table"; rows: Array<{ key: string; value: string }> }
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
  relatedCarSlugs?: (string | null)[];
  tags?: string[] | null;
};

type ColumnWithMeta = ColumnItem & {
  relatedGuideSlugs?: (string | null)[];
  tags?: string[] | null;
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
  let pendingTable: Array<{ key: string; value: string }> = [];

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

  const flushTable = () => {
    if (pendingTable.length > 0) {
      blocks.push({ type: "table", rows: pendingTable });
      pendingTable = [];
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
      flushTable();
      flushCallout();
      const title = normalizeText(trimmed.replace(":::callout ", ""));
      pendingCallout = { title, body: [] };
      continue;
    }
    if (trimmed === ":::") {
      flushList();
      flushTable();
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
      flushTable();
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
      flushTable();
      flushCallout();
      blocks.push({ type: "divider" });
      continue;
    }

    // Headings
    if (trimmed.startsWith("## ")) {
      flushList();
      flushTable();
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
      flushTable();
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
      flushTable();
      flushCallout();
      blocks.push({ type: "quote", text: normalizeText(trimmed.slice(2)) });
      continue;
    }

    // Table row (simple): "key: value"
    const tableMatch = trimmed.match(/^(.+?)\s*:\s*(.+)$/);
    if (tableMatch && !trimmed.startsWith("- ")) {
      flushList();
      flushCallout();
      const key = normalizeText(tableMatch[1]);
      const value = normalizeText(tableMatch[2]);
      if (key && value) {
        pendingTable.push({ key, value });
        continue;
      }
    }

    // List item
    if (trimmed.startsWith("- ")) {
      flushCallout();
      flushTable();
      pendingList.push(normalizeText(trimmed.slice(2)));
      continue;
    }

    // Empty line flush list/table/callout
    if (trimmed.length === 0) {
      flushList();
      flushTable();
      flushCallout();
      continue;
    }

    // Paragraph
    flushList();
    flushTable();
    flushCallout();
    blocks.push({ type: "paragraph", text: trimmed });
  }

  flushList();
  flushTable();
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

function mapGuideCategoryLabel(category?: GuideItem["category"] | null): string {
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
  const tags = new Set((guide.tags ?? []).filter((t): t is string => typeof t === "string"));
  const cat = guide.category ?? null;

  const score = (g: GuideWithMeta) => {
    if (g.slug === guide.slug) return -9999;
    let s = 0;

    if (cat && g.category === cat) s += 4;

    const gTags = (g.tags ?? []).filter((t): t is string => typeof t === "string");
    if (tags.size > 0 && gTags.length > 0) {
      const overlap = gTags.filter((t) => tags.has(t)).length;
      if (overlap > 0) s += 2 + overlap * 0.4;
    }

    const recency = (() => {
      const d = new Date(g.publishedAt ?? g.updatedAt ?? "");
      if (Number.isNaN(d.getTime())) return 0;
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 30) return 2.5;
      if (days <= 120) return 1;
      return 0;
    })();
    s += recency;

    return s;
  };

  return [...all]
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

function pickRelatedColumnsForGuide(
  guide: GuideWithMeta,
  columns: ColumnWithMeta[],
  limit = 6,
): ColumnWithMeta[] {
  const relatedSlugs = (guide.slug ? [guide.slug] : []).filter(Boolean);

  const picked = columns
    .filter((c) =>
      (c.relatedGuideSlugs ?? [])
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .some((s) => relatedSlugs.includes(s)),
    )
    .slice(0, limit);

  if (picked.length > 0) return picked;

  // fallback: tag overlap
  const tags = new Set((guide.tags ?? []).filter((t): t is string => typeof t === "string"));
  if (tags.size === 0) return [];

  const score = (c: ColumnWithMeta) => {
    const cTags = (c.tags ?? []).filter((t): t is string => typeof t === "string");
    const overlap = cTags.filter((t) => tags.has(t)).length;
    return overlap;
  };

  return [...columns]
    .map((c) => ({ c, s: score(c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c)
    .slice(0, limit);
}

function pickRelatedCarsForGuide(
  guide: GuideWithMeta,
  cars: CarItem[],
  limit = 8,
): CarItem[] {
  const slugs = (guide.relatedCarSlugs ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  const picked = slugs
    .map((slug) => cars.find((c) => c.slug === slug))
    .filter(Boolean) as CarItem[];
  return picked.slice(0, limit);
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

  const title = `${guide.title} | CAR BOUTIQUE`;
  const description =
    guide.summary ||
    "輸入車・国産車の購入/維持/売却を、判断しやすい形で整理する実用ガイドです。";

  return {
    title,
    description,
    alternates: {
      canonical: `/guide/${guide.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const [guide, allGuidesRaw, allColumnsRaw, allCarsRaw] = await Promise.all([
    getGuideBySlug(params.slug),
    getAllGuides(),
    getAllColumns(),
    getAllCars(),
  ]);

  if (!guide) notFound();

  const allGuides = allGuidesRaw as GuideWithMeta[];
  const allColumns = allColumnsRaw as ColumnWithMeta[];
  const allCars = allCarsRaw as CarItem[];

  const blocks = parseContent(guide.content ?? "");
  const toc = extractToc(blocks);

  const publishedAt = formatDate(guide.publishedAt ?? guide.updatedAt ?? undefined);
  const categoryLabel = mapGuideCategoryLabel(guide.category);

  const relatedGuides = pickRelatedGuides(guide as GuideWithMeta, allGuides);
  const relatedColumns = pickRelatedColumnsForGuide(guide as GuideWithMeta, allColumns);
  const relatedCars = pickRelatedCarsForGuide(guide as GuideWithMeta, allCars);

  const affiliate = resolveAffiliateLinksForGuide({
    guideSlug: guide.slug,
  });

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6">
        <Reveal>
          <nav
            className="mb-6 flex items-center text-[11px] text-slate-500"
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

        <Reveal delay={60}>
          <header className="mb-10 rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-soft-card backdrop-blur sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.18em] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                GUIDE
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                {categoryLabel}
              </span>
              {publishedAt && (
                <span className="ml-auto rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-slate-400">
                  UPDATED {publishedAt}
                </span>
              )}
            </div>

            <h1 className="serif-heading mt-4 text-2xl text-slate-900 sm:text-3xl">
              {guide.title}
            </h1>

            {guide.summary && (
              <p className="mt-4 max-w-3xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
                {guide.summary}
              </p>
            )}
          </header>
        </Reveal>

        {/* Monetize block (affiliate) */}
        <section className="mb-10">
          <Reveal delay={90}>
            <GuideMonetizeBlock
              affiliate={affiliate}
              guideSlug={guide.slug}
              title={guide.title}
            />
          </Reveal>
        </section>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main */}
          <div className="lg:col-span-8">
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
                    <Reveal key={`${h.id}-${index}`} delay={80 + index * 8}>
                      <Tag id={h.id} className={cls}>
                        {h.text}
                      </Tag>
                    </Reveal>
                  );
                }

                if (block.type === "paragraph") {
                  return (
                    <Reveal key={`p-${index}`} delay={80 + index * 8}>
                      <p className="text-[12px] leading-relaxed text-slate-700 sm:text-[14px]">
                        {block.text}
                      </p>
                    </Reveal>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <Reveal key={`q-${index}`} delay={80 + index * 8}>
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
                    <Reveal key={`l-${index}`} delay={80 + index * 8}>
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

                if (block.type === "table") {
                  return (
                    <Reveal key={`t-${index}`} delay={80 + index * 8}>
                      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/70 shadow-soft">
                        <div className="grid divide-y divide-slate-100">
                          {block.rows.map((row) => (
                            <div
                              key={`${row.key}-${row.value}`}
                              className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] gap-4 px-4 py-3 text-[12px] sm:px-5 sm:text-[13px]"
                            >
                              <div className="font-semibold text-slate-600">
                                {row.key}
                              </div>
                              <div className="text-slate-700">{row.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  );
                }

                if (block.type === "callout") {
                  return (
                    <Reveal key={`c-${index}`} delay={80 + index * 8}>
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
                    <Reveal key={`img-${index}`} delay={80 + index * 8}>
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

            {/* Related Cars */}
            {relatedCars.length > 0 && (
              <section className="mt-14">
                <Reveal>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                        RELATED CARS
                      </p>
                      <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                        関連車種
                      </h2>
                    </div>
                    <Link
                      href="/cars"
                      className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
                    >
                      CARS一覧へ →
                    </Link>
                  </div>
                </Reveal>

                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedCars.map((c, idx) => (
                    <Reveal key={c.slug} delay={120 + idx * 30}>
                      <Link href={`/cars/${encodeURIComponent(c.slug)}`}>
                        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                            {c.maker}
                          </p>
                          <h3 className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                            {c.name}
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

            {/* Related Columns */}
            {relatedColumns.length > 0 && (
              <section className="mt-14">
                <Reveal>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                        RELATED COLUMN
                      </p>
                      <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                        関連コラム
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
                          {c.excerpt && (
                            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                              {c.excerpt}
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

              {/* Related Guides */}
              {relatedGuides.length > 0 && (
                <Reveal delay={160}>
                  <GlassCard
                    padding="lg"
                    magnetic={false}
                    className="border border-slate-100 bg-white/80 shadow-soft-card"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                      NEXT GUIDE
                    </p>
                    <ul className="mt-4 space-y-3">
                      {relatedGuides.map((g) => (
                        <li key={g.slug}>
                          <Link
                            href={`/guide/${encodeURIComponent(g.slug)}`}
                            className="group block"
                          >
                            <div className="text-[12px] font-semibold text-slate-900 group-hover:text-tiffany-700">
                              {g.title}
                            </div>
                            <div className="mt-0.5 text-[10px] tracking-[0.14em] text-slate-500">
                              {mapGuideCategoryLabel(g.category)}
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

        {/* bottom nav */}
        <section className="mt-14">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-[11px] text-slate-600 shadow-soft">
              <Link href="/guide" className="hover:text-slate-900">
                ← GUIDE一覧へ
              </Link>
              <Link href="/news" className="hover:text-slate-900">
                NEWSへ →
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
