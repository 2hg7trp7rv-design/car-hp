// components/monetize/HubCtaGrid.tsx
"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { trackOutboundClick } from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";

type HubCard = {
  title: string;
  description?: string;
  href: string;
};

type Props = {
  heading?: string;
  items: HubCard[];

  /**
   * legacy互換（既存呼び出しを壊さないため全て optional）
   * - usePageContext が取れない/不正なときのフォールバックとして使う
   */
  pageType?: "hub" | "guide" | "cars" | "column";
  contentId?: string;
  ctaPosition?: string;
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function guessPartner(href: string): string | undefined {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");
    return host && host !== "unknown" ? host : undefined;
  } catch {
    return undefined;
  }
}

function isValidContentId(v: unknown): v is string {
  return (
    typeof v === "string" &&
    v.trim().length > 0 &&
    v !== "unknown" &&
    v !== "top"
  );
}

function isTrackablePageType(
  v: unknown,
): v is "hub" | "guide" | "cars" | "column" {
  return v === "hub" || v === "guide" || v === "cars" || v === "column";
}

function safeCtaPosition(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  return s.length > 0 ? s : fallback;
}

export function HubCtaGrid({
  heading = "HUB",
  items,
  pageType = "hub",
  contentId = "hub",
  ctaPosition = "hub_cta_grid",
}: Props) {
  if (!ENABLE_MONETIZATION) return null;

  if (!items || items.length === 0) return null;

  // ★ 計測の軸は usePageContext を優先
  const { page_type: ctxPageType, content_id: ctxContentId } = usePageContext();

  const effectivePageType: "hub" | "guide" | "cars" | "column" | null =
    isTrackablePageType(ctxPageType)
      ? ctxPageType
      : isTrackablePageType(pageType)
        ? pageType
        : null;

  const effectiveContentId: string | null =
    isValidContentId(ctxContentId)
      ? ctxContentId
      : isValidContentId(contentId)
        ? contentId
        : null;

  const effectiveCtaPosition = safeCtaPosition(ctaPosition, "hub_cta_grid");

  return (
    <section className="mt-8">
      <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-300">
        {heading}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((it) => {
          const external = isExternalHref(it.href);
          const rel = external
            ? "nofollow sponsored noopener noreferrer"
            : undefined;
          const target = external ? "_blank" : undefined;

          return (
            <Reveal key={it.href}>
              <Link
                href={it.href}
                target={target}
                rel={rel}
                className="block h-full"
                onClick={() => {
                  if (!external) return;

                  // ★ unknown/top/空ID を送らない（データ汚染回避）
                  if (!effectivePageType || !effectiveContentId) return;

                  trackOutboundClick({
                    page_type: effectivePageType,
                    content_id: effectiveContentId,
                    partner: guessPartner(it.href),
                    url: it.href,
                    cta_position: effectiveCtaPosition,
                  });
                }}
              >
                <GlassCard className="group flex h-full flex-col border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      {external ? "PR" : "LINK"}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {external ? "OUT" : "IN"}
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-[14px] font-semibold tracking-tight text-slate-900 sm:text-[15px]">
                    {it.title}
                  </h3>

                  {it.description && (
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
                      {it.description}
                    </p>
                  )}

                  <p className="mt-auto pt-4 text-[11px] font-semibold tracking-[0.12em] text-tiffany-600">
                    OPEN →
                  </p>
                </GlassCard>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}