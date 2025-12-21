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
  onClick,
}: Props) {
  const { page_type, content_id } = usePageContext();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      trackOutboundClick({
        page_type,
        content_id,
        page_slug: content_id,
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
