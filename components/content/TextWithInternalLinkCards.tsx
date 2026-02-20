import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { inferKindFromHref } from "@/lib/content/internal-link-index";
import { extractInternalLinksFromText } from "@/lib/content/text";
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
      return "関連HERITAGE";
    default:
      return "関連ページ";
  }
}

export function TextWithInternalLinkCards({
  text,
  linkIndex,
  as = "p",
  textClassName,
  textStyle,
  cardsClassName,
  className,
}: Props) {
  const { text: cleaned, internalHrefs } = extractInternalLinksFromText(text);
  const hrefs = internalHrefs.filter(Boolean);

  const TextTag: any = as;

  const textNode: ReactNode | null =
    cleaned && cleaned.trim()
      ? (
        <TextTag style={textStyle} className={cn("whitespace-pre-line", textClassName)}>
          {renderInlineMarkdown(cleaned)}
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
