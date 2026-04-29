"use client";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { TrackedOutboundLink } from "@/components/analytics/TrackedOutboundLink";
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";

type Props = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  type?: "insurance" | "buy" | "sell" | "parts";
  monetizeKey?: string;
  ctaId?: string;
  position?: string;
};

const palette = {
  insurance: {
    shell: "bg-[linear-gradient(135deg,rgba(229,235,239,0.98),rgba(251,248,243,0.98))] border-[rgba(27,63,229,0.22)]",
    pill: "bg-[var(--surface-fog)] text-[var(--accent-base)] border-[rgba(27,63,229,0.22)]",
    button: "cobalt" as const,
  },
  buy: {
    shell: "bg-[linear-gradient(135deg,rgba(27,63,229,0.08),rgba(251,248,243,0.98))] border-[rgba(27,63,229,0.22)]",
    pill: "bg-[var(--surface-glow)] text-[var(--accent-strong)] border-[rgba(27,63,229,0.22)]",
    button: "primary" as const,
  },
  sell: {
    shell: "bg-[linear-gradient(135deg,rgba(241,226,216,0.98),rgba(251,248,243,0.98))] border-[rgba(27,63,229,0.22)]",
    pill: "bg-[var(--surface-wash)] text-[var(--accent-base)] border-[rgba(27,63,229,0.22)]",
    button: "primary" as const,
  },
  parts: {
    shell: "bg-[linear-gradient(135deg,rgba(238,231,222,0.98),rgba(251,248,243,0.98))] border-[rgba(76,69,61,0.22)]",
    pill: "bg-[var(--surface-2)] text-[var(--text-tertiary)] border-[rgba(76,69,61,0.22)]",
    button: "surface" as const,
  },
};

export function AffiliateCtaBlock({
  title,
  description,
  buttonLabel,
  href,
  type = "buy",
  monetizeKey,
  ctaId = "block",
  position = "content",
}: Props) {
  if (!ENABLE_MONETIZATION) return null;

  const tone = palette[type];

  return (
    <div className="my-10 not-prose">
      <GlassCard
        className={`relative overflow-hidden border p-6 shadow-soft-card md:p-8 ${tone.shell}`}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[rgba(251,248,243,0.55)] blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <p className={`mb-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.24em] uppercase ${tone.pill}`}>
              Recommendation
            </p>
            <h3 className="cb-sans-heading text-[22px] font-semibold leading-[1.25] text-[var(--text-primary)] md:text-[28px]">
              {title}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              {description}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              asChild
              magnetic
              variant={tone.button}
              size="lg"
              className="rounded-full px-8 text-sm font-semibold tracking-[0.08em]"
            >
              <TrackedOutboundLink
                href={href}
                monetizeKey={monetizeKey ?? type}
                ctaId={ctaId}
                position={position}
                rel="nofollow sponsored noopener noreferrer"
              >
                {buttonLabel}
              </TrackedOutboundLink>
            </Button>
            <p className="mt-3 text-center text-[10px] text-[var(--text-tertiary)]">
              公式サイトへ移動します
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
