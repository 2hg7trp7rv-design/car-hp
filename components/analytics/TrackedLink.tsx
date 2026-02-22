"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import {
  trackInternalNavClick,
  type InternalNavParams,
  type PageType,
} from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";

type ToType = InternalNavParams["to_type"]; // "cars" | "heritage" | "column" | "guide" | "hub"

type Props = {
  href: string;
  children: ReactNode;

  className?: string;
  ariaLabel?: string;
  prefetch?: boolean;

  /**
   * どこから来たか
   * - pageContext 側が "unknown" を返す可能性があるため、ここは string も許容して normalize する
   */
  fromType?: PageType | "unknown" | (string & {});
  fromId?: string;

  /**
   * どこへ行くか
   * - v1.2 の events.ts では to_type が "top" を許容しない（Exclude<PageType, "top">）
   */
  toType: ToType;
  toId: string;

  shelfId?: string;
  ctaId?: string;

  /**
   * リンク識別子（ctaIdの代替）
   * - page内の複数導線を区別したい時に使用
   */
  navId?: string;

  /** 目的地の補助情報（分析用） */
  toSlug?: string;
  toTitle?: string;

  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

function normalizeFromType(input: unknown): PageType {
  // v1.2 PageType に正規化（TrackedLink 側が "cars" / "top" / "hub" 等を返すことがある）
  switch (input) {
    case "top":
      return "home";

    case "cars":
      return "cars_detail";
    case "guide":
      return "guide_detail";
    case "column":
      return "column_detail";
    case "heritage":
      return "heritage_detail";

    case "news":
      return "news_detail";

    case "hub":
      return "guide_hub";

    case "search":
      return "search";

    case "compare":
      return "compare";

    // 既に v1.2 PageType が入っているならそのまま
    case "home":
    case "cars_index":
    case "cars_detail":
    case "guide_index":
    case "guide_detail":
    case "guide_hub":
    case "column_index":
    case "column_detail":
    case "heritage_index":
    case "heritage_detail":
    case "news_index":
    case "news_detail":
    case "search":
    case "other":
      return input;

    case "unknown":
    default:
      return "other";
  }
}

function normalizeToType(input: unknown): ToType {
  // ToType = Exclude<PageType, "top">
  switch (input) {
    case "cars":
    case "heritage":
    case "column":
    case "guide":
    case "hub":
    case "news":
    case "compare":
      return input as ToType;
    case "top":
    case "unknown":
    default:
      return "hub" as ToType;
  }
}

export function TrackedLink({
  href,
  children,
  className,
  ariaLabel,
  prefetch,
  onClick,

  fromType,
  fromId,

  toType,
  toId,

  shelfId,
  ctaId,
  navId,
  toSlug,
  toTitle,
}: Props) {
  const ctx = usePageContext() as any;

  // pageContext 側の実装差異に耐える（page_type / content_id など）
  const ctxType =
    ctx?.page_type ?? ctx?.pageType ?? ctx?.type ?? ("unknown" as const);
  const ctxId =
    ctx?.content_id ?? ctx?.pageId ?? ctx?.page_id ?? ctx?.id ?? "";

  const resolvedFromType = normalizeFromType(fromType ?? ctxType);
  const resolvedFromId = String(fromId ?? ctxId ?? "");

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      prefetch={prefetch}
      onClick={(e) => {
        onClick?.(e);

        trackInternalNavClick({
          // v1.2 必須
          pageType: resolvedFromType,
          contentId: resolvedFromId || "",

          // 既存互換
          from_type: resolvedFromType,
          from_id: resolvedFromId || "",
          to_type: normalizeToType(toType),
          to_id: String(toId),

          // 🔧 修正点：undefined を渡さない
          shelf_id: String(shelfId ?? ""),
          // cta_id が無い時は navId をフォールバック（棚内リンク識別）
          cta_id: String(ctaId ?? navId ?? ""),
          nav_id: String(navId ?? ""),
          to_slug: String(toSlug ?? ""),
          to_title: String(toTitle ?? ""),
        });
      }}
    >
      {children}
    </Link>
  );
}
