"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import type { ColumnItem } from "@/lib/columns";

type Props = {
  column: ColumnItem;
  delay?: number;
};

function normalizeStr(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function pickTags(column: ColumnItem, limit = 3): string[] {
  const tags: string[] = Array.isArray((column as any).tags)
    ? ((column as any).tags as unknown[])
        .filter((t): t is string => typeof t === "string")
        .map((t) => normalizeStr(t))
        .filter(Boolean)
    : [];
  return tags.slice(0, limit);
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function ColumnCard({ column, delay = 0 }: Props) {
  const href = `/column/${encodeURIComponent(column.slug)}`;
  const dateLabel = formatDate((column as any).publishedAt ?? (column as any).updatedAt ?? null);

  const tags = pickTags(column);

  const summary =
    normalizeStr((column as any).summary) ||
    normalizeStr((column as any).excerpt) ||
    "";

  return (
    <Reveal delay={delay}>
      <Link href={href} className="block">
        <GlassCard
          as="article"
          padding="md"
          interactive
          className="group h-full border border-slate-200/80 bg-white/92 text-xs shadow-soft transition hover:-translate-y-[2px] hover:border-tiffany-200"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.16em] text-slate-500">
              {dateLabel && (
                <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-slate-400">
                  {dateLabel}
                </span>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
              {column.title}
            </h3>

            {summary && (
              <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                {summary}
              </p>
            )}
          </div>
        </GlassCard>
      </Link>
    </Reveal>
  );
}
