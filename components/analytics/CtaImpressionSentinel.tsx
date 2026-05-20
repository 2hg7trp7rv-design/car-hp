"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";

import { trackCtaImpression, type PageType } from "@/lib/analytics/events";

type Props = {
  children: ReactNode;
  pageType: Exclude<PageType, "top">;
  contentId: string;
  monetizeKey: string;
  position: string;
  ctaId: string;
  variant?: string;
};

export function CtaImpressionSentinel({
  children,
  pageType,
  contentId,
  monetizeKey,
  position,
  ctaId,
  variant = "default",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const firedKey = useMemo(
    () => `${pageType}::${contentId}::${monetizeKey}::${position}::${ctaId}`,
    [pageType, contentId, monetizeKey, position, ctaId],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (fired) return;
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        fired = true;
        trackCtaImpression({
          page_type: pageType,
          content_id: contentId,
          monetize_key: monetizeKey,
          cta_id: ctaId,
          position,
          variant,
        });
        io.disconnect();
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [firedKey, pageType, contentId, monetizeKey, position, ctaId, variant]);

  return <div ref={ref}>{children}</div>;
}
