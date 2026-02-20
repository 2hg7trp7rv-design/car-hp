import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArticleTable } from "@/components/content/ArticleTable";
import { CbjRichBlock } from "@/components/content/CbjRichBlock";

import { getSiteUrl } from "@/lib/site";
import { pickExistingLocalPublicAssetPath, resolveOgImageUrl } from "@/lib/public-assets";
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
    .replace(/[\s　]+/g, "-")
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

  const hasH2 = blocks.some((b) => b.type === "h" && b.level === 2);
  const contentBlocks: ContentBlock[] = hasH2
    ? blocks
    : [{ type: "h", level: 2, text: "本文", id: "content" }, ...blocks];

  const toc = contentBlocks
    .filter((b): b is HeadingBlock => b.type === "h" && b.level === 2)
    .map((h) => ({ id: h.id, title: h.text }));


  const all = await getAllColumns();
  const related = pickRelatedColumns(item, all, 4);
  const relatedMain = related.slice(0, 2);
  const relatedMini = related.slice(2, 4);

  const badge = (item.tags ?? [])[0] ?? mapCategoryLabel(item.category);

  const safeHeroImage = pickExistingLocalPublicAssetPath(
    ((item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null),
    null,
  );

  let step = 0;
  let renderedSteps = 0;

  const linkIndex = await getInternalLinkIndex();

  return (
    <main className="relative text-white">
      {/* Fixed background (CARS / HERITAGE / GUIDE / COLUMN で共通) */}
      <DetailFixedBackground seed={params.slug} imageSrc={(item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null} />

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

        {safeHeroImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={safeHeroImage}
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
                <li key={idx} className="flex gap-3 cb-stage-body text-white/85">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                    +
                  </span>
                  <TextWithInternalLinkCards
                    text={t}
                    linkIndex={linkIndex}
                    as="span"
                    className="flex-1"
                    textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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
              className="cb-tap mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white hover:bg-white/15"
            >
              COLUMN一覧へ戻る <span aria-hidden>→</span>
            </Link>
          </div>
        </section>


        {/* toc */}
        {toc.length > 1 ? (
          <section className="mt-10" aria-label="目次">
            <InThisStoryToc items={toc} sticky ariaLabel="ページ内目次" />
          </section>
        ) : null}
        <article className="mt-10 cb-prose">
          <div className="space-y-10">
            {contentBlocks.map((b, idx) => {
              if (b.type === "h" && b.level === 2) {
                step += 1;
                renderedSteps += 1;
                const chapter = String(step).padStart(2, "0");

                return (
                  <div
                    key={`${b.id}-${idx}`}
                    className={`scroll-mt-28 ${step === 1 ? "" : "mt-16"}`}
                  >
                    <div className="cb-stage-chapter">
                      <p className="cb-stage-chapterLabel">
                        CHAPTER {chapter}
                      </p>
                      <h2
                        id={b.id}
                        className="cb-stage-chapterTitle"
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
                                textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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
                    className="cb-prose-block cb-stage-h3 scroll-mt-28 pt-2"
                  >
                    {b.text}
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
                    textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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
                    className="cb-prose-block overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-[12px] leading-[1.7] text-white/85"
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
                    {b.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0ABAB5]" />
                        <TextWithInternalLinkCards
                          text={it}
                          linkIndex={linkIndex}
                          as="span"
                          className="flex-1"
                          textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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

          {(item.updateReason || (item.sources && item.sources.length > 0)) && (
            <div className="mt-12 space-y-6">
              {item.updateReason ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h2 className="serif-heading text-[18px] tracking-tight text-white">更新履歴</h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/75">
                    {item.updatedAt ? `${formatDateLabel(item.updatedAt)}：` : ""}
                    {item.updateReason}
                  </p>
                </section>
              ) : null}

              {item.sources && item.sources.length > 0 ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h2 className="serif-heading text-[18px] tracking-tight text-white">出典・参考資料</h2>
                  <ul className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-white/80">
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
                              className="underline decoration-white/30 underline-offset-4 hover:decoration-white/60"
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
                  imageSrc={c.heroImage || "/images/heritage/hero_default.jpg"}
                  className="porcelain border-white/10 bg-white/92"
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
                    imageSrc={c.heroImage || "/images/heritage/hero_default.jpg"}
                    badge={c.category ? String(c.category) : "COLUMN"}
                    badgeTone="light"
                    date={formatDateLabel(c.publishedAt ?? c.updatedAt ?? c.createdAt ?? null) ?? null}
                    size="sm"
                    className="porcelain border-white/10 bg-white/92"
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#top"
            className="cb-tap inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white hover:bg-white/15"
          >
            TOPへ戻る <span aria-hidden>↑</span>
          </Link>
        </div>

        <div className="mt-14">
          <Link
            href="/column"
            className="cb-tap inline-flex items-center rounded-full bg-[#0ABAB5] px-7 py-4 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
          >
            すべてのコラムを見る
          </Link>
        </div>
      </div>
    </main>
  );
}