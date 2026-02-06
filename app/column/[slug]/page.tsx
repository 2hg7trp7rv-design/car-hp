import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { buildColumnDescription, buildColumnTitleBase, withBrand } from "@/lib/seo/serp";
import { getAllColumns, getColumnBySlug, type ColumnItem } from "@/lib/columns";
import { isIndexableColumn } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { ExhibitionLabel } from "@/components/content/ExhibitionLabel";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const items = await getAllColumns();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    return {
      title: "コラムが見つかりません",
      description: "指定されたコラムが見つかりませんでした。",
      robots: { index: false, follow: true },
    };
  }

  const titleBase = buildColumnTitleBase(item);
  const titleFull = withBrand(titleBase);
  const description = buildColumnDescription(item);
  const url = `${getSiteUrl()}/column/${encodeURIComponent(params.slug)}`;

  const rawImage = (item.heroImage ?? item.ogImageUrl ?? null) as string | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  return {
    title: titleBase,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: titleFull,
      description,
      type: "article",
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images: [image],
    },
    robots: isIndexableColumn(item) ? undefined : NOINDEX_ROBOTS,
  };
}

function formatDateLabel(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function mapCategoryLabel(category: ColumnItem["category"] | undefined): string {
  const c = (category ?? "").toString().trim();
  switch (c) {
    case "MAINTENANCE":
    case "TROUBLE":
      return "メンテナンス・トラブル";
    case "MONEY":
      return "お金・支払い";
    case "MARKET":
      return "市場・価格動向";
    case "TECHNICAL":
    case "HISTORY":
      return "技術・歴史・ブランド";
    case "OWNER_STORY":
      return "オーナーストーリー";
    case "LIFESTYLE":
      return "ライフスタイル";
    case "EVENT":
      return "イベント";
    default:
      return "コラム";
  }
}

type HeadingBlock = { type: "h"; level: 2 | 3; text: string; id: string };
type ParagraphBlock = { type: "p"; text: string };
type ListBlock = { type: "ul"; items: string[] };
type DividerBlock = { type: "hr" };
type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | DividerBlock;

function slugifyId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s　]+/g, "-")
    .replace(/[^a-z0-9\-\u3040-\u30ff\u3400-\u9fff]/g, "")
    .slice(0, 80);
}

function parseBody(markdown: string): ContentBlock[] {
  const src = (markdown ?? "").replace(/\r\n/g, "\n");
  const lines = src.split("\n");

  const blocks: ContentBlock[] = [];
  let buffer: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    const text = buffer.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    buffer = [];
  };

  const flushList = () => {
    if (list.length > 0) blocks.push({ type: "ul", items: list });
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flushParagraph();
      flushList();
      const text = h2[1].trim();
      blocks.push({ type: "h", level: 2, text, id: slugifyId(text) || "section" });
      continue;
    }

    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      flushParagraph();
      flushList();
      const text = h3[1].trim();
      blocks.push({ type: "h", level: 3, text, id: slugifyId(text) || "subsection" });
      continue;
    }

    const li = line.match(/^(?:-|\*)\s+(.+)/);
    if (li) {
      flushParagraph();
      list.push(li[1].trim());
      continue;
    }

    buffer.push(line);
  }

  // flush
  const finalText = buffer.join(" ").trim();
  if (finalText) blocks.push({ type: "p", text: finalText });
  if (list.length > 0) blocks.push({ type: "ul", items: list });

  return blocks;
}

function extractBulletsByHeading(blocks: ContentBlock[], headingPattern: RegExp): string[] {
  let inside = false;
  const out: string[] = [];

  for (const b of blocks) {
    if (b.type === "h" && b.level === 2) {
      inside = headingPattern.test(b.text);
      continue;
    }
    if (!inside) continue;
    if (b.type === "ul") {
      for (const it of b.items) out.push(it);
    }
    if (b.type === "h" && b.level === 2) inside = false;
  }

  return out;
}

function bulletsFromSummary(summary?: string | null, maxItems = 3): string[] {
  const s = (summary ?? "").trim();
  if (!s) return [];
  const parts = s
    .split(/[。\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.slice(0, maxItems);
}

function toTime(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function pickRelatedColumns(base: ColumnItem, all: ColumnItem[], limit = 4): ColumnItem[] {
  const baseTags = new Set((base.tags ?? []).map((t) => t.trim()).filter(Boolean));

  return all
    .filter((c) => c.slug !== base.slug)
    .map((c) => {
      let score = 0;
      if (c.category && base.category && c.category === base.category) score += 2;
      if (baseTags.size > 0 && Array.isArray(c.tags)) {
        const overlap = c.tags.filter((t) => baseTags.has(t)).length;
        score += overlap;
      }
      return {
        c,
        score,
        time: toTime(c.publishedAt ?? c.updatedAt ?? c.createdAt ?? null),
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.time !== b.time) return b.time - a.time;
      return (a.c.title ?? "").localeCompare(b.c.title ?? "", "ja");
    })
    .map((x) => x.c)
    .slice(0, limit);
}

export default async function ColumnDetailPage({ params }: Props) {
  const item = await getColumnBySlug(params.slug);
  if (!item) notFound();

  const title = item.titleJa ?? item.title;
  const dateLabel = formatDateLabel(item.publishedAt ?? item.updatedAt ?? item.createdAt ?? null);

  const blocks = parseBody(item.body ?? "");
  const takeawaysRaw = extractBulletsByHeading(blocks, /(結論|まとめ|要点)/i);
  const takeaways = (takeawaysRaw.length > 0 ? takeawaysRaw : bulletsFromSummary(item.summary ?? null, 3))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const checkPoints = extractBulletsByHeading(blocks, /(チェック|check\s*point|check\s*list)/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const all = await getAllColumns();
  const related = pickRelatedColumns(item, all, 4);
  const relatedMain = related.slice(0, 2);
  const relatedMini = related.slice(2, 4);

  const badge = (item.tags ?? [])[0] ?? mapCategoryLabel(item.category);

  let step = 0;
  let renderedSteps = 0;

  const linkIndex = await getInternalLinkIndex();

  return (
    <main className="relative text-white">
      {/* Fixed background (CARS / HERITAGE / GUIDE / COLUMN で共通) */}
      <DetailFixedBackground />

      <div id="top" />

      <div className="page-shell pb-24 pt-24">
        <JsonLd
          id={`ld-breadcrumb-column-${item.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "HOME",
                item: `${getSiteUrl()}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "COLUMN",
                item: `${getSiteUrl()}/column`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
                item: `${getSiteUrl()}/column/${encodeURIComponent(item.slug)}`,
              },
            ],
          }}
        />

        <JsonLd
          id={`ld-column-${item.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            datePublished: item.publishedAt ?? undefined,
            dateModified: item.updatedAt ?? undefined,
            mainEntityOfPage: `${getSiteUrl()}/column/${encodeURIComponent(item.slug)}`,
          }}
        />

        <Breadcrumb
          tone="light"
          items={[
            { label: "HOME", href: "/" },
            { label: "COLUMN", href: "/column" },
            { label: title },
          ]}
        />

        <ExhibitionLabel
          n="04"
          title={ item.title || item.slug }
          subtitle={ item.subtitle || null }
          meta={ item.publishedAt ? String(item.publishedAt).slice(0,10) : null }
        />


        <header className="mt-6">
          <h1 className="serif-heading text-[28px] leading-[1.25] tracking-tight text-white sm:text-[34px]">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3 py-1 backdrop-blur text-[10px] font-semibold tracking-[0.22em] text-white">
              {badge}
            </span>
            {dateLabel ? (
              <span className="text-[10px] tracking-[0.22em] text-white/55">{dateLabel}</span>
            ) : null}
          </div>
        </header>

        {item.heroImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={item.heroImage}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : null}

        {takeaways.length > 0 ? (
          <section className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-6 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                +
              </span>
              <h2 className="text-[12px] font-semibold tracking-[0.22em] text-white">
                おすすめポイント
              </h2>
            </div>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2">
              {takeaways.map((t, idx) => (
                <li key={idx} className="flex gap-3 text-[15px] leading-[2.05] tracking-[0.08em] text-white/85">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                    +
                  </span>
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
          </section>
        ) : null}


        {/* pillar (本文前半に親Pillarへ戻す導線を固定) */}
        <section className="mt-10">
          <div className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60">
              PILLAR
            </p>
            <p className="mt-2 text-[13px] leading-relaxed tracking-[0.06em] text-white/85">
              コラムは「短い結論」を積み上げるための棚です。関連テーマは一覧（Pillar）から辿れます。
            </p>
            <Link
              href="/column"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white hover:bg-white/15"
            >
              COLUMN一覧へ戻る <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <article className="mt-10">
          <div className="space-y-10">
            {blocks.map((b, idx) => {
              if (b.type === "h" && b.level === 2) {
                step += 1;
                renderedSteps += 1;
                const chapter = String(step).padStart(2, "0");

                return (
                  <div
                    key={`${b.id}-${idx}`}
                    className={`scroll-mt-28 ${step === 1 ? "" : "mt-16"}`}
                  >
                    <div className="rounded-3xl border border-white/12 bg-black/15 px-7 py-7 backdrop-blur sm:px-9 sm:py-8">
                      <p className="text-[12px] tracking-[0.22em] text-white/65">
                        CHAPTER {chapter}
                      </p>
                      <h2
                        id={b.id}
                        className="serif-heading mt-3 text-[22px] text-white sm:text-[26px]"
                      >
                        {b.text}
                      </h2>
                    </div>

                    {renderedSteps === 2 && checkPoints.length > 0 ? (
                      <div className="mt-8 rounded-3xl border border-[#0ABAB5]/25 bg-[#0ABAB5]/10 p-7 shadow-soft backdrop-blur">
                        <p className="text-[12px] font-semibold tracking-[0.22em] text-[#0ABAB5]">
                          — 事前に CHECK POINT
                        </p>

                        <ul className="mt-5 space-y-4">
                          {checkPoints.map((it, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0ABAB5]" />
                              <TextWithInternalLinkCards
                                text={it}
                                linkIndex={linkIndex}
                                as="span"
                                className="flex-1"
                                textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (b.type === "h" && b.level === 3) {
                return (
                  <h3
                    key={`${b.id}-${idx}`}
                    id={b.id}
                    className="serif-heading scroll-mt-28 pt-2 text-[18px] font-semibold leading-relaxed tracking-tight text-white"
                  >
                    {b.text}
                  </h3>
                );
              }

              if (b.type === "p") {
                return (
                  <TextWithInternalLinkCards
                    key={idx}
                    text={b.text}
                    linkIndex={linkIndex}
                    as="p"
                    textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                  />
                );
              }

              if (b.type === "ul") {
                return (
                  <ul
                    key={idx}
                    className="list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-white/85"
                  >
                    {b.items.map((it, i) => (
                      <li key={i}>
                        <TextWithInternalLinkCards
                          text={it}
                          linkIndex={linkIndex}
                          as="span"
                          textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                        />
                      </li>
                    ))}
                  </ul>
                );
              }

              if (b.type === "hr") {
                return <div key={idx} className="h-px w-full bg-white/15" />;
              }

              return null;
            })}
          </div>
        </article>

        {related.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-baseline justify-between">
              <h2 className="serif-heading text-[20px] tracking-tight text-white">
                関連記事
              </h2>
              <Link
                href="/column"
                className="text-[10px] font-semibold tracking-[0.22em] text-white/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedMain.map((c) => (
                <ContentGridCard
                  key={c.slug}
                  href={`/column/${encodeURIComponent(c.slug)}`}
                  title={c.titleJa ?? c.title}
                  date={formatDateLabel(c.publishedAt ?? c.updatedAt ?? c.createdAt ?? null) ?? undefined}
                  imageSrc={c.heroImage ?? null}
                />
              ))}
            </div>

            {relatedMini.length > 0 ? (
              <div className="mt-6 space-y-3">
                {relatedMini.map((c) => (
                  <ContentRowCard
                    key={c.slug}
                    href={`/column/${encodeURIComponent(c.slug)}`}
                    title={c.titleJa ?? c.title}
                    excerpt={c.summary ?? null}
                    imageSrc={c.heroImage ?? null}
                    badge={c.category ? String(c.category) : "COLUMN"}
                    badgeTone="light"
                    date={formatDateLabel(c.publishedAt ?? c.updatedAt ?? c.createdAt ?? null) ?? null}
                    size="sm"
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mt-14">
          <Link
            href="/column"
            className="inline-flex items-center rounded-full bg-[#0ABAB5] px-7 py-4 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
          >
            すべてのコラムを見る
          </Link>
        </div>
      </div>
    </main>
  );
}