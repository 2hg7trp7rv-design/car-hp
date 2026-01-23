import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";
import { getAllGuides, getGuideBySlug, getRelatedGuidesV12 } from "@/lib/guides";


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
  | { type: "list"; items: string[] }
  | { type: "hr" };

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function slugifyId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseBody(body: string | undefined): { blocks: ContentBlock[] } {
  const raw = body ?? "";
  const lines = raw.split(/\r?\n/);

  const blocks: ContentBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";

    // empty
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // hr
    if (/^---+\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // headings
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const text = h3[1].trim();
      blocks.push({
        type: "heading",
        heading: { id: slugifyId(text), text, level: 3 },
      });
      i += 1;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const text = h2[1].trim();
      blocks.push({
        type: "heading",
        heading: { id: slugifyId(text), text, level: 2 },
      });
      i += 1;
      continue;
    }

    // list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^[-*]\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // paragraph (merge consecutive lines until empty)
    let paragraph = line.trim();
    i += 1;
    while (i < lines.length && lines[i] && !/^(##|###)\s+/.test(lines[i] ?? "") && !/^[-*]\s+/.test(lines[i] ?? "") && !/^---+\s*$/.test((lines[i] ?? "").trim())) {
      if (!lines[i]?.trim()) break;
      paragraph += " " + (lines[i] ?? "").trim();
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph });
  }

  return { blocks };
}

function renderTextWithGuideLinks(
  text: string,
  guideTitleBySlug: Map<string, string>,
): ReactNode {
  const re = /\/guide\/([a-z0-9\-]+)/gi;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (let m = re.exec(text); m; m = re.exec(text)) {
    const matchText = m[0] ?? "";
    const slug = (m[1] ?? "").trim();
    const start = m.index ?? 0;
    if (!slug) continue;

    const before = text.slice(lastIndex, start);
    if (before) nodes.push(before);

    const label = guideTitleBySlug.get(slug) ?? matchText;
    nodes.push(
      <Link
        key={`${slug}-${start}`}
        href={`/guide/${encodeURIComponent(slug)}`}
        className="font-medium text-[#0ABAB5] underline decoration-[#0ABAB5]/40 underline-offset-4 hover:decoration-[#0ABAB5]"
      >
        {label}
      </Link>,
    );

    lastIndex = start + matchText.length;
  }

  const rest = text.slice(lastIndex);
  if (rest) nodes.push(rest);

  // no matches
  if (nodes.length === 0) return text;
  return nodes;
}

function extractBulletsByHeading(blocks: ContentBlock[], matcher: (t: string) => boolean): {
  extracted: string[];
  stripped: ContentBlock[];
  headingText?: string;
} {
  const out = [...blocks];
  for (let i = 0; i < out.length; i += 1) {
    const b = out[i];
    if (b.type !== "heading" || b.heading.level !== 2) continue;
    if (!matcher(b.heading.text)) continue;

    const next = out[i + 1];
    if (next && next.type === "list") {
      const extracted = next.items.filter(Boolean);
      const headingText = b.heading.text;
      // remove heading + list
      const stripped = out.filter((_, idx) => idx !== i && idx !== i + 1);
      return { extracted, stripped, headingText };
    }
  }
  return { extracted: [], stripped: blocks };
}

function stripHeadingWithList(
  blocks: ContentBlock[],
  matcher: (t: string) => boolean,
): ContentBlock[] {
  const result: ContentBlock[] = [];

  let skipping = false;
  let skipLevel: 2 | 3 = 2;

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];

    if (block.type === "heading" && matcher(block.heading.text)) {
      // Remove the entire section (heading + subsequent blocks) until the next
      // heading of the same or higher hierarchy appears.
      skipping = true;
      skipLevel = block.heading.level;
      continue;
    }

    if (skipping) {
      if (block.type === "heading" && block.heading.level <= skipLevel) {
        // New section begins — stop skipping and process this block normally.
        skipping = false;
        // Re-run matcher for the new heading (in case multiple nav sections exist).
        if (matcher(block.heading.text)) {
          skipping = true;
          skipLevel = block.heading.level;
          continue;
        }
        result.push(block);
      }
      // Otherwise, keep skipping.
      continue;
    }

    result.push(block);
  }

  return result;
}

function stripPureInternalLinkLists(blocks: ContentBlock[]): ContentBlock[] {
  const isInternalPath = (t: string) => /^\/(guide|cars|heritage|column)\/[a-z0-9\-]+/i.test(t.trim());

  return blocks.filter((b) => {
    if (b.type !== "list") return true;
    const items = b.items ?? [];
    if (items.length === 0) return true;
    // If the entire list is only internal paths, treat as navigation (remove from本文)
    return !items.every((it) => isInternalPath(it));
  });
}

function mapCategoryLabel(category?: string | null): string {
  switch ((category ?? "").toUpperCase()) {
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル";
    case "MONEY":
      return "お金・維持費";
    case "BUY":
      return "購入計画";
    case "SELL":
      return "売却・乗り換え";
    case "INSURANCE":
      return "保険・補償";
    case "LEASE":
      return "リース・残価";
    case "GOODS":
      return "カー用品";
    case "DRIVING":
      return "運転";
    case "LIFE":
      return "生活";
    default:
      return category ? String(category) : "";
  }
}

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "ガイドが見つかりません",
      description: "指定されたガイドページが見つかりませんでした。",
    };
  }

  const titleBase = buildGuideTitleBase(guide);
  const titleFull = withBrand(titleBase);
  const description = buildGuideDescription(guide);

  const url = `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`;

  const rawImage = ((guide as any).ogImageUrl ?? guide.heroImage ?? null) as
    | string
    | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  return {
    title: titleBase,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: titleFull,
      description,
      type: "article",
      url,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images: [image],
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) notFound();

  const allGuides = await getAllGuides();
  const guideTitleBySlug = new Map(allGuides.map((g) => [g.slug, g.title] as const));

  const dateLabel = formatDate(guide.publishedAt ?? guide.updatedAt ?? null);
  const badge = (guide.tags ?? [])[0] ?? mapCategoryLabel(guide.category);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GUIDE",
        item: `${getSiteUrl()}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`,
      },
    ],
  };

  const { blocks: rawBlocks } = parseBody(guide.body);

  // 1) おすすめポイント（結論/まとめ）
  const takeaways = extractBulletsByHeading(rawBlocks, (t) => /結論|まとめ|要点/.test(t));

  // 2) CHECK POINT（チェックリスト）
  const check = extractBulletsByHeading(takeaways.stripped, (t) => /チェック|check\s*point|check\s*list/i.test(t));

  // 3) 本文から「関連記事」などのナビ用URLを取り除く（内部回遊はカードで出す）
  const strippedInternal = stripHeadingWithList(
    check.stripped,
    (t) => /関連記事|関連(?:ガイド|記事|読む|リンク)|内部回遊/i.test(t),
  );
  const blocks = stripPureInternalLinkLists(strippedInternal);

  const toc = blocks
    .filter((b) => b.type === "heading" && b.heading.level === 2)
    .map((b) => (b.type === "heading" ? b.heading : null))
    .filter(Boolean) as HeadingBlock[];

  // 関連ガイド（表示は少なめに固定）
  const related = await getRelatedGuidesV12(guide, 3);

  // H2 をステップとして番号付け
  let step = 0;
  let renderedSteps = 0;

  const renderCheckPointAfterStep = 2;
  const checkItems = (check.extracted ?? []).slice(0, 5);
  const takeawayItems = (takeaways.extracted ?? []).slice(0, 4);

  return (
    <main className="bg-site text-text-main">
      <JsonLd id="jsonld-guide-detail-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        {/* top */}
        <Breadcrumb
          items={[
            { label: "HOME", href: "/" },
            { label: "GUIDE", href: "/guide" },
            { label: guide.title },
          ]}
        />

        {/* title */}
        <header className="mt-10">
          <h1 className="serif-heading text-[26px] leading-[1.35] tracking-tight text-[#222222] sm:text-[34px]">
            {guide.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            {badge ? (
              <span className="inline-flex items-center rounded-full bg-[#222222] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white">
                {badge}
              </span>
            ) : null}
            {dateLabel ? (
              <span className="text-[10px] tracking-[0.18em] text-[#222222]/45">
                {dateLabel}
              </span>
            ) : null}
          </div>
        </header>

        {/* hero */}
        {guide.heroImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#222222]/10 bg-[#F3F4F6] shadow-soft-card">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={guide.heroImage}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        {/* takeaways box */}
        {takeawayItems.length > 0 ? (
          <section className="mt-8" aria-label="おすすめポイント">
            <div className="rounded-2xl border border-[#EDE4D8] bg-[#FAF7F1] p-6 shadow-soft">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </span>
                <h2 className="text-[12px] font-semibold tracking-[0.16em] text-[#222222]">
                  おすすめポイント
                </h2>
              </div>

              <ul className="mt-4 space-y-3 text-[12px] leading-relaxed text-[#222222]/70">
                {takeawayItems.map((t, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-[6px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                      <span className="text-[12px] font-bold">+</span>
                    </span>
                    <span className="flex-1">{renderTextWithGuideLinks(t, guideTitleBySlug)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* toc */}
        {toc.length > 1 ? (
          <section className="mt-10" aria-label="目次">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[12px] font-semibold tracking-[0.16em] text-[#222222]">
                目次
              </h2>
              <span className="text-[10px] tracking-[0.16em] text-[#222222]/45">
                カードを押すと該当セクションへジャンプします
              </span>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {toc.map((h, index) => (
                <Link
                  key={h.id}
                  href={`#${h.id}`}
                  className="min-w-[220px] rounded-2xl border border-[#222222]/10 bg-white px-4 py-4 shadow-soft-card hover:border-[#0ABAB5]/35"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-[14px] font-semibold text-[#0ABAB5]">
                      {index + 1}.
                    </span>
                    <span className="serif-heading line-clamp-2 text-[13px] leading-relaxed text-[#222222]">
                      {h.text}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* body */}
        <article className="mt-10">
          <div className="space-y-6">
            {blocks.map((b, idx) => {
              if (b.type === "heading") {
                if (b.heading.level === 2) {
                  step += 1;
                  renderedSteps = step;
                  return (
                    <div
                      key={`${b.heading.id}-${idx}`}
                      id={b.heading.id}
                      className="scroll-mt-28 pt-2"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="text-[18px] font-semibold text-[#0ABAB5]">
                          {step}.
                        </span>
                        <h2 className="serif-heading text-[18px] leading-relaxed text-[#222222] sm:text-[20px]">
                          {b.heading.text}
                        </h2>
                      </div>
                      <div className="mt-2 h-px w-10 bg-[#0ABAB5]/35" />

                      {/* CHECK POINT を 2つ目の見出しのあとに差し込む */}
                      {checkItems.length > 0 && step === renderCheckPointAfterStep ? (
                        <div className="mt-6 rounded-2xl border border-[#D7EAEE] bg-[#EEF6F8] p-6 shadow-soft">
                          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#222222]/70">
                            — 事前に CHECK POINT
                          </p>
                          <ul className="mt-4 space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
                            {checkItems.map((t, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#222222]/35" />
                                <span className="flex-1">{renderTextWithGuideLinks(t, guideTitleBySlug)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <h3
                    key={`${b.heading.id}-${idx}`}
                    id={b.heading.id}
                    className="serif-heading scroll-mt-28 pt-2 text-[15px] font-semibold leading-relaxed text-[#222222]"
                  >
                    {b.heading.text}
                  </h3>
                );
              }

              if (b.type === "paragraph") {
                return (
                  <p
                    key={idx}
                    className="text-[13px] leading-relaxed text-[#222222]/70"
                  >
                    {renderTextWithGuideLinks(b.text, guideTitleBySlug)}
                  </p>
                );
              }

              if (b.type === "list") {
                return (
                  <ul key={idx} className="space-y-2 text-[13px] leading-relaxed text-[#222222]/70">
                    {b.items.map((t, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#222222]/35" />
                        <span className="flex-1">{renderTextWithGuideLinks(t, guideTitleBySlug)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              if (b.type === "hr") {
                return <hr key={idx} className="my-8 border-[#222222]/10" />;
              }

              return null;
            })}

            {/* 見出しが 2未満で CHECK POINT を出す場所が無い場合 */}
            {checkItems.length > 0 && renderedSteps < renderCheckPointAfterStep ? (
              <div className="rounded-2xl border border-[#D7EAEE] bg-[#EEF6F8] p-6 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#222222]/70">
                  — 事前に CHECK POINT
                </p>
                <ul className="mt-4 space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
                  {checkItems.map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#222222]/35" />
                      <span className="flex-1">{renderTextWithGuideLinks(t, guideTitleBySlug)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </article>

        {/* internal navigation */}
        {related.length > 0 ? (
          <section className="mt-12" aria-label="関連記事">
            <div className="flex items-baseline justify-between">
              <h2 className="serif-heading text-[16px] text-[#222222]">関連記事</h2>
              <Link
                href="/guide"
                className="text-[11px] tracking-[0.16em] text-[#222222]/55 hover:text-[#0ABAB5]"
              >
                すべてのGUIDEへ
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {related.map((g) => (
                <ContentRowCard
                  key={g.slug}
                  href={`/guide/${encodeURIComponent(g.slug)}`}
                  title={g.title}
                  excerpt={g.summary}
                  imageSrc={g.heroImage || null}
                  date={null}
                  badge={null}
                  size="md"
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
