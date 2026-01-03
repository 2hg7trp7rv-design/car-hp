"use client";

import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

import type { NewsItem } from "@/lib/news";

type Props = {
  news: NewsItem;
};

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function NewsCard({ news }: Props) {
  const title = news.titleJa ?? news.title;
  const dateLabel = formatDate(news.publishedAt);

  return (
    <Reveal>
      <Link href={`/news/${encodeURIComponent(news.id)}`}>
        <GlassCard className="group border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                {news.maker ?? "NEWS"}
              </p>
              {dateLabel && (
                <p className="text-[10px] tracking-[0.18em] text-slate-400">
                  {dateLabel}
                </p>
              )}
            </div>
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
              {title}
            </h3>
            {news.excerpt && (
              <p className="line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                {news.excerpt}
              </p>
            )}
          </div>
        </GlassCard>
      </Link>
    </Reveal>
  );
}
