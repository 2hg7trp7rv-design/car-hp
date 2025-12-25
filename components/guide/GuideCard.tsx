"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import type { GuideItem } from "@/lib/guides";

type Props = {
  guide: GuideItem;
  delay?: number;
  eyebrow?: string;
};

export function GuideCard({ guide, delay = 0, eyebrow = "GUIDE" }: Props) {
  return (
    <Reveal delay={delay}>
      <Link href={`/guide/${encodeURIComponent(guide.slug)}`} className="block">
        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            {eyebrow}
          </p>
          <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
            {guide.title}
          </h3>
          {guide.summary && (
            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
              {guide.summary}
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
