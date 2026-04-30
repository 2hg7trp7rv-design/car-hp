"use client";

import type { ReactNode } from "react";

import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Reveal } from "@/components/animation/Reveal";
import { usePageContext } from "@/lib/analytics/pageContext";
import type { GuideItem } from "@/lib/guides";

type Props = {
  /** セクション見出し。省略時は非表示 */
  title?: string;
  guides: GuideItem[];

  /** 互換用：hub slug を明示したい場合 */
  fromIdOverride?: string;

  /** 新規：上位から明示したい場合（HubNextReadShelf と合わせる） */
  pageType?: string;
  contentId?: string;

  /** トラッキング用の棚ID（省略時は既定値） */
  shelfId?: string;

  /** 補足文 merge */
  note?: ReactNode;

  /** 背景トーンに合わせる */
  theme?: "light" | "dark";
};

export function HubRelatedGuidesGrid(props: Props) {
  const {
    title,
    guides,
    fromIdOverride,
    pageType,
    contentId,
    shelfId,
    note,
    theme = "light",
  } = props;

  const isDark = theme === "dark";

  const { page_type, content_id } = usePageContext();
  const from_type = pageType ?? page_type;
  const from_id = contentId ?? fromIdOverride ?? content_id;
  const resolved_shelf_id = shelfId ?? "hub_related_guides";

  const wrapTitle = isDark ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]";
  const wrapNote = isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]";

  const cardBorder = isDark ? "border-white/10" : "border-[rgba(14,12,10,0.12)]";
  const cardHoverBorder = isDark ? "hover:border-white/20" : "hover:border-[rgba(27,63,229,0.3)]";
  const cardBg = isDark ? "bg-[var(--surface-1)]" : "bg-[rgba(228,219,207,0.42)]";
  const cardHoverBg = isDark ? "hover:bg-[var(--surface-1)]" : "hover:bg-[rgba(228,219,207,0.42)]";

  const cardTitle = isDark ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]";
  const cardTitleHover = isDark ? "" : "group-hover:text-[var(--accent-strong)]";
  const cardSummary = isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]";

  if (!guides || guides.length === 0) {
    return (
      <GlassCard
        className={`border ${cardBorder} ${cardBg} p-6`}
        padding="none"
      >
        {title && (
          <p className={`mb-2 text-[12px] font-semibold tracking-wide ${wrapTitle}`}>
            {title}
          </p>
        )}
        <p className={`text-[11px] ${wrapNote}`}>関連ガイドは準備中です。</p>
        {note && <div className={`mt-3 text-[11px] ${wrapNote}`}>{note}</div>}
      </GlassCard>
    );
  }

  return (
    <Reveal>
      <div>
        {title && (
          <div className="mb-4">
            <p className={`text-[12px] font-semibold tracking-wide ${wrapTitle}`}>{title}</p>
            {note && <div className={`mt-2 text-[11px] ${wrapNote}`}>{note}</div>}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <TrackedLink
              key={g.slug}
              href={`/guide/${encodeURIComponent(g.slug)}`}
              fromType={typeof from_type === "string" ? from_type : "hub"}
              fromId={typeof from_id === "string" ? from_id : ""}
              toType="guide"
              toId={g.slug}
              shelfId={resolved_shelf_id}
            >
              <GlassCard
                className={`group h-full border ${cardBorder} ${cardBg} p-5 transition ${cardHoverBorder} ${cardHoverBg}`}
              >
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--text-tertiary)]">
                  ガイド
                </p>
                <h3
                  className={`mt-2 text-[13px] font-semibold leading-snug ${cardTitle} ${cardTitleHover}`}
                >
                  {g.title}
                </h3>
                {g.summary && (
                  <p className={`mt-2 line-clamp-3 text-[11px] leading-relaxed ${cardSummary}`}>
                    {g.summary}
                  </p>
                )}
              </GlassCard>
            </TrackedLink>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default HubRelatedGuidesGrid;
