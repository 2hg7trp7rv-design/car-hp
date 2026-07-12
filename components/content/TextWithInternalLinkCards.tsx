import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { inferKindFromHref } from "@/lib/content/internal-link-index";
import { extractInternalLinksFromText, inlineLabelResolver } from "@/lib/content/text";
import { InternalLinkCard } from "@/components/content/InternalLinkCard";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Props = {
  text: string;
  linkIndex: Record<string, InternalLinkMeta>;
  /**
   * Render text element as:
   * - "p": for paragraphs
   * - "span": for list items / inline blocks
   */
  as?: "p" | "span";
  textClassName?: string;
  textStyle?: CSSProperties;
  cardsClassName?: string;
  className?: string;
  highlights?: string[];
  lineMode?: "sentence" | "natural" | "preserve";
  cardVariant?: "default" | "cbjWorld";
};

const NATURAL_READABLE_CHUNK_LIMIT = 78;
const NATURAL_READABLE_SHORT_LINE_LIMIT = 42;

function resolveTitle(linkIndex: Record<string, InternalLinkMeta>, href: string): string {
  const meta = linkIndex[href];
  if (meta?.title) return meta.title;

  // Fallback: keep it human (do not expose URL).
  const kind = inferKindFromHref(href);
  switch (kind) {
    case "GUIDE":
      return "関連ガイド";
    case "COLUMN":
      return "関連コラム";
    default:
      return "関連ページ";
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedInlineMarkdown(text: string, highlights?: string[]): ReactNode {
  const uniqueHighlights = Array.from(
    new Set((highlights ?? []).map((item) => item.trim()).filter(Boolean)),
  ).sort((a, b) => b.length - a.length);

  if (!text || uniqueHighlights.length === 0) return renderInlineMarkdown(text);

  const pattern = new RegExp(`(${uniqueHighlights.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern).filter((part) => part.length > 0);
  const highlightSet = new Set(uniqueHighlights);

  return (
    <>
      {parts.map((part, index) => {
        if (highlightSet.has(part)) {
          return (
            <span key={index} className="cbj-inline-marker">
              {renderInlineMarkdown(part)}
            </span>
          );
        }
        return <span key={index}>{renderInlineMarkdown(part)}</span>;
      })}
    </>
  );
}

function renderSentenceLines(text: string, highlights?: string[]): ReactNode {
  const lines = String(text ?? "")
    .replace(/([。！？])(?!(?:\n|$))/gu, "$1\n")
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="cbj-sentence-line">
          {renderHighlightedInlineMarkdown(line, highlights)}
        </span>
      ))}
    </>
  );
}

function splitReadableNaturalParagraph(paragraph: string): string[] {
  const source = paragraph.trim().replace(/\n+/gu, " ");
  if (!source) return [];

  const sentences = source.match(/[^。！？]+[。！？]?/gu)?.map((item) => item.trim()).filter(Boolean) ?? [source];
  if (sentences.length <= 1) return [source];

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (!current) {
      current = sentence;
      continue;
    }

    const next = `${current}${sentence}`;
    const shouldJoin =
      next.length <= NATURAL_READABLE_CHUNK_LIMIT && current.length <= NATURAL_READABLE_SHORT_LINE_LIMIT;

    if (shouldJoin) {
      current = next;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function renderNaturalInlineMarkdown(text: string, highlights?: string[]): ReactNode {
  const paragraphs = String(text ?? "")
    .replace(/\r\n?/gu, "\n")
    .split(/\n{2,}/u)
    .flatMap((part) => splitReadableNaturalParagraph(part))
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <span key={index} className="cbj-natural-paragraph">
          {renderHighlightedInlineMarkdown(paragraph, highlights)}
        </span>
      ))}
    </>
  );
}

function renderPreservedInlineMarkdown(text: string, highlights?: string[]): ReactNode {
  const lines = String(text ?? "").split(/(\n+)/u);
  return (
    <>
      {lines.map((part, index) => {
        if (!part) return null;
        if (/^\n+$/u.test(part)) {
          return Array.from(part).map((_, brIndex) => <br key={`${index}-${brIndex}`} />);
        }
        return <span key={index}>{renderHighlightedInlineMarkdown(part, highlights)}</span>;
      })}
    </>
  );
}

export function TextWithInternalLinkCards({
  text,
  linkIndex,
  as = "p",
  textClassName,
  textStyle,
  cardsClassName,
  className,
  highlights,
  lineMode = "sentence",
  cardVariant = "default",
}: Props) {
  const { text: cleaned, internalHrefs } = extractInternalLinksFromText(text, {
    labelResolver: (href) => inlineLabelResolver(linkIndex, href),
  });
  // Only article paths present in the public link index may become cards.
  // The index is built from discoverable content, so noindex/title-only stubs
  // cannot leak back into article navigation.
  const hrefs = internalHrefs.filter((href) => Boolean(href && linkIndex[href]));

  const TextTag: any = as;

  const textNode: ReactNode | null =
    cleaned && cleaned.trim()
      ? (
        <TextTag style={textStyle} className={cn(lineMode === "preserve" && "whitespace-pre-line", textClassName)}>
          {lineMode === "natural"
            ? renderNaturalInlineMarkdown(cleaned, highlights)
            : lineMode === "preserve"
              ? renderPreservedInlineMarkdown(cleaned, highlights)
              : renderSentenceLines(cleaned, highlights)}
        </TextTag>
      )
      : null;

  const cardsNode =
    hrefs.length > 0 ? (
      <div className={cn("mt-5 grid gap-3", cardsClassName)}>
        {hrefs.map((href) => {
          const meta = linkIndex[href];
          const kind = meta?.kind ?? inferKindFromHref(href);
          const title = resolveTitle(linkIndex, href);
          return <InternalLinkCard key={href} href={href} title={title} kind={kind} variant={cardVariant} />;
        })}
      </div>
    ) : null;

  if (!textNode && !cardsNode) return null;

  return (
    <div className={cn("min-w-0", className)}>
      {textNode}
      {cardsNode}
    </div>
  );
}
