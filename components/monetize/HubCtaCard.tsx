"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import { trackOutbound } from "@/lib/gtag";

type HubCtaCardProps = {
  partner: "insweb" | "sompo_noru" | "amazon";
  href: string;
  heading: string;
  body: string[];
  ctaLabel: string;
  ctaPosition: string;
};

export function HubCtaCard(props: HubCtaCardProps) {
  const { partner, href, heading, body, ctaLabel, ctaPosition } = props;

  if (!href) return null;

  const rel = "nofollow sponsored noopener";

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
                onClick={() => {
                  trackOutbound({
                    event: "outbound_click",
                    partner,
                    href,
                    cta_position: ctaPosition,
                  });
                }}
                asChild
                size="lg"
                className="mt-2 w-full rounded-xl text-[11px] font-semibold tracking-[0.12em] sm:w-auto"
              >
                <Link href={href} target="_blank" rel={rel}>
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
