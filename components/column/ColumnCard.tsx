"use client";

import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

import type { ColumnItem } from "@/lib/columns";

type Props = {
  column: ColumnItem;
};

export function ColumnCard({ column }: Props) {
  return (
    <Reveal>
      <Link href={`/column/${encodeURIComponent(column.slug)}`}>
        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
          <div className="space-y-3">
            <div>
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                {column.title}
              </h3>
              {column.tag && (
                <p className="mt-1 text-[10px] tracking-[0.16em] text-slate-500">
                  {column.tag}
                </p>
              )}
            </div>

            {column.excerpt && (
              <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                {column.excerpt}
              </p>
            )}
          </div>
        </GlassCard>
      </Link>
    </Reveal>
  );
}
