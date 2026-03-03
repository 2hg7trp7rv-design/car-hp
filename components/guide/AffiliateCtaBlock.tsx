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

  const accents = {
    insurance: "from-blue-50 to-indigo-50 border-blue-100 text-blue-900",
    buy: "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-900",
    sell: "from-amber-50 to-orange-50 border-amber-100 text-amber-900",
    parts: "from-slate-50 to-slate-100 border-slate-200 text-slate-900",
  };

  const btnVariants = {
    insurance: "bg-blue-900 hover:bg-blue-800",
    buy: "bg-emerald-900 hover:bg-emerald-800",
    sell: "bg-amber-900 hover:bg-amber-800",
    parts: "bg-slate-800 hover:bg-slate-700",
  };

  return (
    <div className="my-10 not-prose">
      <GlassCard
        className={`relative overflow-hidden p-6 md:p-8 bg-gradient-to-br ${accents[type]} shadow-soft-card`}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.2em] opacity-60 mb-2 uppercase">
              RECOMMENDATION
            </p>
            <h3 className="serif-heading text-xl md:text-2xl font-semibold mb-3">
              {title}
            </h3>
            <p className="text-sm leading-relaxed opacity-80">{description}</p>
          </div>

          <div className="flex-shrink-0">
            <Button
              asChild
              magnetic
              className={`rounded-full px-8 py-6 text-sm font-bold shadow-soft-button transition-transform hover:-translate-y-1 ${btnVariants[type]}`}
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
            <p className="mt-2 text-[10px] text-center opacity-50">
              公式サイトへ移動します
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}