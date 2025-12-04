// components/cars/CarCardThumbnail.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
};

export function CarCardThumbnail({ src, alt }: Props) {
  const [hasError, setHasError] = useState(false);

  // 画像がない or 読み込み失敗 → プレースホルダー
  if (!src || hasError) {
    return (
      <div className="h-40 w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-[#f0fbfb] via-white to-[#e8f8f7] shadow-sm">
        <div className="flex h-full flex-col items-center justify-center gap-1 text-[10px] tracking-[0.2em] text-slate-400">
          <span className="uppercase">car visual</span>
          <span className="uppercase">coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <Image
        src={src}
        alt={alt}
        width={640}
        height={400}
        className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
