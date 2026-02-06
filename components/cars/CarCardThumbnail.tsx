// components/cars/CarCardThumbnail.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  /** ファーストビューで使う場合は true にすると優先読み込み */
  priority?: boolean;
};

export function CarCardThumbnail({ src, alt, priority = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showPlaceholder = !src || hasError;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
      <div className="relative aspect-[16/9] w-full">
        {/* プレースホルダー（画像なし or 読み込み失敗） */}
        {showPlaceholder && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#f0fbfb] via-white to-[#e8f8f7] text-[10px] tracking-[0.2em] text-slate-400">
            <span className="uppercase">car visual</span>
            <span className="uppercase">coming soon</span>
          </div>
        )}

        {/* ローディング中のうっすらシャマー */}
        {!showPlaceholder && !isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
        )}

        {/* 実画像 */}
        {!showPlaceholder && (
          <Image
            src={src as string}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
            className={`
              h-full w-full object-cover
              transition-transform duration-700 ease-out
              group-hover:scale-[1.04]
              ${isLoaded ? "opacity-100" : "opacity-0"}
            `}
            priority={priority}
            quality={72}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        )}

        {/* 右下の軽いラベル（将来グレード名など載せる想定で土台だけ用意） */}
        {!showPlaceholder && (
          <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-slate-900/50 px-2.5 py-1 text-[9px] font-medium tracking-[0.16em] text-slate-50 shadow-sm backdrop-blur-sm">
            VIEW DETAIL
          </div>
        )}
      </div>
    </div>
  );
}
