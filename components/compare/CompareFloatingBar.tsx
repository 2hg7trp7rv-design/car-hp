"use client";

import { Button } from "@/components/ui/button";
import { CompareIcon } from "@/components/compare/CompareIcon";
import { clearCompareSlugs, useCompareSlugs } from "@/components/compare/compareStore";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { usePageContext } from "@/lib/analytics/pageContext";
import { trackCompareClear } from "@/lib/analytics/events";

export function CompareFloatingBar() {
  const ctx = usePageContext();
  const { count, url } = useCompareSlugs();

  if (count <= 0) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 px-3 bottom-[calc(env(safe-area-inset-bottom)+76px)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm"
      aria-label="比較ショートカット"
    >
      <div className="porcelain flex items-center justify-between gap-3 rounded-full border border-[rgba(14,12,10,0.12)] bg-[rgba(251,248,243,0.92)] px-3 py-2 shadow-soft-card backdrop-blur">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-[var(--text-primary)]">
          <CompareIcon className="h-4 w-4" />
          比較中
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
            {count}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TrackedLink
            href={url}
            toType="compare"
            toId="compare"
            ctaId="compare_floating_open"
            fromType={ctx.page_type}
            fromId={ctx.content_id}
          >
            <Button variant="outline" size="sm" magnetic className="cb-tap h-11 px-4">
              開く
            </Button>
          </TrackedLink>

          <Button
            type="button"
            variant="subtle"
            size="icon"
            magnetic={false}
            className="cb-tap h-11 w-11"
            onClick={() => {
              clearCompareSlugs();
              trackCompareClear({
                page_type: ctx.page_type,
                content_id: ctx.content_id,
                source: "floating_bar",
              });
            }}
            aria-label="比較をクリア"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  );
}
