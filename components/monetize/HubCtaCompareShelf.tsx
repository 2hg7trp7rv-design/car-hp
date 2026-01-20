"use client";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { HubCtaCard } from "@/components/monetize/HubCtaCard";
import { getOrAssignVariant } from "@/lib/analytics/experiments";
import { trackOutboundClick } from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";

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
        className="border border-slate-100/70 bg-white/70 shadow-soft-card"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              ALTERNATIVE
            </p>
            <h3 className="mt-2 font-serif text-[13px] font-semibold tracking-tight text-slate-900">
              {item.label}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              {item.description}
            </p>
          </div>

          <Button
            asChild
            size="sm"
            className="shrink-0 rounded-xl text-[10px] font-semibold tracking-[0.12em]"
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
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                OTHER ROUTES
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                迷いが違うと、入口も変わります。
              </p>
            </div>
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
