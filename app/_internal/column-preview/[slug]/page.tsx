import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ColumnDecisionPage } from "@/components/column/detail/ColumnDecisionPage";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { getColumnBySlugIncludingNonPublished, getRelatedColumnsV12 } from "@/lib/columns";
import {
  countDecisionMarkdownHeadings,
  getDecisionColumnAuditBody,
  getDecisionColumnStats,
  isDecisionColumn,
} from "@/lib/decision-article";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { evaluateColumnIndexability } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "COLUMN Preview (Internal)",
  description: "Preview draft COLUMN content and structure",
  robots: NOINDEX_ROBOTS,
};

type Props = { params: { slug: string } };

type Heading = { id: string; text: string; level: 2 | 3 };

type ParagraphBlock = { type: "paragraph"; text: string };
type HeadingBlock = { type: "heading"; heading: Heading };
type ListBlock = { type: "list"; items: string[] };

type Block = ParagraphBlock | HeadingBlock | ListBlock;

function parseBodyToBlocks(body: string): { blocks: Block[]; headings: Heading[] } {
  const lines = (body ?? "").split(/\r?\n/);
  const blocks: Block[] = [];
  const headings: Heading[] = [];

  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", text: currentParagraph.join(" ") });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "list", items: [...currentList] });
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      const text = line.slice(4).trim();
      const heading: Heading = { id: `h3-${index}`, text, level: 3 };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = line.slice(3).trim();
      const heading: Heading = { id: `h2-${index}`, text, level: 2 };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
      return;
    }

    flushList();
    currentParagraph.push(line);
  });

  flushParagraph();
  flushList();

  return { blocks, headings };
}

function safeLen(input: unknown): number {
  if (typeof input !== "string") return 0;
  return input.trim().length;
}

export default async function ColumnPreviewPage({ params }: Props) {
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  if (!slug) notFound();

  const item = await getColumnBySlugIncludingNonPublished(slug);
  if (!item) notFound();

  const report = evaluateColumnIndexability(item);
  const isDecision = isDecisionColumn(item);
  const auditBody = isDecision ? getDecisionColumnAuditBody(item) : item.body ?? "";
  const parsed = parseBodyToBlocks(auditBody);
  const bodyLen = safeLen(auditBody);
  const headingCount = isDecision ? countDecisionMarkdownHeadings(auditBody) : parsed.headings.length;
  const stats = isDecision ? getDecisionColumnStats(item) : null;

  const related = isDecision ? await getRelatedColumnsV12(item, 3) : [];
  const linkIndex = isDecision
    ? await getInternalLinkIndex()
    : ({} as Awaited<ReturnType<typeof getInternalLinkIndex>>);

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-6 rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
            <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">INTERNAL / COLUMN PREVIEW</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#222222]">{item.titleJa ?? item.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-[#222222]/80">
              <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">
                slug: <span className="font-mono">{item.slug}</span>
              </span>
              <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">variant: {item.layoutVariant ?? "legacy"}</span>
              <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">status: {item.status}</span>
              <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">noindex: {item.noindex ? "true" : ""}</span>
              <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">bodyLen: {bodyLen}</span>
              <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">headings: {headingCount}</span>

              <Link className="ml-auto text-sky-700 underline" href="/_internal/column-backlog">
                ← Backlog
              </Link>
            </div>

            <div className="mt-3 rounded-2xl border border-[#222222]/10 bg-white/70 p-4 text-sm text-[#222222]/80">
              <p className="font-semibold text-[#222222]">Indexability summary</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Indexability 判定: {report.indexable ? "indexable" : "non-indexable"}</li>
                <li>理由: {report.reasons.join(", ") || "none"}</li>
                {stats ? (
                  <>
                    <li>keyPoints: {stats.keyPointsCount}</li>
                    <li>checkpoints: {stats.checkpointsCount}</li>
                    <li>faq: {stats.faqCount}</li>
                    <li>detailSections: {stats.detailSectionsCount}</li>
                    <li>detailBlocks: {stats.detailBlocksCount}</li>
                    <li>sources: {stats.sourcesCount}</li>
                  </>
                ) : (
                  <li>non-decision preview を表示しています</li>
                )}
              </ul>
            </div>
          </div>

          {isDecision ? (
            <div className="rounded-3xl border border-[#222222]/10 bg-white/92 p-2 text-[#222222] shadow-soft-card backdrop-blur">
              <ColumnDecisionPage item={item} related={related} linkIndex={linkIndex} />
            </div>
          ) : (
            <div className="rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
              <section className="rounded-2xl border border-[#222222]/10 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#222222]">Body Preview</h2>

                <div className="prose prose-slate mt-4 max-w-none">
                  {parsed.blocks.map((block, index) => {
                    if (block.type === "heading") {
                      if (block.heading.level === 2) {
                        return (
                          <h2 key={block.heading.id ?? index} id={block.heading.id}>
                            {block.heading.text}
                          </h2>
                        );
                      }
                      return (
                        <h3 key={block.heading.id ?? index} id={block.heading.id}>
                          {block.heading.text}
                        </h3>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul key={`list-${index}`}>
                          {block.items.map((entry, itemIndex) => (
                            <li key={`${index}-${itemIndex}`}>{entry}</li>
                          ))}
                        </ul>
                      );
                    }

                    return <p key={`paragraph-${index}`}>{block.text}</p>;
                  })}
                </div>
              </section>
            </div>
          )}

          <div className="mt-6 text-xs text-white/70">
            <p>※ このページは internal 用（robots: noindex）です。</p>
          </div>
        </div>
      </div>
    </main>
  );
}
