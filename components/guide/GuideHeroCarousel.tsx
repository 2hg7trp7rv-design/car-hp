"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { pickExhibitKvFromHref } from "@/lib/exhibit/kv";
import { isExistingLocalPublicAssetPath } from "@/lib/public-assets";

export type GuideHeroItem = {
  href: string;
  title: string;
  summary?: string | null;
  imageSrc: string;
};

type Props = {
  items: GuideHeroItem[];
  className?: string;
  intervalMs?: number;
};

export function GuideHeroCarousel({ items, className, intervalMs = 6500 }: Props) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [index, setIndex] = useState(0);

  const count = safeItems.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [index, count]);

  if (count === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-[#222222]/10 bg-white shadow-soft-card">
        {safeItems.map((it, i) => {
          const active = i === index;
          const raw = (it.imageSrc ?? "").trim();
          const resolvedImageSrc = raw && (raw.startsWith("http://") || raw.startsWith("https://") || isExistingLocalPublicAssetPath(raw))
            ? raw
            : pickExhibitKvFromHref(it.href, "desktop");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "absolute inset-0 block",
                "transition-opacity duration-500",
                active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
            >
              <div className="absolute inset-0">
                <Image
                  src={resolvedImageSrc}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 980px"
                  className="object-cover"
                />
              </div>

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-[13px] font-semibold leading-relaxed text-white">
                  {it.title}
                </p>
                {it.summary ? (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/85">
                    {it.summary}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}

        {/* spacer for aspect */}
        <div className="invisible aspect-[16/9] w-full" aria-hidden="true" />
      </div>

      {/* dots */}
      {count > 1 ? (
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="スライド切り替え">
          {safeItems.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "group cb-tap inline-flex items-center justify-center rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0ABAB5]/40",
                )}
                role="tab"
                aria-label={`スライド ${i + 1}`}
                aria-selected={active}
                aria-current={active}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition",
                    active ? "bg-[#222222]/55" : "bg-[#222222]/20 group-hover:bg-[#222222]/35",
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
