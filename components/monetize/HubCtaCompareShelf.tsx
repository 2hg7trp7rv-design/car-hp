"use client";

import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

import { HubCtaCard } from "@/components/monetize/HubCtaCard";
import { getOrAssignVariant } from "@/lib/analytics/experiments";
import { trackOutboundClick } from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";

type Partner =
  | "insweb"
  | "sompo_noru"
  | "enkilo"
  | "amazon"
  | "nagara_carwash"
  | "carclub"
  | "hidya";

type PrimaryCard = {
  partner: Partner;
  href: string;
  heading: string;
  body: string[];
  ctaLabel: string;
  ctaPosition: string;
  monetizeKey?: string;
};

type MiniCard = {
  label: string;
  description: string;
  partner: Partner;
  href: string;
  ctaLabel: string;
  ctaPosition: string;
  monetizeKey?: string;
};

type Props = {
  experimentId: string;
  contentId: string;
  primaryA: PrimaryCard;
  primaryB: PrimaryCard;
  secondary: MiniCard[];
};

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function MiniCtaCard({ item, variant }: { item: MiniCard; variant: string }) {
  const { page_type, content_id } = usePageContext();
  const external = isExternalHref(item.href);

  const rel = external ? "nofollow sponsored noopener noreferrer" : undefined;
  const target = external ? "_blank" : undefined;

  const monetizeKeyForEvent = item.monetizeKey ?? `${item.partner}:${item.ctaPosition}`;
  const canTrack = external && page_type === "hub" && Boolean(content_id);

  return (
    <Reveal delay={80}>
      <GlassCard
        padding="lg"
        magnetic={false}
        className="border border-[var(--border-default)] bg-[var(--surface-1)] shadow-soft-card"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-[rgba(27,63,229,0.24)] bg-[var(--surface-glow)] px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-strong)] uppercase">
              Alternative
            </p>
            <h3 className="mt-3 font-sans text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
              {item.label}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
              {item.description}
            </p>
          </div>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="shrink-0 rounded-full text-[10px] font-semibold tracking-[0.12em]"
          >
            <Link
              href={item.href}
              target={target}
              rel={rel}
              onClick={() => {
                if (!canTrack) return;
                trackOutboundClick({
                  page_type: "hub",
                  content_id,
                  partner: item.partner,
                  url: item.href,
                  cta_position: item.ctaPosition,
                  monetize_key: monetizeKeyForEvent,
                  variant,
                });
              }}
            >
              {item.ctaLabel}
            </Link>
          </Button>
        </div>
      </GlassCard>
    </Reveal>
  );
}

export function HubCtaCompareShelf(props: Props) {
  if (!ENABLE_MONETIZATION) return null;

  const { experimentId, contentId, primaryA, primaryB, secondary } = props;

  const variant = getOrAssignVariant({
    experimentId,
    contentId,
    pageType: "guide_hub",
  });

  const primary = variant === "A" ? primaryA : primaryB;

  const filteredSecondary = secondary.filter((item) => {
    if (!item.href) return false;
    return !(
      item.href === primary.href &&
      item.partner === primary.partner &&
      item.ctaPosition === primary.ctaPosition
    );
  });

  return (
    <div>
      <HubCtaCard {...primary} variant={variant} />

      {filteredSecondary.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)] uppercase">
              Other routes
            </p>
            <p className="mt-2 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
              状況が違えば、比較先も変わります。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredSecondary.map((item) => (
              <MiniCtaCard key={item.ctaPosition + item.partner} item={item} variant={variant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
