"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useImpressionOnce } from "@/components/analytics/useImpressionOnce";
import {
  trackInternalNavImpression,
  type PageType as AnalyticsPageType,
} from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";

type Props = {
  shelfId: string;
  variant?: string;
  threshold?: number;
  children: ReactNode;

  /**
   * 例外的に PageType を上書きしたい場合。
   * - ほとんどのケースでは pageContext から自動判定でOK
   */
  pageTypeOverride?: AnalyticsPageType;
  contentIdOverride?: string;
};

function normalizePageType(
  rawType: unknown,
  contentId: string,
): AnalyticsPageType {
  // 既に v1.2 詳細型が入っているならそのまま
  if (
    rawType === "home" ||
    rawType === "cars_index" ||
    rawType === "cars_detail" ||
    rawType === "guide_index" ||
    rawType === "guide_detail" ||
    rawType === "guide_hub" ||
    rawType === "column_index" ||
    rawType === "column_detail" ||
    rawType === "heritage_index" ||
    rawType === "heritage_detail" ||
    rawType === "news_index" ||
    rawType === "news_detail" ||
    rawType === "other"
  ) {
    return rawType as AnalyticsPageType;
  }

  const isIndex = contentId === "index";

  switch (rawType) {
    case "top":
      return "home";

    case "hub":
      return "guide_hub";

    case "cars":
      return isIndex ? "cars_index" : "cars_detail";

    case "guide":
      return isIndex ? "guide_index" : "guide_detail";

    case "column":
      return isIndex ? "column_index" : "column_detail";

    case "heritage":
      return isIndex ? "heritage_index" : "heritage_detail";

    case "news":
      return isIndex ? "news_index" : "news_detail";

    default:
      return "other";
  }
}

export function ShelfImpression({
  shelfId,
  variant,
  threshold = 0.35,
  children,
  pageTypeOverride,
  contentIdOverride,
}: Props) {
  const ctx = usePageContext() as any;

  const ctxType =
    ctx?.page_type ?? ctx?.pageType ?? ctx?.type ?? ("unknown" as const);
  const ctxId =
    String(ctx?.content_id ?? ctx?.pageId ?? ctx?.page_id ?? ctx?.id ?? "");

  const contentId = String(contentIdOverride ?? ctxId ?? "");
  const pageType =
    pageTypeOverride ?? normalizePageType(ctxType, contentId || "");

  const { ref, hasImpression } = useImpressionOnce({ threshold });

  useEffect(() => {
    if (!hasImpression) return;

    trackInternalNavImpression({
      pageType,
      contentId,
      shelf_id: shelfId,
      shelf_variant: variant,
    });
  }, [hasImpression, pageType, contentId, shelfId, variant]);

  return <div ref={ref}>{children}</div>;
}
