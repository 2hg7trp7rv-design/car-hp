// components/monetize/HubCtaCard.tsx
"use client";

import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { trackOutbound } from "@/lib/gtag";

type Props = {
  title: string;
  description: string;
  href: string;
  partner: "insweb" | "sompo_noru" | "amazon";
};

export function HubCtaCard({ title, description, href, partner }: Props) {
  const isExternal = href.startsWith("http");

  const onClick = () => {
    if (!isExternal) return;
    trackOutbound({
      event: "outbound_click",
      partner,
      href,
      cta_position: "hub",
    });
  };

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-semibold tracking-wide">PR</div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="text-sm opacity-80 leading-relaxed">{description}</p>

        {isExternal ? (
          <a
            href={href}
            onClick={onClick}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold border border-white/15 hover:border-white/30 transition"
          >
            比較・詳細を見る
          </a>
        ) : (
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold border border-white/15 hover:border-white/30 transition"
          >
            詳細を見る
          </Link>
        )}

        <p className="text-xs opacity-60 leading-relaxed">
          外部サイトへ移動します。内容・条件は移動先でご確認ください。
        </p>
      </div>
    </GlassCard>
  );
}
