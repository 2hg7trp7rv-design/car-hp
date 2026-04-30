import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { PullQuote } from "@/components/content/PullQuote";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArticleTable } from "@/components/content/ArticleTable";
import { CbjRichBlock } from "@/components/content/CbjRichBlock";
import { ColumnFeaturePage } from "@/components/column/detail/ColumnFeaturePage";
import { ColumnDecisionPage } from "@/components/column/detail/ColumnDecisionPage";

import { getSiteUrl } from "@/lib/site";
import { resolveEditorialImage } from "@/lib/editorial-media";
import { resolveOgImageUrl } from "@/lib/public-assets";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { buildColumnDescription, buildColumnTitleBase, withBrand } from "@/lib/seo/serp";
import { getAllColumns, getColumnBySlug, getRelatedColumnsV12, type ColumnItem } from "@/lib/columns";
import { resolveColumnDisplayTag } from "@/lib/display-tags";
import { resolveColumnCardImage } from "@/lib/display-tag-media";
import { isIndexableColumn } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getEditorialSurfaceClass } from "@/lib/detail-theme";
import { humanizeUpdateReason } from "@/lib/update-reason";
import { buildEditorialPullQuote } from "@/lib/editorial-quote";
import { normalizeEditorialHeadingLabel } from "@/lib/editorial-heading";

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
      title: "視点が見つかりません",
      description: "指定された視点が見つかりませんでした。",
      robots: { index: false, follow: true },
    };
  }

  const titleBase = buildColumnTitleBase(item);
  const titleFull = withBrand(titleBase);
  const description = buildColumnDescription(item);
  const url = `${getSiteUrl()}/column/${encodeURIComponent(params.slug)}`;

  const rawImage = (item.heroImage ?? item.ogImageUrl ?? null) as string | null;
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

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


function formatSentenceBreaks(text: string): string {
  const src = (text ?? "").toString();
  if (!src) return "";
  return src.replace(/。/g, "。\n").replace(/\n{3,}/g, "\n\n").trim();
}


type HeadingBlock = { type: "h"; level: 2 | 3; text: string; id: string };
type ParagraphBlock = { type: "p"; text: string };
type ListBlock = { type: "ul"; items: string[] };
type DividerBlock = { type: "hr" };
type TableBlock = { type: "table"; headers: string[]; rows: string[][] };
type CodeBlock = { type: "code"; lang: string; code: string };
type CbjBlock = { type: "cbj"; lang: string; raw: string; config: unknown };
type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | DividerBlock
  | TableBlock
  | CodeBlock
  | CbjBlock;

function slugifyId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^a-z0-9\-\u3040-\u30ff\u3400-\u9fff]/g, "")
    .slice(0, 80);
}

function parseBody(markdown: string): ContentBlock[] {
  const src = (markdown ?? "").replace(/\r\n/g, "\n");
  const lines = src.split("\n");

  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (text) blocks.push({ type: "p", text });
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "ul", items: list });
    list = [];
  };

  const splitTableRow = (line: string) => {
    const trimmed = line.trim();
    const withoutOuter = trimmed.replace(/^\|/, "").replace(/\|$/, "");
    return withoutOuter.split("|").map((c) => c.trim());
  };

  const isTableSeparator = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.includes("|")) return false;
    const cells = trimmed
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) return false;
    return cells.every((c) => /^:?-{3,}:?$/.test(c));
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      i += 1;
      continue;
    }

    // code block / CBJ rich block
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();

      const lang = line.slice(3).trim() || "text";
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i += 1;
      }
      if (i < lines.length && (lines[i] ?? "").trim().startsWith("```")) i += 1;

      const code = codeLines.join("\n");
      const isCbj = ["cbj", "cbj-block", "cbjjson"].includes(lang);
      if (isCbj) {
        try {
          const parsed = JSON.parse(code);
          blocks.push({ type: "cbj", lang, raw: code, config: parsed });
        } catch {
          blocks.push({ type: "code", lang, code });
        }
      } else {
        blocks.push({ type: "code", lang, code });
      }

      continue;
    }

    // markdown table
    if (line.includes("|") && i + 1 < lines.length) {
      const next = (lines[i + 1] ?? "").trim();
      if (isTableSeparator(next)) {
        flushParagraph();
        flushList();

        const headers = splitTableRow(line);
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length) {
          const rowLine = (lines[i] ?? "").trim();
          if (!rowLine) break;
          if (rowLine.startsWith("```")) break;
          if (/^(##|###)\s+/.test(rowLine)) break;
          if (/^---+$/.test(rowLine)) break;
          if (/^(?:-|\*)\s+/.test(rowLine)) break;
          if (!rowLine.includes("|")) break;
          rows.push(splitTableRow(rowLine));
          i += 1;
        }
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flushParagraph();
      flushList();
      const text = h2[1].trim();
      blocks.push({ type: "h", level: 2, text, id: slugifyId(text) || "section" });
      i += 1;
      continue;
    }

    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      flushParagraph();
      flushList();
      const text = h3[1].trim();
      blocks.push({ type: "h", level: 3, text, id: slugifyId(text) || "subsection" });
      i += 1;
      continue;
    }

    const li = line.match(/^(?:-|\*)\s+(.+)/);
    if (li) {
      flushParagraph();
      list.push(li[1].trim());
      i += 1;
      continue;
    }

    paragraph.push(line);
    i += 1;
  }

  flushParagraph();
  flushList();
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

  if ((item as any).layoutVariant === "decision-v1") {
    const related = await getRelatedColumnsV12(item, 3);
    const linkIndex = await getInternalLinkIndex();
    return (
      <ColumnDecisionPage
        item={item as any}
        related={related}
        linkIndex={linkIndex as any}
      />
    );
  }

  const dateLabel = formatDateLabel(item.updatedAt ?? item.publishedAt ?? item.createdAt ?? null);

  if ((item as any).layoutVariant === "feature-v1") {
    const related = await getRelatedColumnsV12(item, 3);
    const linkIndex = await getInternalLinkIndex();
    return (
      <ColumnFeaturePage
        item={item as any}
        related={related}
        linkIndex={linkIndex as Record<string, unknown>}
      />
    );
  }

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

  const hasH2 = blocks.some((b) => b.type === "h" && b.level === 2);
  const contentBlocks: ContentBlock[] = hasH2
    ? blocks
    : [{ type: "h", level: 2, text: "ここから読む", id: "content" }, ...blocks];

  const articleSections = (() => {
    const sections: Array<{ id: string; title: string; blocks: ContentBlock[] }> = [];
    let current: { id: string; title: string; blocks: ContentBlock[] } | null = null;

    for (const block of contentBlocks) {
      if (block.type === "h" && block.level === 2) {
        if (current) sections.push(current);
        current = { id: block.id, title: normalizeEditorialHeadingLabel(block.text), blocks: [] };
        continue;
      }

      if (!current) current = { id: "content", title: "本文", blocks: [] };
      current.blocks.push(block);
    }

    if (current) sections.push(current);
    return sections;
  })();

  const toc = articleSections.map((section) => ({ id: section.id, title: section.title }));

  const all = await getAllColumns();
  const related = pickRelatedColumns(item, all, 4);
  const linkIndex = await getInternalLinkIndex();

  const relatedMain = related.slice(0, 2);
  const relatedMini = related.slice(2, 4);

  const badge = resolveColumnDisplayTag(item);

  const heroMedia = resolveEditorialImage(
    ((item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null),
    "column",
    "desktop",
    item.slug,
  );
  const safeHeroImage = heroMedia.src;
  const leadText = (item.subtitle ?? item.summary ?? "").trim() || null;
  const introParagraph =
    articleSections
      .flatMap((section) => section.blocks)
      .find((block): block is Extract<ContentBlock, { type: "p" }> => block.type === "p")?.text ?? null;
  const introQuoteText = buildEditorialPullQuote([
    item.subtitle,
    item.summary,
    takeaways[0],
    introParagraph,
  ]);
  const checkPointSectionIndex = articleSections.length > 1 ? 1 : 0;

  return (
    <main className="detail-page">
      <DetailFixedBackground seed={params.slug} imageSrc={(item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null} />

      <div id="top" />

      <div className="detail-shell pb-24 pt-24 sm:pt-28">
        <JsonLd
          id={`ld-breadcrumb-column-${item.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "ホーム",
                item: `${getSiteUrl()}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "視点",
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
            mainEntityOfPage: `${getSiteUrl()}/column/${encodeURIComponent(item.slug)}`,
          }}
        />

        <Breadcrumb
          tone="paper"
          items={[
            { label: "ホーム", href: "/" },
            { label: "視点", href: "/column" },
            { label: title },
          ]}
        />

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
          <div className="order-1">
            <div className="detail-photo-frame relative aspect-[16/10] w-full">
              {safeHeroImage ? (
                <Image
                  src={safeHeroImage}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover saturate-[0.92]"
                  priority
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(160deg,rgba(241,226,216,0.94),rgba(246,242,235,1))] p-7">
                  <div>
                    <p className="detail-kicker">視点</p>
                    <p className="mt-3 max-w-[16ch] text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
                      {title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-2">
            <div className="flex flex-wrap items-center gap-2">
              {badge ? <span className="detail-chip detail-chip-cobalt">{badge}</span> : null}
              {dateLabel ? <span className="detail-chip">{dateLabel} 更新</span> : null}
            </div>

            <h1 className="page-title mt-5 max-w-[12ch]">{title}</h1>

            {leadText ? <p className="detail-lead mt-6 max-w-[40rem]">{leadText}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/column" className="detail-button-secondary">
                視点へ
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {takeaways.length > 0 ? (
          <section className="mt-8">
            <section className="detail-card-glow p-6 sm:p-8">
              <p className="detail-kicker">要点</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                まず押さえる論点
              </h2>
              <ul className="mt-5 space-y-4">
                {takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-[0.72em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
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
            </section>
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

        <article className="mt-12 space-y-8">
          {articleSections.map((section, secIndex) => (
            <section
              key={section.id}
              id={section.id}
              className={`${getEditorialSurfaceClass(secIndex)} scroll-mt-28 overflow-hidden`}
            >
              <div className="cb-stage-chapterTop">
                <p className="cb-stage-chapterLabel"><span className="cb-stage-chapterNumber">{String(secIndex + 1).padStart(2, "0")}</span>.</p>
                <h2 className="cb-stage-chapterTitle">{section.title}</h2>
              </div>

              <div className="mx-6 h-px bg-[rgba(14,12,10,0.08)]" />

              <div className="px-6 py-6 sm:px-8 sm:py-7">
                {checkPoints.length > 0 && secIndex === checkPointSectionIndex ? (
                  <div className="detail-card-fog mb-8 p-6">
                    <p className="detail-kicker">確認ポイント</p>
                    <p className="mt-2 text-[16px] font-semibold text-[var(--text-primary)]">
                      押さえておきたい点
                    </p>
                    <ul className="mt-4 space-y-3">
                      {checkPoints.map((it) => (
                        <li key={it} className="flex items-start gap-3">
                          <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                          <TextWithInternalLinkCards
                            text={it}
                            linkIndex={linkIndex}
                            as="span"
                            className="flex-1"
                            textClassName="cb-stage-body cb-stage-body-strong"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="space-y-8 cb-prose">
                  {section.blocks.map((b, idx) => {
                    if (b.type === "h" && b.level === 3) {
                      return (
                        <h3
                          key={`${b.id}-${idx}`}
                          id={b.id}
                          className="cb-prose-block cb-stage-h3 scroll-mt-28 pt-2"
                        >
                          {normalizeEditorialHeadingLabel(b.text)}
                        </h3>
                      );
                    }

                    if (b.type === "p") {
                      return (
                        <TextWithInternalLinkCards
                          key={idx}
                          text={formatSentenceBreaks(b.text)}
                          linkIndex={linkIndex}
                          as="p"
                          className="cb-prose-block"
                          textClassName="cb-stage-body cb-stage-body-strong"
                        />
                      );
                    }

                    if (b.type === "cbj") {
                      return <CbjRichBlock key={idx} config={b.config} />;
                    }

                    if (b.type === "code") {
                      return (
                        <pre
                          key={idx}
                          className="cb-prose-block overflow-x-auto rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.94)] p-4 text-[12px] leading-[1.8] text-[var(--text-secondary)]"
                        >
                          <code>{b.code}</code>
                        </pre>
                      );
                    }

                    if (b.type === "table") {
                      return <ArticleTable key={idx} headers={b.headers} rows={b.rows} />;
                    }

                    if (b.type === "ul") {
                      return (
                        <ul key={idx} className="cb-prose-block space-y-4">
                          {b.items.map((it) => (
                            <li key={it} className="flex items-start gap-3">
                              <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                              <TextWithInternalLinkCards
                                text={it}
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
                      return <div key={idx} className="h-px w-full bg-[rgba(14,12,10,0.08)]" />;
                    }

                    return null;
                  })}
                </div>
              </div>
            </section>
          ))}

          {(item.updateReason || (item.sources && item.sources.length > 0)) && (
            <div className="space-y-6">
              {item.updateReason ? (
                <section className="detail-card-muted p-6">
                  <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">更新履歴</h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {item.updatedAt ? `${formatDateLabel(item.updatedAt)}：` : ""}
                    {humanizeUpdateReason(item.updateReason)}
                  </p>
                </section>
              ) : null}

              {item.sources && item.sources.length > 0 ? (
                <section className="detail-card-muted p-6">
                  <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">出典・参考資料</h2>
                  <ul className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {item.sources.map((s, i) => {
                      const trimmed = s.trim();
                      const isUrl = /^https?:\/\//.test(trimmed);
                      return (
                        <li key={i}>
                          {isUrl ? (
                            <a
                              href={trimmed}
                              target="_blank"
                              rel="noreferrer"
                              className="detail-link underline decoration-[rgba(27,63,229,0.35)] underline-offset-4"
                            >
                              {trimmed}
                            </a>
                          ) : (
                            trimmed
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </article>

        {related.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                関連記事
              </h2>
              <Link href="/column" className="text-[12px] tracking-[0.18em] text-[var(--accent-strong)] hover:text-[var(--accent-base)]">
                視点へ
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedMain.map((c) => (
                <ContentGridCard
                  key={c.slug}
                  href={`/column/${encodeURIComponent(c.slug)}`}
                  title={c.titleJa ?? c.title}
                  date={formatDateLabel(c.publishedAt ?? c.updatedAt ?? c.createdAt ?? null) ?? undefined}
                  imageSrc={resolveColumnCardImage(c) ?? "/images/heritage/hero_default.jpg"}
                  eyebrow={resolveColumnDisplayTag(c)}
                  seedKey={c.slug}
                  posterVariant="column"
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
                    imageSrc={resolveColumnCardImage(c) ?? "/images/heritage/hero_default.jpg"}
                    badge={resolveColumnDisplayTag(c)}
                    badgeTone="accent"
                    date={formatDateLabel(c.publishedAt ?? c.updatedAt ?? c.createdAt ?? null) ?? null}
                    size="sm"
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="#top" className="detail-button-secondary">
            TOPへ戻る <span aria-hidden>↑</span>
          </Link>
          <Link href="/column" className="detail-button">
            視点を見る <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
