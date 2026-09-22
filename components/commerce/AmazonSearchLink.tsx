"use client";

import type { AmazonSearchOffer } from "@/lib/commerce";
import { trackOutboundClick } from "@/lib/analytics/events";

export function AmazonSearchLink({ offer, contentId, className }: {
  offer: AmazonSearchOffer;
  contentId: string;
  className?: string;
}) {
  return <a href={offer.href} rel="sponsored noopener" className={className} onClick={() => {
    try {
      trackOutboundClick({
        href: offer.href,
        monetizeKey: `amazon.${offer.key}`,
        pageType: "other",
        contentId,
        position: "after-comparison",
        cta_id: `amazon-${offer.key}`,
        partner: "amazon",
        outbound_domain: "www.amazon.co.jp",
      });
    } catch {
      // Analytics is optional; the native link must still navigate.
    }
  }}>{offer.label}<span aria-hidden="true"> ↗</span></a>;
}
