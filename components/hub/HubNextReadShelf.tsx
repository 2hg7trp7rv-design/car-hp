"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { usePageContext } from "@/lib/analytics/pageContext";

type Props = {
  title?: string;

  guides?: Array<{ slug: string; title: string }>;
  columns?: Array<{ slug: string; title: string }>;
  cars?: Array<{ slug: string; name: string; maker?: string }>;

  /**
   * HUB以外から使う場合の上書き（任意）
   * - 仕様書 v1.2 的には from_type は "hub" などの既知値に寄せる
   */
  fromTypeOverride?: "hub";
  fromIdOverride?: string;
};

export function HubNextReadShelf({
  title = "NEXT READ",
  guides = [],
  columns = [],
  cars = [],
  fromTypeOverride,
  fromIdOverride,
}: Props) {
  const ctx = usePageContext() as any;

  // PageContext は実装差異が出やすいので候補を吸収する
  const ctxType =
    (ctx?.page_type ??
      ctx?.pageType ??
      ctx?.type ??
      "hub") as unknown;

  const ctxId =
    (ctx?.content_id ??
      ctx?.pageId ??
      ctx?.page_id ??
      ctx?.id ??
      "") as unknown;

  const fromType = (fromTypeOverride ?? (ctxType as any) ?? "hub") as any;
  const fromId = String(fromIdOverride ?? (ctxId as any) ?? "");

  const hasAny =
    (Array.isArray(cars) && cars.length > 0) ||
    (Array.isArray(guides) && guides.length > 0) ||
    (Array.isArray(columns) && columns.length > 0);

  if (!hasAny) return null;

  return (
    <section className="mt-10">
      <Reveal>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.25em] text-slate-300">
            {title}
          </h2>
          <Link
            href="/"
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            BACK
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-3 md:grid-cols-2">
        {cars.slice(0, 4).map((c) => (
          <Reveal key={c.slug}>
            <TrackedLink
              href={`/cars/${encodeURIComponent(c.slug)}`}
              fromType={fromType}
              fromId={fromId}
              toType="cars"
              toId={c.slug}
              shelfId="hub_next_read_cars"
              className="block"
            >
              <GlassCard className="border border-white/10 bg-slate-900/40 p-4 text-slate-50 hover:bg-slate-900/60">
                <p className="text-[10px] tracking-widest text-slate-400">
                  {c.maker ?? "CAR"}
                </p>
                <p className="mt-1 text-sm font-semibold">{c.name}</p>
              </GlassCard>
            </TrackedLink>
          </Reveal>
        ))}

        {guides.slice(0, 4).map((g) => (
          <Reveal key={g.slug}>
            <TrackedLink
              href={`/guide/${encodeURIComponent(g.slug)}`}
              fromType={fromType}
              fromId={fromId}
              toType="guide"
              toId={g.slug}
              shelfId="hub_next_read_guides"
              className="block"
            >
              <GlassCard className="border border-white/10 bg-slate-900/40 p-4 text-slate-50 hover:bg-slate-900/60">
                <p className="text-[10px] tracking-widest text-slate-400">
                  GUIDE
                </p>
                <p className="mt-1 text-sm font-semibold">{g.title}</p>
              </GlassCard>
            </TrackedLink>
          </Reveal>
        ))}

        {columns.slice(0, 4).map((c) => (
          <Reveal key={c.slug}>
            <TrackedLink
              href={`/column/${encodeURIComponent(c.slug)}`}
              fromType={fromType}
              fromId={fromId}
              toType="column"
              toId={c.slug}
              shelfId="hub_next_read_columns"
              className="block"
            >
              <GlassCard className="border border-white/10 bg-slate-900/40 p-4 text-slate-50 hover:bg-slate-900/60">
                <p className="text-[10px] tracking-widest text-slate-400">
                  COLUMN
                </p>
                <p className="mt-1 text-sm font-semibold">{c.title}</p>
              </GlassCard>
            </TrackedLink>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
