"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

import { trackOutboundClick, trackCtaImpression } from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";

type HubCtaCardProps = {
  partner:
    | "insweb"
    | "sompo_noru"
    | "enkilo"
    | "amazon"
    | "nagara_carwash"
    | "carclub"
    | "hidya";
  href: string;
  heading: string;
  body: string[];
  ctaLabel: string;
  ctaPosition: string;
  monetizeKey?: string;
  variant?: string;
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidContentId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value !== "unknown" &&
    value !== "top"
  );
}

export function HubCtaCard(props: HubCtaCardProps) {
  const { partner, href, heading, body, ctaLabel, ctaPosition, monetizeKey } = props;
  const variant = props.variant ?? "default";

  const { page_type, content_id } = usePageContext();
  const impressedKeysRef = useRef<Set<string>>(new Set());

  const external = isExternalHref(href);
  const rel = external ? "nofollow sponsored noopener noreferrer" : undefined;
  const target = external ? "_blank" : undefined;

  const canTrack = external && page_type === "hub" && isValidContentId(content_id);

  const effectiveMonetizeKey = isNonEmptyString(monetizeKey) ? monetizeKey : undefined;
  const monetizeKeyForEvent = effectiveMonetizeKey ?? `${partner}:${ctaPosition}`;

  useEffect(() => {
    if (!canTrack) return;

    const key = `${content_id}::${page_type}::${partner}::${ctaPosition}::${href}`;
    if (impressedKeysRef.current.has(key)) return;
    impressedKeysRef.current.add(key);

    trackCtaImpression({
      page_type: "hub",
      content_id,
      cta_id: monetizeKeyForEvent,
      monetize_key: monetizeKeyForEvent,
      position: ctaPosition,
      variant,
    });
  }, [
    canTrack,
    content_id,
    page_type,
    partner,
    ctaPosition,
    href,
    monetizeKeyForEvent,
    variant,
  ]);

  if (!ENABLE_MONETIZATION || !href) return null;

  return (
    <Reveal delay={120}>
      <section aria-label="おすすめの次のアクション" className="mt-10">
        <GlassCard
          padding="lg"
          magnetic={false}
          className="border border-[rgba(192,124,89,0.18)] bg-[linear-gradient(135deg,rgba(241,226,216,0.98),rgba(251,248,243,0.98))] shadow-soft-card"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3 md:max-w-[70%]">
              <span
                aria-label="PR"
                className="inline-flex w-fit rounded-full border border-[rgba(192,124,89,0.24)] bg-[rgba(241,226,216,0.85)] px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-clay)] uppercase"
              >
                PR
              </span>

              <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">
                次の行動
              </p>

              <h2 className="font-serif text-[22px] font-semibold leading-[1.28] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[26px]">
                {heading}
              </h2>

              {body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[13px] leading-[1.9] text-[var(--text-secondary)] sm:text-[14px]"
                >
                  {paragraph}
                </p>
              ))}

              <p className="pt-1 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
                ※ リンク先は外部サイトです。条件・手数料・注意事項などの最新情報は必ず各公式ページでご確認ください。
              </p>
            </div>

            <div className="shrink-0 md:text-right">
              <Button
                asChild
                size="lg"
                className="mt-2 w-full rounded-full px-6 text-[11px] font-semibold tracking-[0.12em] sm:w-auto"
              >
                <Link
                  href={href}
                  target={target}
                  rel={rel}
                  onClick={() => {
                    if (!canTrack) return;

                    trackOutboundClick({
                      page_type: "hub",
                      content_id,
                      partner,
                      url: href,
                      cta_position: ctaPosition,
                      monetize_key: monetizeKeyForEvent,
                      variant,
                    });
                  }}
                >
                  {ctaLabel}
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>
    </Reveal>
  );
}
