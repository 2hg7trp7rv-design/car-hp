// components/cars/CarCardThumbnail.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  priority?: boolean;
};

export function CarCardThumbnail({ src, alt, priority = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showPlaceholder = !src || hasError;

  return (
    <div className="w-full overflow-hidden rounded-[22px] border border-[var(--border-default)] bg-[var(--surface-1)]">
      <div className="relative aspect-[16/9] w-full">
        {showPlaceholder && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[linear-gradient(135deg,rgba(229,235,239,0.72),rgba(251,248,243,0.98))] text-[10px] tracking-[0.2em] text-[var(--text-tertiary)]">
            <span>イメージ</span>
            <span>画像がない回も、輪郭から読めます</span>
          </div>
        )}

        {!showPlaceholder && !isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[var(--surface-2)] via-[var(--surface-1)] to-[var(--surface-2)]" />
        )}

        {!showPlaceholder && (
          <Image
            src={src as string}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
            className={[
              "h-full w-full object-cover transition-transform duration-700 ease-out",
              "group-hover:scale-[1.04]",
              isLoaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
            priority={priority}
            quality={72}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        )}

        {!showPlaceholder && (
          <div className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-[rgba(31,28,25,0.12)] bg-[rgba(251,248,243,0.88)] px-2.5 py-1 text-[9px] font-medium tracking-[0.16em] text-[var(--text-primary)] shadow-sm backdrop-blur-sm">
            読む
          </div>
        )}
      </div>
    </div>
  );
}
