// app/guide/lease/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { HubCtaCard } from "@/components/monetize/HubCtaCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "定額カーリース | GUIDE HUB | CAR BOUTIQUE",
  description:
    "月額だけで選ばない。契約条件（残価・中途解約・メンテ範囲）を読めるようにして、失敗しない比較へ進むためのハブ。",
};

const PICK_SLUGS = new Set([
  "loan-vs-lease-luxury-sedan",
  "subscription-vs-owning",
  "compare-loan-lease-zancre",
]);

function pickLeaseGuides(all: GuideItem[]): GuideItem[] {
  const picked = all.filter((g) => PICK_SLUGS.has(g.slug));
  return picked;
}

export default async function LeaseHubPage() {
  const all = await getAllGuides();
  const picks = pickLeaseGuides(all);

  const links = resolveAffiliateLinksForGuide({
    monetizeKey: "lease_sompo_noru",
  });

  const sompoHref = links?.leaseSompoNoruUrl ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Reveal delay={80}>
        <header className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            GUIDE HUB
          </p>
          <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
            定額カーリースの選び方（条件の読み方）
          </h1>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
            「月額が安い」だけで決めると、条件の差で後からズレが出ます。
            比較前に“見るべき条件”を押さえて、納得できる契約に寄せましょう。
          </p>
        </header>
      </Reveal>

      <HubCtaCard
        partner="sompo_noru"
        href={sompoHref}
        heading="条件を理解したら、候補を絞って比較する"
        body={[
          "比較の前に、契約期間・メンテ範囲・中途解約条件を揃えるのがコツです。",
          "候補が絞れたら、実際のプランを見て“月額の内訳”を確認しましょう。",
        ]}
        ctaLabel="定額カーリースのプランを見て条件を確認する"
        ctaPosition="hub_lease_primary"
      />

      <Reveal delay={180}>
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
                RECOMMENDED GUIDES
              </p>
              <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                先に読んでおくと失敗しにくいGUIDE
              </h2>
            </div>
            <Link
              href="/guide"
              className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
            >
              GUIDE一覧へ →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {picks.map((guide, index) => (
              <Reveal key={guide.id} delay={220 + index * 40}>
                <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                  <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                      {guide.title}
                    </h3>
                    {guide.summary && (
                      <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                        {guide.summary}
                      </p>
                    )}
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
