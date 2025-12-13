// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllColumns, getColumnBySlug, type ColumnItem } from "@/lib/columns";
import { getAllCars, type CarItem } from "@/lib/cars";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { getSiteUrl } from "@/lib/site";

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

function pickRelatedColumns(
  column: ColumnItem,
  all: ColumnItem[],
  limit = 6,
): ColumnItem[] {
  const tag = column.tag;
  const score = (c: ColumnItem) => {
    if (c.slug === column.slug) return -9999;
    let s = 0;
    if (c.tag === tag) s += 10;

    const recency = (() => {
      const d = new Date(c.publishedAt);
      if (Number.isNaN(d.getTime())) return 0;
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 30) return 5;
      if (days <= 120) return 2;
      return 0;
    })();
    s += recency;

    return s;
  };

  return [...all]
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

function pickRelatedCars(
  column: ColumnItem,
  cars: CarItem[],
  limit = 6,
): CarItem[] {
  const slugs = column.relatedCarSlugs ?? [];
  const picked = slugs
    .map((slug) => cars.find((c) => c.slug === slug))
    .filter(Boolean) as CarItem[];

  if (picked.length > 0) return picked.slice(0, limit);

  // Fallback: keyword match in title
  const t = column.title ?? "";
  const score = (c: CarItem) => {
    const maker = c.maker ?? "";
    const series = c.series ?? "";
    const gen = c.generation ?? "";
    let s = 0;
    if (maker && t.includes(maker)) s += 6;
    if (series && t.includes(series)) s += 8;
    if (gen && t.includes(gen)) s += 4;
    return s;
  };

  return [...cars].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export async function generateStaticParams() {
  const columns = await getAllColumns();
  return columns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const column = await getColumnBySlug(params.slug);
  if (!column) return {};

  const site = getSiteUrl();
  const url = `${site}/column/${encodeURIComponent(column.slug)}`;

  return {
    title: column.title,
    description: column.excerpt,
    alternates: {
      canonical: `/column/${column.slug}`,
    },
    openGraph: {
      title: column.title,
      description: column.excerpt,
      url,
      type: "article",
      images: column.coverImage
        ? [
            {
              url: column.coverImage,
              width: 1200,
              height: 630,
              alt: column.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: column.title,
      description: column.excerpt,
      images: column.coverImage ? [column.coverImage] : undefined,
    },
  };
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const column = await getColumnBySlug(params.slug);
  if (!column) notFound();

  const allColumns = await getAllColumns();
  const cars = await getAllCars();

  const blocks = parseContent(column.content ?? "");
  const toc = extractToc(blocks);
  const publishedAt = formatDate(column.publishedAt);
  const relatedColumns = pickRelatedColumns(column, allColumns);
  const relatedCars = pickRelatedCars(column, cars);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <Reveal delay={80}>
        <header className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            COLUMN
          </p>

          <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
            {column.title}
          </h1>

          {column.excerpt && (
            <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              {column.excerpt}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] tracking-[0.18em] text-slate-500">
            {publishedAt && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                PUBLISHED {publishedAt}
              </span>
            )}
            {column.tag && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                TAG {column.tag}
              </span>
            )}
          </div>
        </header>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Cover */}
          {column.coverImage && (
            <Reveal delay={120}>
              <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={column.coverImage}
                  alt={column.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            </Reveal>
          )}

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

          {/* Related */}
          <Reveal delay={180}>
            <section className="mt-14">
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
          </Reveal>
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

            {/* Related Cars */}
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
