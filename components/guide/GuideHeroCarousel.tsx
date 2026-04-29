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

export function GuideHeroCarousel({ items, className }: Props) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [index, setIndex] = useState(0);
  const count = safeItems.length;

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [index, count]);

  if (count === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-[26px] border border-[var(--border-default)] bg-[var(--surface-1)] shadow-soft-card">
        {safeItems.map((it, i) => {
          const active = i === index;
          const raw = (it.imageSrc ?? "").trim();
          const resolvedImageSrc =
            raw &&
            (raw.startsWith("http://") ||
              raw.startsWith("https://") ||
              isExistingLocalPublicAssetPath(raw))
              ? raw
              : pickExhibitKvFromHref(it.href, "desktop");

          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "absolute inset-0 block transition-opacity duration-300",
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

              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,12,10,0.30)] via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <div className="max-w-[32rem] rounded-[22px] border border-[rgba(251,248,243,0.58)] bg-[rgba(251,248,243,0.88)] p-4 text-[var(--text-primary)] shadow-soft-card backdrop-blur-sm">
                  <p className="text-[10px] font-semibold tracking-[0.24em] text-[var(--accent-base)] uppercase">
                    Pick
                  </p>
                  <p className="mt-2 text-[17px] font-semibold leading-[1.45] text-[var(--text-primary)] sm:text-[20px]">
                    {it.title}
                  </p>
                  {it.summary ? (
                    <p className="mt-2 line-clamp-2 text-[12px] leading-[1.8] text-[var(--text-secondary)] sm:text-[13px]">
                      {it.summary}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}

        <div className="invisible aspect-[16/9] w-full" aria-hidden="true" />
      </div>

      {count > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-[11px] leading-[1.7] text-[var(--text-tertiary)]">
            自動切替は使わず、見たい1枚を選べます。
          </p>
          <div className="flex justify-center gap-2" role="tablist" aria-label="スライド切り替え">
            {safeItems.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "group cb-tap inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-120",
                    active
                      ? "border-[rgba(27,63,229,0.36)] bg-[var(--surface-glow)]"
                      : "border-[var(--border-default)] bg-[rgba(251,248,243,0.9)] hover:bg-[var(--surface-2)]",
                  )}
                  role="tab"
                  aria-label={`スライド ${i + 1}`}
                  aria-selected={active}
                  aria-current={active}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors duration-120",
                      active ? "bg-[var(--accent-base)]" : "bg-[rgba(14,12,10,0.24)] group-hover:bg-[rgba(14,12,10,0.42)]",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
