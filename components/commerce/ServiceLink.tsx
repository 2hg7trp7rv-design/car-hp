"use client";

import type { ServiceOffer } from "@/lib/commerce";
import { trackOutboundClick } from "@/lib/analytics/events";

export function ServiceLink({ offer, label, contentId, className }: {
  offer: ServiceOffer;
  label: string;
  contentId: string;
  className?: string;
}) {
  return <a
    href={offer.href}
    rel={offer.sponsored ? "sponsored noopener" : "noopener"}
    target="_blank"
    className={className}
    onClick={() => {
      try {
        trackOutboundClick({
          href: offer.href,
          monetizeKey: `service.${offer.key}`,
          pageType: "other",
          contentId,
          position: "after-comparison",
          cta_id: `service-${offer.key}`,
          partner: offer.key,
          outbound_domain: offer.host,
        });
      } catch {
        // Analytics is optional; the native link must still navigate.
      }
    }}
  >{label}<span aria-hidden="true"> ↗</span></a>;
}
