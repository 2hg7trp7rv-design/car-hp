"use client";

import { useEffect } from "react";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { useImpressionOnce } from "@/components/analytics/useImpressionOnce";
import {
  trackInternalNavImpression,
  type PageType,
} from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";

type HubCard = {
  href: string;
  toId: string;
  label: string;
  description: string;
  ctaId: string;
};

const DEFAULT_HUB_CARDS: HubCard[] = [
  {
    href: "/guide/insurance",
    toId: "hub-insurance",
    label: "自動車保険（見直し）",
    description: "補償条件を揃えてから比較。迷いやすい箇所を先に潰す。",
    ctaId: "insurance",
  },
  {
    href: "/guide/hub-sell",
    toId: "hub-sell",
    label: "売却（相場と手順）",
    description: "相場を掴み、査定の前に“損しない段取り”を整理する。",
    ctaId: "sell",
  },
  {
    href: "/guide/maintenance",
    toId: "hub-maintenance",
    label: "維持費・整備（現実）",
    description: "よくあるトラブルと費用感を先に把握して、判断の軸を作る。",
    ctaId: "maintenance",
  },
];

type FixedGuideShelfProps = {
  /** analytics 用。未指定なら fixed_guide_hubs */
  shelfId?: string;
  /** 見出し。未指定ならデフォルト */
  title?: string;
  /** 説明。未指定ならデフォルト */
  lead?: string;
  /** カード上書き（必要時のみ） */
  cards?: HubCard[];
  className?: string;
};

export function FixedGuideShelf({
  shelfId = "fixed_guide_hubs",
  title = "次の行動（GUIDE HUB）",
  lead = "保険・売却・維持費。まず“迷いやすい場所”だけを整理する。",
  cards = DEFAULT_HUB_CARDS,
  className = "",
}: FixedGuideShelfProps) {
  if (!cards.length) return null;

  const ctx = usePageContext();
  const { ref, hasImpression } = useImpressionOnce({ threshold: 0.35 });

  function normalizeCtxToPageType(pageType: string, contentId: string): PageType {
    const isIndex = contentId === "index" || contentId === "top";

    if (pageType === "top") return "home";
    if (pageType === "hub") return "guide_hub";

    if (pageType === "cars") return isIndex ? "cars_index" : "cars_detail";
    if (pageType === "heritage")
      return isIndex ? "heritage_index" : "heritage_detail";
    if (pageType === "column") return isIndex ? "column_index" : "column_detail";
    if (pageType === "guide") return isIndex ? "guide_index" : "guide_detail";
    if (pageType === "news") return isIndex ? "news_index" : "news_detail";

    return "other";
  }

  useEffect(() => {
    if (!hasImpression) return;

    const pageType = normalizeCtxToPageType(ctx.page_type, ctx.content_id);
    const contentId = String(ctx.content_id ?? "");

    trackInternalNavImpression({
      page_type: pageType,
      content_id: contentId,
      shelf_id: shelfId,
      variant: "fixed_guide_shelf",
    });
  }, [hasImpression, ctx.page_type, ctx.content_id, shelfId]);

  return (
    <section className={className}>
      <div ref={ref}>
        <Reveal>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                GUIDE HUB
              </p>
              <h2 className="serif-heading mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-600 sm:text-[12px]">
                {lead}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal key={card.href} delay={80 + index * 40}>
              <TrackedLink
                href={card.href}
                shelfId={shelfId}
                ctaId={card.ctaId}
                toType="hub"
                toId={card.toId}
              >
                <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-5 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                  <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                    {card.label}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                    {card.description}
                  </p>
                  <p className="mt-4 text-[12px] font-semibold text-tiffany-700">
                    HUBへ →
                  </p>
                </GlassCard>
              </TrackedLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
