"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePageContext } from "@/lib/analytics/pageContext";
import { trackOutboundClick } from "@/lib/analytics/events";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;

  target?: string;
  rel?: string;

  monetizeKey?: string;
  ctaId?: string;
  position?: string;
  partner?: string;

  /**
   * 互換（pageContext が取れない場所で手動指定したい場合）
   * - 未指定の場合は usePageContext() の値を使う
   */
  pageType?: string;
  contentId?: string;
  pageSlug?: string;

  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

function getDomain(href: string): string {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

export function TrackedOutboundLink({
  href,
  children,
  className,
  target = "_blank",
  rel = "nofollow sponsored noopener noreferrer",
  monetizeKey,
  ctaId,
  position,
  partner,
  pageType,
  contentId,
  pageSlug,
  onClick,
}: Props) {
  const { page_type, content_id } = usePageContext();
  const effectivePageType = pageType ?? page_type;
  const effectiveContentId = contentId ?? content_id;
  const effectivePageSlug = pageSlug ?? effectiveContentId;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      trackOutboundClick({
        page_type: effectivePageType,
        content_id: effectiveContentId,
        page_slug: effectivePageSlug,
        monetize_key: monetizeKey ?? "",
        cta_id: ctaId ?? "",
        position: position ?? "",
        url: href,
        outbound_domain: getDomain(href),
        partner,
      });
    } catch {
      // noop
    }

    onClick?.(e);
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
