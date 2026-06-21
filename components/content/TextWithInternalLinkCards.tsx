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
};

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
    case "CARS":
      return "関連車種";
    case "HERITAGE":
      return "関連する系譜";
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

export function TextWithInternalLinkCards({
  text,
  linkIndex,
  as = "p",
  textClassName,
  textStyle,
  cardsClassName,
  className,
  highlights,
}: Props) {
  const { text: cleaned, internalHrefs } = extractInternalLinksFromText(text, {
    labelResolver: (href) => inlineLabelResolver(linkIndex, href),
  });
  const hrefs = internalHrefs.filter(Boolean);

  const TextTag: any = as;

  const textNode: ReactNode | null =
    cleaned && cleaned.trim()
      ? (
        <TextTag style={textStyle} className={cn("whitespace-pre-line", textClassName)}>
          {renderSentenceLines(cleaned, highlights)}
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
          return <InternalLinkCard key={href} href={href} title={title} kind={kind} />;
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
