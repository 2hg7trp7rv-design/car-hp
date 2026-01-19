"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { GuideMonetizeBlock } from "@/components/guide/GuideMonetizeBlock";
import { getOrAssignVariant } from "@/lib/analytics/experiments";

type Entry = {
  monetizeKey: string;
  position: string;
  ctaId: string;
};

type Props = {
  experimentId: string;
  contentId: string;
  primaryA: Entry;
  primaryB: Entry;
  secondary: Entry[];

  /** Optional helper text shown under the primary entry. */
  note?: ReactNode;
};

export function HubEntryShelf(props: Props) {
  const { experimentId, contentId, primaryA, primaryB, secondary, note } = props;

  const variant = getOrAssignVariant({
    experimentId,
    contentId,
    pageType: "guide_hub",
  });

  const primary = variant === "A" ? primaryA : primaryB;

  return (
    <div>
      <Reveal>
        <div className="mt-4">
          <GuideMonetizeBlock
            monetizeKey={primary.monetizeKey as any}
            position={primary.position}
            ctaId={primary.ctaId}
            variant={variant}
            pageType="guide_hub"
            contentId={contentId}
          />
        </div>

        {note && (
          <div className="mt-3">
            <GlassCard
              padding="sm"
              magnetic={false}
              className="border border-slate-100/70 bg-white/70"
            >
              <div className="text-[11px] leading-relaxed text-slate-600">{note}</div>
            </GlassCard>
          </div>
        )}
      </Reveal>

      {secondary.length > 0 && (
        <Reveal delay={80}>
          <div className="mt-4">
            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              OTHER ROUTES
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {secondary.map((item) => (
                <GuideMonetizeBlock
                  key={item.ctaId}
                  monetizeKey={item.monetizeKey as any}
                  position={item.position}
                  ctaId={item.ctaId}
                  variant={variant}
                  pageType="guide_hub"
                  contentId={contentId}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
