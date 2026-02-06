'use client';

import React from 'react';
import { getMonetizeConfig, MonetizeKey } from '@/lib/monetize/config';
import { TrackedOutboundLink } from '@/components/analytics/TrackedOutboundLink';
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";

interface CtaBlockProps {
  monetizeKey: MonetizeKey;
  /**
   * 互換（pageContext が取れない場所で手動指定したい場合）
   */
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
  position = 'block',
  ctaId = 'block',
  className = '',
}) => {
  if (!ENABLE_MONETIZATION) return null;

  const config = getMonetizeConfig(monetizeKey);

  // URL が無い場合は安全に非表示
  if (!config.url) return null;


  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-soft-card ring-1 ring-white/10 ${className}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 text-center md:text-left">
          {config.description && (
            <p className="text-sm text-white/60 mb-1 font-light tracking-wide">
              {config.description}
            </p>
          )}
          <h3 className="text-lg md:text-xl font-medium text-white tracking-wider">
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
          className="relative inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15 hover:ring-white/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            詳細を見る <span className="text-xs opacity-70">→</span>
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </TrackedOutboundLink>
      </div>
      <p className="mt-2 text-right text-[10px] text-white/20">
        リンク先で手続きが必要な場合があります
      </p>
    </div>
  );
};
