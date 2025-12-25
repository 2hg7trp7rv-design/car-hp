"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

type Props = {
  slug: string;
  title: string;
  preview?: string | null;
  dateLabel?: string | null;
  delay?: number;
  eyebrow?: string;
};

export function HeritageMiniCard({
  slug,
  title,
  preview,
  dateLabel,
  delay = 0,
  eyebrow = "HERITAGE",
}: Props) {
  return (
    <Reveal delay={delay}>
      <Link href={`/heritage/${encodeURIComponent(slug)}`} className="block">
        <GlassCard className="group h-full border border-slate-200/80 bg-white/92 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              {eyebrow}
            </p>
            {dateLabel && (
              <span className="ml-auto text-[10px] text-slate-400">{dateLabel}</span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
            {title}
          </h3>

          {preview && (
            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
              {preview}
            </p>
          )}

          <p className="mt-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400">
            READ →
          </p>
        </GlassCard>
      </Link>
    </Reveal>
  );
}
