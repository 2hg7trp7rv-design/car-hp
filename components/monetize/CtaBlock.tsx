'use client';

import React from 'react';
import { getMonetizeConfig, MonetizeKey } from '@/lib/monetize/config';

// 既存のイベント計測があればimport。なければ空関数で代用可能
// import { trackOutboundClick } from '@/lib/analytics/events'; 

interface CtaBlockProps {
  monetizeKey: MonetizeKey;
  pageType?: string;
  contentId?: string;
  position?: string;
  className?: string;
}

export const CtaBlock: React.FC<CtaBlockProps> = ({
  monetizeKey,
  pageType,
  contentId,
  className = '',
}) => {
  const config = getMonetizeConfig(monetizeKey);
  if (!config) return null;

  const handleClick = () => {
    // trackOutboundClick(config.key, config.url, { pageType: pageType || 'unknown', contentId: contentId || 'unknown' });
    console.log('CTA Clicked:', config.key);
  };

  return (
    <div className={`relative w-full my-12 group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
      
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* PR Label */}
        <div className="absolute top-0 right-0 px-2 py-1 bg-white/10 text-[10px] text-white/50 border-bl rounded-bl">
          PR
        </div>

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

        <a
          href={config.url}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          onClick={handleClick}
          className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 hover:border-white/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            詳細を見る <span className="text-xs opacity-70">→</span>
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </a>
      </div>
      <p className="mt-2 text-right text-[10px] text-white/20">
        リンク先で手続きが必要な場合があります
      </p>
    </div>
  );
};
