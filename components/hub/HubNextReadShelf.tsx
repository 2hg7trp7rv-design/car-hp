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
   * 以外から使う場合の上書き（任意）
   * - 仕様書 v1.2 的には from_type は "hub" などの既知値に寄せる
   */
  fromTypeOverride?: "hub";
  fromIdOverride?: string;

  /** 背景トーンに合わせる */
  theme?: "light" | "dark";
};

export function HubNextReadShelf({
  title = "次に読む",
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

  const headingClass = isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]";
  const backLinkClass = isDark
    ? "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]";

  const cardClass = isDark
    ? "border border-[var(--border-default)] bg-[var(--surface-1)] p-4 text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
    : "border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-4 text-[var(--text-primary)] transition hover:border-[rgba(27,63,229,0.3)] hover:bg-[rgba(228,219,207,0.42)]";

  const labelClass = isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-tertiary)]";

  return (
    <section className="mt-10">
      <Reveal>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-xs font-bold tracking-[0.25em] ${headingClass}`}>{title}</h2>
          <Link href="/" className={`text-[11px] ${backLinkClass}`}>
            ホームへ
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
                <p className={`text-[10px] tracking-widest ${labelClass}`}>{c.maker ?? "車種"}</p>
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
                <p className={`text-[10px] tracking-widest ${labelClass}`}>実用</p>
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
                <p className={`text-[10px] tracking-widest ${labelClass}`}>視点</p>
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
