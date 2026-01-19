"use client";

import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

import type { GuideItem } from "@/lib/guides";

type Props = {
  guide: GuideItem;
};

export function GuideCard({ guide }: Props) {
  return (
    <Reveal>
      <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
          <div className="space-y-3">
            <div>
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                {guide.title}
              </h3>
              {guide.category && (
                <p className="mt-1 text-[10px] tracking-[0.16em] text-slate-500">
                  {guide.category}
                </p>
              )}
            </div>

            {guide.summary && (
              <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                {guide.summary}
              </p>
            )}
          </div>
        </GlassCard>
      </Link>
    </Reveal>
  );
}
