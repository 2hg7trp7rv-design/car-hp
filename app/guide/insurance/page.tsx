// app/guide/insurance/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { HubCtaCard } from "@/components/monetize/HubCtaCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "自動車保険 | GUIDE HUB | CAR BOUTIQUE",
  description:
    "補償条件を揃えてから比較する。見積もり前に迷いやすいポイントを整理して、最短で“納得できる保険”に近づくためのハブ。",
};

function pickInsuranceGuides(all: GuideItem[]): GuideItem[] {
  return all
    .filter((g) => {
      const title = g.title ?? "";
      const tags = g.tags ?? [];
      const mk = (g as any).monetizeKey as string | undefined | null;
      if (mk && mk.startsWith("insurance_")) return true;
      if (title.includes("保険")) return true;
      if (tags.some((t) => t.includes("保険"))) return true;
      return false;
    })
    .slice(0, 12);
}

export default async function InsuranceHubPage() {
  const all = await getAllGuides();
  const picks = pickInsuranceGuides(all);

  const links = resolveAffiliateLinksForGuide({
    monetizeKey: "insurance_compare_core",
  });

  const inswebHref = links?.insuranceCompareUrl ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Reveal delay={80}>
        <header className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            GUIDE HUB
          </p>
          <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
            自動車保険の見直し（比較の前に）
          </h1>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
            「どこが安い？」の前に、補償条件を揃えるだけで比較の精度が上がります。
            まずは“迷いやすい箇所”を潰してから見積もりへ進むのが最短です。
          </p>
        </header>
      </Reveal>

      <HubCtaCard
        partner="insweb"
        href={inswebHref}
        heading="補償条件を揃えたら、まとめて相場を取る"
        body={[
          "同じ条件で比べると、保険料の“差が出る理由”が見えます。",
          "まずは相場を取り、そこから必要な補償だけを残していくのが安全です。",
        ]}
        ctaLabel="一括見積もりで保険料の相場を確認する"
        ctaPosition="hub_insurance_primary"
      />

      <Reveal delay={180}>
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
                RECOMMENDED GUIDES
              </p>
              <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                まず読んでおきたい関連GUIDE
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
