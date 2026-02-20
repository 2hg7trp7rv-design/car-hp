import { cn } from "@/lib/utils";

import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { inferKindFromHref } from "@/lib/content/internal-link-index";
import { extractInternalLinksFromText } from "@/lib/content/text";

import { InternalLinkCard } from "@/components/content/InternalLinkCard";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Props = {
  items: string[];
  /** Must be unique per checklist (e.g. `guide-tax-123`), used to generate input IDs. */
  idPrefix: string;
  linkIndex: Record<string, InternalLinkMeta>;
  className?: string;
};

function resolveTitle(linkIndex: Record<string, InternalLinkMeta>, href: string): string {
  const meta = linkIndex[href];
  if (meta?.title) return meta.title;

  const kind = inferKindFromHref(href);
  switch (kind) {
    case "GUIDE":
      return "関連GUIDE";
    case "COLUMN":
      return "関連COLUMN";
    case "CARS":
      return "関連CARS";
    case "HERITAGE":
      return "関連HERITAGE";
    default:
      return "関連リンク";
  }
}

export function Checklist({ items, idPrefix, linkIndex, className }: Props) {
  const list = (Array.isArray(items) ? items : []).map((s) => (s ?? "").toString()).filter((s) => s.trim().length > 0);
  if (list.length === 0) return null;

  return (
    <div className={cn("cbj-checklist", className)}>
      {list.map((raw, idx) => {
        const inputId = `${idPrefix}-${idx}`;

        const { text, internalHrefs } = extractInternalLinksFromText(raw);
        const visibleText = text || raw;

        return (
          <div key={`${inputId}-${raw}`} className="cbj-check-item">
            <input id={inputId} type="checkbox" className="cbj-check-input" />

            <label htmlFor={inputId} className="cbj-check-label">
              <span className="cbj-check-box" aria-hidden="true" />
              <span className="cbj-check-text">{renderInlineMarkdown(visibleText)}</span>
            </label>

            {internalHrefs.length > 0 ? (
              <div className="cbj-check-cards">
                {internalHrefs.map((href) => {
                  const meta = linkIndex[href];
                  const kind = meta?.kind ?? inferKindFromHref(href);
                  const title = meta?.title ?? resolveTitle(linkIndex, href);
                  return (
                    <InternalLinkCard
                      key={href}
                      href={href}
                      title={title}
                      kind={kind}
                      className="cbj-check-card"
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
