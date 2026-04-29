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
  heading = "",
  items,
  pageType = "hub",
  contentId = "hub",
  ctaPosition = "hub_cta_grid",
}: Props) {
  const { page_type: ctxPageType, content_id: ctxContentId } = usePageContext();

  if (!ENABLE_MONETIZATION || !items || items.length === 0) return null;

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
      <p className="text-[10px] font-semibold tracking-[0.26em] text-[var(--text-tertiary)]">
        {heading}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((it) => {
          const external = isExternalHref(it.href);
          const rel = external ? "nofollow sponsored noopener noreferrer" : undefined;
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
                <GlassCard className="group flex h-full flex-col border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-soft transition hover:-translate-y-[1px] hover:border-[rgba(27,63,229,0.32)] sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                      {external ? "PR" : "リンク"}
                    </p>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {external ? "外部" : "内部"}
                    </span>
                  </div>

                  <h3 className="mt-4 font-sans text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
                    {it.title}
                  </h3>

                  {it.description && (
                    <p className="mt-3 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                      {it.description}
                    </p>
                  )}

                  <p className="mt-auto pt-5 text-[12px] font-semibold tracking-[0.08em] text-[var(--accent-strong)]">
                    読む →
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
