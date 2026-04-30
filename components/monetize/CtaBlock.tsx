"use client";

import React from "react";
import { getMonetizeConfig, MonetizeKey } from "@/lib/monetize/config";
import { TrackedOutboundLink } from "@/components/analytics/TrackedOutboundLink";
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";

interface CtaBlockProps {
  monetizeKey: MonetizeKey;
  pageType?: string;
  contentId?: string;
  position?: string;
  ctaId?: string;
  className?: string;
}

export const CtaBlock: React.FC<CtaBlockProps> = ({
  monetizeKey,
  pageType,
  contentId,
  position = "block",
  ctaId = "block",
  className = "",
}) => {
  if (!ENABLE_MONETIZATION) return null;

  const config = getMonetizeConfig(monetizeKey);
  if (!config.url) return null;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[24px] border border-[var(--border-default)]",
        "bg-[linear-gradient(135deg,rgba(238,231,222,0.98),rgba(251,248,243,0.98))] p-6 shadow-soft-card",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-[rgba(27,63,229,0.10)] blur-2xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 text-center md:text-left">
          {config.description && (
            <p className="mb-2 text-[13px] leading-[1.8] text-[var(--text-secondary)]">
              {config.description}
            </p>
          )}
          <h3 className="text-[22px] font-semibold leading-[1.3] tracking-[-0.03em] text-[var(--text-primary)] md:text-[26px]">
            {config.label}
          </h3>
        </div>

        <TrackedOutboundLink
          href={config.url}
          monetizeKey={monetizeKey}
          ctaId={ctaId}
          position={position}
          pageType={pageType}
          contentId={contentId}
          className="inline-flex items-center justify-center rounded-full border border-[var(--text-primary)] bg-[var(--text-primary)] px-6 py-3 text-sm font-semibold text-[var(--bg-stage)] transition-colors duration-120 hover:bg-[#34302c]"
        >
          <span className="flex items-center gap-2">
            公式を見る <span className="text-xs opacity-70">→</span>
          </span>
        </TrackedOutboundLink>
      </div>
      <p className="mt-3 text-right text-[10px] text-[var(--text-tertiary)]">
        リンク先で手続きが必要な場合があります
      </p>
    </div>
  );
};
