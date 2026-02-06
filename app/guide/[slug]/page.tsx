import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { Checklist } from "@/components/content/Checklist";
import { ScrollSpecTable } from "@/components/content/ScrollSpecTable";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";
import { getAllGuides, getGuideBySlug, getRelatedGuidesV12 } from "@/lib/guides";
import type { GuideItem } from "@/lib/guides";
import { isIndexableGuide } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { ExhibitionLabel } from "@/components/content/ExhibitionLabel";


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
  | { type: "hr" };

function normalizeEmphasisText(raw: string): string {
  let t = (raw ?? "").trim();
  if (!t) return "";

  // Keep readability when multiple quoted phrases are concatenated (e.g. "A""B").
  t = t.replace(/""/g, '" / "');

  // Remove quote markers used for emphasis.
  t = t.replace(/["“”＂]/g, "");
  t = t.replace(/[「」『』]/g, "");

  // Normalize whitespace.
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

function stripLeadingStepNumber(text: string): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  // Remove leading numeric prefixes like "1.", "1.1", "2：" etc.
  return t.replace(/^\s*\d+(?:\.\d+)?\s*[\.．:：]?\s*/, "");
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
  t = t.replace(/　+/g, "\n");
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

function renderRichText(text: string, guideTitleBySlug: Map<string, string>): ReactNode {
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < text.length) {
    const start = text.indexOf("**", i);
    if (start === -1) {
      const rest = text.slice(i);
      if (rest) out.push(renderTextWithGuideLinks(rest, guideTitleBySlug));
      break;
    }

    const end = text.indexOf("**", start + 2);
    if (end === -1) {
      const rest = text.slice(i);
      if (rest) out.push(renderTextWithGuideLinks(rest, guideTitleBySlug));
      break;
    }

    const before = text.slice(i, start);
    if (before) out.push(renderTextWithGuideLinks(before, guideTitleBySlug));

    const boldText = text.slice(start + 2, end);
    out.push(
      <strong key={`b-${k++}`} className="text-white">
        {renderTextWithGuideLinks(boldText, guideTitleBySlug)}
      </strong>,
    );

    i = end + 2;
  }

  if (out.length === 0) return null;
  if (out.length === 1) return out[0];
  return out;
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

function resolveGuidePillar(guide: GuideItem): {
  href: string;
  label: string;
  description: string;
} {
  const category = String(guide.category ?? "").toUpperCase();
  const title = String(guide.title ?? "");

  // 基本は「目的別HUBに戻す」= 企画書の Pillar/Cluster 運用を強制するための導線。
  // 迷う場合は GUIDE 一覧へフォールバックする。
  if (category === "SELL") {
    return {
      href: "/guide/hub-sell",
      label: "売却と乗り換えHUB",
      description:
        "この記事の前提（相場の掴み方・査定の出し方・手放し方の順序）は、売却HUBに集約しています。",
    };
  }

  if (category === "BUY") {
    return {
      href: "/guide/hub-usedcar",
      label: "中古車の探し方HUB",
      description:
        "この記事の前提（相場・個体差・チェックの型）は、中古車HUBに集約しています。",
    };
  }

  if (category === "MONEY") {
    return {
      href: "/guide/hub-loan",
      label: "ローンと支払い設計HUB",
      description:
        "この記事の前提（支払い設計・金利・残債の考え方）は、ローンHUBに集約しています。",
    };
  }

  if (category === "TROUBLE") {
    return {
      href: "/guide/hub-import-trouble",
      label: "トラブル対応HUB",
      description:
        "症状別の判断・危険判定・修理の入口は、トラブル対応HUBに集約しています。",
    };
  }

  // 雑にキーワードで補正（カテゴリが未設定/曖昧な場合）
  if (title.includes("車検")) {
    return {
      href: "/guide/hub-shaken",
      label: "車検HUB",
      description: "車検の前提（通す/通さない、費用の内訳、段取り）は車検HUBに集約しています。",
    };
  }

  if (title.includes("保険")) {
    return {
      href: "/guide/insurance",
      label: "保険の見直し（Pillar）",
      description:
        "補償の考え方・比較の順序は、保険のPillarページにまとめています。",
    };
  }

  if (title.includes("リース") || title.includes("サブスク")) {
    return {
      href: "/guide/lease",
      label: "リース/サブスク（Pillar）",
      description:
        "契約で迷うポイント（期間・距離・残価・中途解約）は、リース/サブスクのPillarにまとめています。",
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
      label: "メンテ用品（Pillar）",
      description:
        "最低限そろえる順番と定番は、メンテ用品のPillarページにまとめています。",
    };
  }

  return {
    href: "/guide",
    label: "GUIDE一覧（Pillar）",
    description: "関連する判断材料は GUIDE 一覧からまとめて辿れます。",
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
  robots: isIndexableGuide(guide) ? undefined : NOINDEX_ROBOTS,
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) notFound();

  const allGuides = await getAllGuides();
  const guideTitleBySlug = new Map(allGuides.map((g) => [g.slug, g.title] as const));

  const dateLabel = formatDate(guide.publishedAt ?? guide.updatedAt ?? null);
  const badge = (guide.tags ?? [])[0] ?? mapCategoryLabel(guide.category);

  const pillar = resolveGuidePillar(guide);

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
    .map((b) => (b.type === "heading" ? ({ ...b.heading, text: stripLeadingStepNumber(b.heading.text) } as HeadingBlock) : null))
    .filter(Boolean) as HeadingBlock[];

  // 関連ガイド（表示は少なめに固定）
  const related = await getRelatedGuidesV12(guide, 3);

  // H2 をステップとして番号付け
  let step = 0;
  let renderedSteps = 0;

  const linkIndex = await getInternalLinkIndex();

  const renderCheckPointAfterStep = 2;
  const checkItems = (check.extracted ?? []).slice(0, 5);
  const takeawayItems = (takeaways.extracted ?? []).slice(0, 4);

  return (
    <main className="relative text-white">
      {/* Fixed background (CARS / HERITAGE / GUIDE / COLUMN で共通) */}
      <DetailFixedBackground />
      <JsonLd id="jsonld-guide-detail-breadcrumb" data={breadcrumbData} />

      <div id="top" />

      <div className="page-shell pb-24 pt-24">
        {/* top */}
        <Breadcrumb
          tone="light"
          items={[
            { label: "HOME", href: "/" },
            { label: "GUIDE", href: "/guide" },
            { label: guide.title },
          ]}
        />

        <ExhibitionLabel
          n="03"
          title={ guide.title || guide.slug }
          subtitle={ guide.subtitle || null }
          meta={ guide.publishedAt ? String(guide.publishedAt).slice(0,10) : null }
        />


        {/* title */}
        <header className="mt-10">
          <h1 className="serif-heading text-[26px] leading-[1.35] tracking-tight text-white sm:text-[34px]">
            {guide.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            {badge ? (
              <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur text-[10px] font-semibold tracking-[0.18em] text-white">
                {badge}
              </span>
            ) : null}
            {dateLabel ? (
              <span className="text-[10px] tracking-[0.18em] text-white/55">
                {dateLabel}
              </span>
            ) : null}
          </div>
        </header>

        {/* hero */}
        {guide.heroImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
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
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-6 backdrop-blur ">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0ABAB5] ">
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
                <h2 className="text-[14px] font-semibold tracking-[0.16em] text-white">
                  おすすめポイント
                </h2>
              </div>

              <ul className="mt-5 space-y-5">
                {takeawayItems.map((t, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-[0.55em] inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0ABAB5] ">
                      <span className="text-[14px] font-bold">+</span>
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
            </div>
          </section>
        ) : null}

        
        {/* pillar (本文前半に親Pillarへ戻す導線を固定) */}
        <section className="mt-10">
          <div className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60">
              PILLAR
            </p>
            <p className="mt-2 text-[13px] leading-relaxed tracking-[0.06em] text-white/85">
              {pillar.description}
            </p>
            <Link
              href={pillar.href}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white hover:bg-white/15"
            >
              {pillar.label}へ戻る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

{/* toc */}
        {toc.length > 1 ? (
          <section className="mt-10" aria-label="目次">
            <InThisStoryToc
              items={toc.map((h) => ({ id: h.id, title: stripLeadingStepNumber(h.text) }))}
              sticky
              ariaLabel="ページ内目次"
            />
          </section>
        ) : null}

        {/* body */}
        <article className="mt-10">
          <div className="space-y-14">
            {blocks.map((b, idx) => {
              if (b.type === "heading") {
                if (b.heading.level === 2) {
                  step += 1;
                  renderedSteps = step;
                  const title = stripLeadingStepNumber(b.heading.text);
                  const chapter = String(step).padStart(2, "0");

                  return (
                    <div
                      key={`${b.heading.id}-${idx}`}
                      id={b.heading.id}
                      className={`scroll-mt-28 ${step === 1 ? "" : "mt-16"}`}
                    >
                      <div className="rounded-3xl border border-white/12 bg-black/15 px-7 py-7 backdrop-blur sm:px-9 sm:py-8">
                        <p className="text-[12px] tracking-[0.22em] text-white/65">
                          CHAPTER {chapter}
                        </p>
                        <h2 className="serif-heading mt-3 text-[22px] leading-[1.35] text-white sm:text-[26px]">
                          {title}
                        </h2>
                      </div>

                      {/* CHECK POINT を 2つ目の見出しのあとに差し込む */}
                      {checkItems.length > 0 && step === renderCheckPointAfterStep ? (
                        <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-7 shadow-soft backdrop-blur">
                          <p className="text-[12px] font-semibold tracking-[0.22em] text-white/85">
                            — 事前に CHECK POINT
                          </p>

                          <Checklist
                            items={checkItems}
                            idPrefix={`guide-${guide.slug}-checkpoint`}
                            linkIndex={linkIndex}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <h3
                    key={`${b.heading.id}-${idx}`}
                    id={b.heading.id}
                    className="serif-heading scroll-mt-28 pt-2 text-[18px] font-semibold leading-relaxed text-white"
                  >
                    {b.heading.text}
                  </h3>
                );
              }

              if (b.type === "paragraph") {
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

              if (b.type === "quote") {
                const lines = splitEmphasisLines(b.text);
                return (
                  <div key={idx} className="my-16 space-y-6">
                    {lines.map((ln, j) => (
                      <TextWithInternalLinkCards
                        key={`${idx}-${j}`}
                        text={ln}
                        linkIndex={linkIndex}
                        as="p"
                        textClassName="serif-heading text-[24px] font-semibold leading-[1.55] tracking-[0.08em] text-[#0ABAB5]"
                        textStyle={{ textShadow: "0 0 22px rgba(10,186,181,0.22)" }}
                      />
                    ))}
                  </div>
                );
              }

              if (b.type === "image") {
                return (
                  <figure key={idx} className="relative left-1/2 w-screen -translate-x-1/2 px-2">
                    <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/10 backdrop-blur">
                      <Image
                        src={b.src}
                        alt={b.alt || ""}
                        width={1600}
                        height={900}
                        sizes="100vw"
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </figure>
                );
              }

              if (b.type === "table") {
                return <ScrollSpecTable key={idx} headers={b.headers} rows={b.rows} />;
              }

              if (b.type === "list") {
                return (
                  <ul key={idx} className="space-y-4">
                    {b.items.map((t, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-white/35" />
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
                return <hr key={idx} className="my-8 border-white/15" />;
              }

              return null;
            })}

            {/* 見出しが 2未満で CHECK POINT を出す場所が無い場合 */}
            {checkItems.length > 0 && renderedSteps < renderCheckPointAfterStep ? (
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-6 backdrop-blur ">
                <p className="text-[13px] font-semibold tracking-[0.16em] text-white/85">
                  — 事前に CHECK POINT
                </p>
                <Checklist
                  items={checkItems}
                  idPrefix={`guide-${guide.slug}-checkpoint-fallback`}
                  linkIndex={linkIndex}
                />
              </div>
            ) : null}
          </div>
        </article>

        {/* internal navigation */}
        {related.length > 0 ? (
          <section className="mt-12" aria-label="関連記事">
            <div className="flex items-baseline justify-between">
              <h2 className="serif-heading text-[18px] text-white">関連記事</h2>
              <Link
                href="/guide"
                className="text-[13px] tracking-[0.16em] text-white/70 hover:text-[#0ABAB5]"
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