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
  ctaPosition: string; // 例: "hub_top", "hub_middle"
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
  if (!ENABLE_MONETIZATION) return null;

  const { partner, href, heading, body, ctaLabel, ctaPosition, monetizeKey } =
    props;
  const variant = props.variant ?? "default";

  // ★ 計測の軸を usePageContext に統一（unknown / top を送らない）
  const { page_type, content_id } = usePageContext();

  if (!href) return null;

  const external = isExternalHref(href);
  const rel = external ? "nofollow sponsored noopener noreferrer" : undefined;
  const target = external ? "_blank" : undefined;

  const canTrack =
    external && page_type === "hub" && isValidContentId(content_id);

  const effectiveMonetizeKey = isNonEmptyString(monetizeKey)
    ? monetizeKey
    : undefined;

  // ★ monetize_key は必ず string（型エラー回避）。未設定時は CTA ID と同じフォールバックを使う
  const monetizeKeyForEvent = effectiveMonetizeKey ?? `${partner}:${ctaPosition}`;

  // ★ Impression は「同一ページ×同一CTA」で1回だけ
  const impressedKeysRef = useRef<Set<string>>(new Set());
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
    effectiveMonetizeKey,
    monetizeKeyForEvent,
    variant,
  ]);

  return (
    <Reveal delay={120}>
      <section aria-label="おすすめの次のアクション" className="mt-10">
        <GlassCard
          padding="lg"
          magnetic={false}
          className="border border-slate-100/80 bg-white/80 shadow-soft-card"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <span
              aria-label="PR"
              className="inline-flex w-fit rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-[10px] tracking-wide text-slate-600"
            >
              PR
            </span>

            <div className="space-y-2.5 md:max-w-[70%]">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                NEXT ACTION
              </p>

              <h2 className="font-serif text-[15px] font-semibold tracking-tight text-slate-900 sm:text-[16px]">
                {heading}
              </h2>

              {body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[11px] leading-relaxed text-slate-600 sm:text-[13px]"
                >
                  {paragraph}
                </p>
              ))}

              <p className="pt-1 text-[10px] leading-relaxed text-slate-400">
                ※ リンク先は外部サイトです。条件・手数料・注意事項などの最新情報は必ず各公式ページでご確認ください。
              </p>
            </div>

            <div className="shrink-0 md:text-right">
              <Button
                asChild
                size="lg"
                className="mt-2 w-full rounded-xl text-[11px] font-semibold tracking-[0.12em] sm:w-auto"
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