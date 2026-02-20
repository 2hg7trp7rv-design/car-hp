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
   * 呼び出し側で page context を渡したい場合（任意）
   * - 既存の PageContext が揺れる環境でも tracking を安定させる用途
   */
  pageType?: string;
  contentId?: string;

  /** トラッキング用の棚IDプレフィックス（省略時は既定値） */
  shelfId?: string;

  /**
   * HUB以外から使う場合の上書き（任意）
   * - 仕様書 v1.2 的には from_type は "hub" などの既知値に寄せる
   */
  fromTypeOverride?: "hub";
  fromIdOverride?: string;

  /** 背景トーンに合わせる */
  theme?: "light" | "dark";
};

export function HubNextReadShelf({
  title = "NEXT READ",
  guides = [],
  columns = [],
  cars = [],
  pageType,
  contentId,
  fromTypeOverride,
  fromIdOverride,
  theme = "light",
}: Props) {
  const ctx = usePageContext() as any;

  const isDark = theme === "dark";

  // PageContext は実装差異が出やすいので候補を吸収する
  const ctxType = (ctx?.page_type ?? ctx?.pageType ?? ctx?.type ?? "hub") as unknown;

  const ctxId = (ctx?.content_id ?? ctx?.pageId ?? ctx?.page_id ?? ctx?.id ?? "") as unknown;

  const fallbackType = (pageType ?? (ctxType as any) ?? "hub") as any;
  const fallbackId = String(contentId ?? (ctxId as any) ?? "");

  const fromType = (fromTypeOverride ?? fallbackType ?? "hub") as any;
  const fromId = String(fromIdOverride ?? fallbackId ?? "");

  const hasAny =
    (Array.isArray(cars) && cars.length > 0) ||
    (Array.isArray(guides) && guides.length > 0) ||
    (Array.isArray(columns) && columns.length > 0);

  if (!hasAny) return null;

  const headingClass = isDark ? "text-slate-300" : "text-slate-600";
  const backLinkClass = isDark
    ? "text-slate-400 hover:text-slate-200"
    : "text-slate-500 hover:text-slate-800";

  const cardClass = isDark
    ? "border border-white/10 bg-slate-900/40 p-4 text-slate-50 hover:bg-slate-900/60"
    : "border border-slate-200/80 bg-white/70 p-4 text-slate-900 transition hover:border-tiffany-200 hover:bg-white/90";

  const labelClass = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <section className="mt-10">
      <Reveal>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-xs font-bold tracking-[0.25em] ${headingClass}`}>{title}</h2>
          <Link href="/" className={`text-[11px] ${backLinkClass}`}>
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
              shelfId="shelf_cars"
              className="block"
            >
              <GlassCard className={cardClass}>
                <p className={`text-[10px] tracking-widest ${labelClass}`}>{c.maker ?? "CAR"}</p>
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
              shelfId="shelf_guides"
              className="block"
            >
              <GlassCard className={cardClass}>
                <p className={`text-[10px] tracking-widest ${labelClass}`}>GUIDE</p>
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
              shelfId="shelf_columns"
              className="block"
            >
              <GlassCard className={cardClass}>
                <p className={`text-[10px] tracking-widest ${labelClass}`}>COLUMN</p>
                <p className="mt-1 text-sm font-semibold">{c.title}</p>
              </GlassCard>
            </TrackedLink>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default HubNextReadShelf;
