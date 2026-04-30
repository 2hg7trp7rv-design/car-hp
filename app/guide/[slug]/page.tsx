import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { PullQuote } from "@/components/content/PullQuote";
import { Checklist } from "@/components/content/Checklist";
import { ScrollSpecTable } from "@/components/content/ScrollSpecTable";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { JsonLd } from "@/components/seo/JsonLd";
import { CbjRichBlock } from "@/components/content/CbjRichBlock";
import { GuideDecisionPage } from "@/components/guide/detail/GuideDecisionPage";

import { getSiteUrl } from "@/lib/site";
import { resolveEditorialImage } from "@/lib/editorial-media";
import { resolveOgImageUrl } from "@/lib/public-assets";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";
import { getAllGuides, getGuideBySlug, getRelatedGuidesV12 } from "@/lib/guides";
import type { GuideItem } from "@/lib/guides";
import { resolveGuideDisplayTag } from "@/lib/display-tags";
import { resolveGuideCardImage } from "@/lib/display-tag-media";
import { isIndexableGuide } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getEditorialSurfaceClass } from "@/lib/detail-theme";
import { humanizeUpdateReason } from "@/lib/update-reason";
import { buildEditorialPullQuote } from "@/lib/editorial-quote";
import { normalizeEditorialHeadingLabel } from "@/lib/editorial-heading";



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
  // "quote" is used as a lightweight emphasis line (not a card)
  | { type: "quote"; text: string }
  | { type: "image"; src: string; alt: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; lang: string; code: string }
  | { type: "cbj"; lang: string; raw: string; config: unknown }
  | { type: "hr" };

function stripLeadingStepNumber(text: string): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  // Remove leading numeric prefixes like "1.", "1.1", "2：" etc.
  return t.replace(/^\s*\d+(?:\.\d+)?\s*[.．:：]?\s*/, "");
}

function splitEmphasisLines(raw: string): string[] {
  let t = (raw ?? "").trim();
  if (!t) return [];

  // Preserve intended line breaks when multiple quoted phrases are concatenated (e.g. "A""B").
  t = t.replace(/""/g, '"\n"');
  // Also handle separated quotes like "A" "B".
  t = t.replace(/"\s+"/g, '"\n"');

  // Remove quote markers used for emphasis.
  t = t.replace(/["“”＂]/g, "");
  t = t.replace(/[「」『』]/g, "");

  // Normalize separators to new lines.
  t = t.replace(/\s*\/\s*/g, "\n");
  t = t.replace(/\s*／\s*/g, "\n");

  // When quoted phrases are separated by spaces (often the case in raw manuscripts),
  // treat the gaps as intended line breaks.
  t = t.replace(/\u3000+/g, "\n");
  t = t.replace(/\s{2,}/g, "\n");

  // Cleanup
  t = t.replace(/\s{2,}/g, " ");

  return t
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}


// Alias kept for consistency with other content pages.
// We intentionally keep `formatDate` as the core implementation and expose
// `formatDateLabel` as a thin wrapper used by the update-history UI.
function formatDateLabel(iso?: string | null): string {
  return formatDate(iso);
}


function formatSentenceBreaks(text: string): string {
  const src = (text ?? "").toString();
  if (!src) return "";
  return src.replace(/。/g, "。\n").replace(/\n{3,}/g, "\n\n").trim();
}

function slugifyId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseMarkdownImageLine(line: string): { alt: string; src: string } | null {
  const t = line.trim();
  const m = t.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
  if (!m) return null;
  const alt = (m[1] ?? "").trim();
  const src = (m[2] ?? "").trim();
  if (!src) return null;
  return { alt, src };
}

function isStandaloneQuoteLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith("\"") && t.endsWith("\"") && t.length >= 3) return true;
  if (t.startsWith("「") && t.endsWith("」") && t.length >= 3) return true;
  if (t.startsWith("『") && t.endsWith("』") && t.length >= 3) return true;
  return false;
}

function parseBody(body: string | undefined): { blocks: ContentBlock[] } {
  const raw = body ?? "";
  const lines = raw.split(/\r?\n/);

  const blocks: ContentBlock[] = [];

  // Minimal markdown pipe-table parser (supports: |a|b| + separator row |---|---|)
  const splitPipeRow = (l: string): string[] => {
    const trimmed = (l ?? "").toString().trim();
    if (!trimmed || !trimmed.includes("|")) return [];
    let parts = trimmed.split("|").map((s) => s.trim());
    if (parts[0] === "") parts = parts.slice(1);
    if (parts[parts.length - 1] === "") parts = parts.slice(0, -1);
    return parts;
  };

  const isSeparatorRow = (l: string): boolean => {
    const cells = splitPipeRow(l);
    if (cells.length < 2) return false;
    return cells.every((c) => /^:?-{3,}:?$/.test(c));
  };

  const isTableStartAt = (idx: number): boolean => {
    const header = splitPipeRow(lines[idx] ?? "");
    if (header.length < 2) return false;
    return isSeparatorRow(lines[idx + 1] ?? "");
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";

    // empty
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // code block / CBJ rich block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim() || "text";
      i += 1;

      const codeLines: string[] = [];
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i += 1;
      }

      // consume closing fence
      if (i < lines.length && (lines[i] ?? "").trim().startsWith("```")) i += 1;

      const code = codeLines.join("\n");
      const isCbj = ["cbj", "cbj-block", "cbjjson"].includes(lang);

      if (isCbj) {
        try {
          const parsed = JSON.parse(code);
          blocks.push({ type: "cbj", lang, raw: code, config: parsed });
        } catch {
          // If JSON is invalid, show it as code (do not drop).
          blocks.push({ type: "code", lang, code });
        }
      } else {
        blocks.push({ type: "code", lang, code });
      }

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

    // markdown image
    const img = parseMarkdownImageLine(line);
    if (img) {
      blocks.push({ type: "image", src: img.src, alt: img.alt });
      i += 1;
      continue;
    }

    // markdown pipe-table
    if (isTableStartAt(i)) {
      const headers = splitPipeRow(lines[i] ?? "");
      i += 2; // skip header + separator

      const rows: string[][] = [];
      while (i < lines.length) {
        const rowLine = lines[i] ?? "";
        if (!rowLine.trim()) break;
        if (rowLine.trim().startsWith("```")) break;
        if (/^(##|###)\s+/.test(rowLine)) break;
        if (/^---+\s*$/.test(rowLine.trim())) break;
        if (/^[-*]\s+/.test(rowLine)) break;
        if (parseMarkdownImageLine(rowLine)) break;
        if (isStandaloneQuoteLine(rowLine)) break;
        if (!rowLine.includes("|")) break;

        const cells = splitPipeRow(rowLine);
        if (cells.length === 0) break;
        rows.push(cells);
        i += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // pull quote (standalone)
    if (isStandaloneQuoteLine(line)) {
      blocks.push({ type: "quote", text: line.trim() });
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
    while (
      i < lines.length &&
      lines[i] &&
      !(lines[i] ?? "").trim().startsWith("```") &&
      !/^(##|###)\s+/.test(lines[i] ?? "") &&
      !isTableStartAt(i) &&
      !/^[-*]\s+/.test(lines[i] ?? "") &&
      !/^---+\s*$/.test((lines[i] ?? "").trim()) &&
      !parseMarkdownImageLine(lines[i] ?? "") &&
      !isStandaloneQuoteLine(lines[i] ?? "")
    ) {
      if (!lines[i]?.trim()) break;
      paragraph += " " + (lines[i] ?? "").trim();
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph });
  }

  return { blocks };
}

function extractBulletsByHeading(blocks: ContentBlock[], matcher: (_heading: string) => boolean): {
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
  matcher: (_heading: string) => boolean,
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
  const isInternalPath = (text: string) => /^\/(guide|cars|heritage|column)\/[a-z0-9-]+/i.test(text.trim());

  return blocks.filter((b) => {
    if (b.type !== "list") return true;
    const items = b.items ?? [];
    if (items.length === 0) return true;
    // If the entire list is only internal paths, treat as navigation (remove from本文)
    return !items.every((it) => isInternalPath(it));
  });
}


function normalizeGuideHeading(text: string): string {
  return stripLeadingStepNumber(text)
    .replace(/[【】「」『』]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function isTakeawayHeading(text: string): boolean {
  const normalized = normalizeGuideHeading(text);
  return [
    "結論",
    "要点",
    "ポイント",
    "先に結論",
    "この記事で分かること",
    "この記事の要点",
  ].some((keyword) => normalized.includes(keyword));
}

function isCheckpointHeading(text: string): boolean {
  const normalized = normalizeGuideHeading(text);
  return [
    "チェックリスト",
    "チェックポイント",
    "先に確認するチェックリスト",
    "先に確認したいこと",
    "売却当日のチェックリスト",
  ].some((keyword) => normalized.includes(keyword));
}

function isRelatedLinksHeading(text: string): boolean {
  const normalized = normalizeGuideHeading(text);
  return ["関連記事", "あわせて読みたい", "関連リンク", "参考リンク"].some((keyword) =>
    normalized.includes(keyword),
  );
}

function extractTakeaways(body: string): {
  extracted: string[];
  stripped: ContentBlock[];
  headingText?: string;
} {
  return extractBulletsByHeading(parseBody(body).blocks, isTakeawayHeading);
}

function extractCheckpoints(body: string): {
  extracted: string[];
  stripped: ContentBlock[];
  headingText?: string;
} {
  return extractBulletsByHeading(parseBody(body).blocks, isCheckpointHeading);
}

function parseGuideBody(body: string): ContentBlock[] {
  let blocks = parseBody(body).blocks;

  blocks = stripHeadingWithList(blocks, isTakeawayHeading);
  blocks = stripHeadingWithList(blocks, isCheckpointHeading);
  blocks = stripHeadingWithList(blocks, isRelatedLinksHeading);
  blocks = stripPureInternalLinkLists(blocks);

  return blocks;
}


function resolveGuidePillar(guide: GuideItem): {
  href: string;
  label: string;
  description: string;
} {
  const category = String(guide.category ?? "").toUpperCase();
  const title = String(guide.title ?? "");

  // 基本は「目的別に戻す」= 企画書の Pillar/Cluster 運用を強制する導線。
  // 迷う場合は GUIDE 一覧へフォールバックする。
  if (category === "SELL") {
    return {
      href: "/guide/hub-sell",
      label: "売却・乗り換えガイド",
      description:
        "この記事の前提（相場の掴み方・査定の出し方・手放し方の順序）は、売却・乗り換えガイドに置いています。",
    };
  }

  if (category === "BUY") {
    return {
      href: "/guide/hub-usedcar",
      label: "中古車の探し方",
      description:
        "この記事の前提（相場・個体差・チェックの型）は、中古車の探し方ガイドに置いています。",
    };
  }

  if (category === "MONEY") {
    return {
      href: "/guide/hub-loan",
      label: "ローン・支払い方法ガイド",
      description:
        "この記事の前提（支払い設計・金利・残債の考え方）は、ローン・支払い方法ガイドに置いています。",
    };
  }

  if (category === "TROUBLE") {
    return {
      href: "/guide/hub-import-trouble",
      label: "トラブル対応",
      description:
        "症状別の判断・危険判定・修理情報は、トラブル対応に集約しています。",
    };
  }

  // 雑にキーワードで補正（カテゴリが未設定/曖昧な場合）
  if (title.includes("車検")) {
    return {
      href: "/guide/hub-shaken",
      label: "車検",
      description: "車検の前提（通す/通さない、費用の内訳、段取り）は車検に集約しています。",
    };
  }

  if (title.includes("保険")) {
    return {
      href: "/guide/insurance",
      label: "保険の見直し",
      description:
        "補償の考え方と比較の順序を、保険のまとめページで確認。",
    };
  }

  if (title.includes("リース") || title.includes("サブスク")) {
    return {
      href: "/guide/lease",
      label: "リース/サブスク",
      description:
        "契約で迷うポイントは、リース/サブスクのまとめページで確認。",
    };
  }

  if (
    category === "MAINTENANCE" ||
    category === "MAINTENANCE_COST" ||
    title.includes("洗車") ||
    title.includes("ドラレコ") ||
    title.includes("バッテリー")
  ) {
    return {
      href: "/guide/maintenance",
      label: "メンテ用品",
      description:
        "最低限そろえる順番と定番は、メンテ用品のまとめページで確認。",
    };
  }

  return {
    href: "/guide",
    label: "ガイド一覧",
    description: "関連する判断材料は、ガイド一覧からまとめて辿れます。",
  };
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
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

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
  robots: isIndexableGuide(guide) ? undefined : NOINDEX_ROBOTS,
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) notFound();

  if (guide.layoutVariant === "decision-v1") {
    const related = await getRelatedGuidesV12(guide, 3);
    const linkIndex = await getInternalLinkIndex();
    return <GuideDecisionPage guide={guide} related={related} linkIndex={linkIndex} />;
  }

  const dateLabel = formatDate(guide.publishedAt ?? guide.updatedAt ?? null);
  const badge = resolveGuideDisplayTag(guide);
  const pillar = resolveGuidePillar(guide);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ガイド",
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

  const siteUrl = getSiteUrl();
  const guideUrl = `${siteUrl}/guide/${encodeURIComponent(guide.slug)}`;
  const imageUrl = resolveOgImageUrl(
    (((guide as any).ogImageUrl ?? guide.thumbnail ?? guide.heroImage ?? null) as string | null),
    siteUrl,
  );

  const heroMedia = resolveEditorialImage(
    ((guide.heroImage ?? (guide as any).ogImageUrl ?? null) as string | null),
    "guide",
    "desktop",
    guide.slug,
  );
  const safeHeroImage = heroMedia.src;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": guideUrl,
    },
    headline: guide.title,
    description: guide.description,
    url: guideUrl,
    inLanguage: "ja",
    image: [imageUrl],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
  };

  const takeaways = extractTakeaways(guide.body ?? "");
  const check = extractCheckpoints(guide.body ?? "");
  const blocks = parseGuideBody(guide.body ?? "");
  const contentBlocks: ContentBlock[] =
    blocks.some((b) => b.type === "heading" && b.heading.level === 2)
      ? blocks
      : [
          {
            type: "heading",
            heading: { id: "content", text: "ここから読む", level: 2 },
          },
          ...blocks,
        ];

  const articleSections = (() => {
    const sections: Array<{ id: string; title: string; blocks: ContentBlock[] }> = [];
    let current: { id: string; title: string; blocks: ContentBlock[] } | null = null;

    for (const block of contentBlocks) {
      if (block.type === "heading" && block.heading.level === 2) {
        if (current) sections.push(current);
        current = {
          id: block.heading.id,
          title: normalizeEditorialHeadingLabel(stripLeadingStepNumber(block.heading.text)),
          blocks: [],
        };
        continue;
      }

      if (!current) {
        current = { id: "content", title: "本文", blocks: [] };
      }
      current.blocks.push(block);
    }

    if (current) sections.push(current);
    return sections;
  })();

  const toc = articleSections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  const related = await getRelatedGuidesV12(guide, 3);
  const relatedLead = related.slice(0, 2);
  const relatedRows = related.slice(2);

  const linkIndex = await getInternalLinkIndex();
  const takeawaysItems = (takeaways.extracted ?? []).slice(0, 4);
  const checkItems = (check.extracted ?? []).slice(0, 5);

  const updatedLabel = guide.updatedAt ? `${formatDate(guide.updatedAt)} 更新` : dateLabel ? `${dateLabel} 更新` : "";
  const leadText = (guide.lead ?? guide.summary ?? "").trim() || null;
  const introParagraph =
    articleSections
      .flatMap((section) => section.blocks)
      .find(
        (block): block is Extract<ContentBlock, { type: "paragraph" }> => block.type === "paragraph",
      )?.text ?? null;
  const introQuoteText = buildEditorialPullQuote([
    guide.subtitle,
    guide.lead,
    guide.summary,
    takeawaysItems[0],
    introParagraph,
  ]);
  const checkPointSectionIndex = articleSections.length > 1 ? 1 : 0;

  return (
    <main className="detail-page">
      <JsonLd id="jsonld-guide-detail-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-guide-detail-article" data={articleJsonLd} />

      <div id="top" />

      <div className="detail-shell pb-24 pt-24 sm:pt-28">
        <Breadcrumb
          tone="paper"
          items={[
            { label: "ホーム", href: "/" },
            { label: "ガイド", href: "/guide" },
            { label: guide.title },
          ]}
        />

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
          <div className="order-1">
            <div className="detail-photo-frame relative aspect-[16/10] w-full">
              {safeHeroImage ? (
                <Image
                  src={safeHeroImage}
                  alt={guide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover saturate-[0.93]"
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(160deg,rgba(228,235,224,0.92),rgba(246,242,235,1))] p-7">
                  <div>
                    <p className="detail-kicker">ガイド</p>
                    <p className="mt-3 max-w-[16ch] text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
                      {guide.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-2">
            <div className="flex flex-wrap items-center gap-2">
              {badge ? <span className="detail-chip detail-chip-accent">{badge}</span> : null}
              {updatedLabel ? <span className="detail-chip">{updatedLabel}</span> : null}
            </div>

            <h1 className="page-title mt-5 max-w-[12ch]">{guide.title}</h1>

            {guide.subtitle ? (
              <p className="mt-4 text-[14px] leading-relaxed tracking-[0.08em] text-[var(--text-tertiary)]">
                {guide.subtitle}
              </p>
            ) : null}

            {leadText ? <p className="detail-lead mt-6 max-w-[40rem]">{leadText}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={pillar.href} className="detail-button-secondary">
                {pillar.label}へ
                <span aria-hidden>→</span>
              </Link>
              <Link href="/guide" className="detail-button">
                ガイド一覧へ
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {takeawaysItems.length > 0 ? (
          <section className="mt-8">
            <section className="detail-card-wash p-6 sm:p-8" aria-label="おすすめポイント">
              <p className="detail-kicker">要点</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                押さえておきたい点
              </h2>

              <ul className="mt-5 space-y-5">
                {takeawaysItems.map((t, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-[0.55em] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(27,63,229,0.12)] text-[var(--accent-strong)] shadow-soft">
                      <span className="text-[14px] font-bold">+</span>
                    </span>
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
          <section className="mt-10" aria-label="目次">
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
                {checkItems.length > 0 && secIndex === checkPointSectionIndex ? (
                  <div className="detail-card-fog mb-8 p-6">
                    <p className="detail-kicker">確認ポイント</p>
                    <p className="mt-2 text-[16px] font-semibold text-[var(--text-primary)]">
                      押さえておきたい点
                    </p>
                    <Checklist
                      items={checkItems}
                      idPrefix={`guide-${guide.slug}-checkpoint`}
                      linkIndex={linkIndex}
                    />
                  </div>
                ) : null}

                <div className="space-y-8 cb-prose">
                  {section.blocks.map((b, idx) => {
                    if (b.type === "heading") {
                      return (
                        <h3
                          key={`${b.heading.id}-${idx}`}
                          id={b.heading.id}
                          className="cb-prose-block scroll-mt-28 cb-stage-h3 pt-2"
                        >
                          {normalizeEditorialHeadingLabel(b.heading.text)}
                        </h3>
                      );
                    }

                    if (b.type === "paragraph") {
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

                    if (b.type === "quote") {
                      const lines = splitEmphasisLines(b.text);
                      return (
                        <div key={idx} className="cbj-pullquote space-y-3">
                          {lines.map((ln, j) => (
                            <TextWithInternalLinkCards
                              key={`${idx}-${j}`}
                              text={ln}
                              linkIndex={linkIndex}
                              as="p"
                              className="cb-prose-block"
                              textClassName="cbj-pullquote-text"
                            />
                          ))}
                        </div>
                      );
                    }

                    if (b.type === "image") {
                      return (
                        <figure key={idx} className="cb-prose-block">
                          <div className="detail-photo-frame overflow-hidden">
                            <Image
                              src={b.src}
                              alt={b.alt || ""}
                              width={1600}
                              height={900}
                              sizes="(max-width: 1024px) 100vw, 760px"
                              className="h-auto w-full object-cover"
                            />
                          </div>
                          {b.alt ? <figcaption className="detail-photo-caption">{b.alt}</figcaption> : null}
                        </figure>
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
                      return <ScrollSpecTable key={idx} headers={b.headers} rows={b.rows} />;
                    }

                    if (b.type === "list") {
                      return (
                        <ul key={idx} className="cb-prose-block space-y-4">
                          {b.items.map((t, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
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
                      return <hr key={idx} className="my-8 border-[rgba(14,12,10,0.08)]" />;
                    }

                    return null;
                  })}
                </div>
              </div>
            </section>
          ))}

          {(guide.updateReason || (guide.sources && guide.sources.length > 0)) && (
            <div className="space-y-6">
              {guide.updateReason ? (
                <section className="detail-card-muted p-6">
                  <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">更新履歴</h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {guide.updatedAt ? `${formatDateLabel(guide.updatedAt)}：` : ""}
                    {humanizeUpdateReason(guide.updateReason)}
                  </p>
                </section>
              ) : null}

              {guide.sources && guide.sources.length > 0 ? (
                <section className="detail-card-muted p-6">
                  <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">出典・参考資料</h2>
                  <ul className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    {guide.sources.map((s, i) => {
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
          <section className="mt-14" aria-label="関連記事">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">関連記事</h2>
              <Link href="/guide" className="text-[12px] tracking-[0.18em] text-[var(--accent-strong)] hover:text-[var(--accent-base)]">
                ガイド一覧へ
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedLead.map((g) => (
                <ContentGridCard
                  key={g.slug}
                  href={`/guide/${encodeURIComponent(g.slug)}`}
                  title={g.title}
                  date={formatDate(g.publishedAt ?? g.updatedAt ?? null) || undefined}
                  imageSrc={resolveGuideCardImage(g)}
                  eyebrow={resolveGuideDisplayTag(g)}
                  excerpt={g.summary || g.lead || undefined}
                  aspect="portrait"
                  seedKey={g.slug}
                  posterVariant="guide"
                />
              ))}
            </div>

            {relatedRows.length > 0 ? (
              <div className="mt-6 space-y-3">
                {relatedRows.map((g) => (
                  <ContentRowCard
                    key={g.slug}
                    href={`/guide/${encodeURIComponent(g.slug)}`}
                    title={g.title}
                    excerpt={g.summary || g.lead || undefined}
                    imageSrc={resolveGuideCardImage(g)}
                    date={formatDate(g.publishedAt ?? g.updatedAt ?? null) || null}
                    badge={resolveGuideDisplayTag(g)}
                    badgeTone="accent"
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
          <Link href="/guide" className="detail-button">
            ガイド一覧へ <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
