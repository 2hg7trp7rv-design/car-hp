// app/guide/maintenance/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { HubCtaCard } from "@/components/monetize/HubCtaCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "メンテ用品 | GUIDE HUB | CAR BOUTIQUE",
  description:
    "最低限そろえるメンテ用品を“順番”で。洗車・車内清掃・ドラレコ・バッテリー対策など、失敗しにくい定番をまとめたハブ。",
};

function pickMaintenanceGuides(all: GuideItem[]): GuideItem[] {
  return all
    .filter((g) => {
      const title = g.title ?? "";
      const mk = (g as any).monetizeKey as string | undefined | null;
      if (mk && mk.startsWith("goods_")) return true;
      if (title.includes("メンテ") || title.includes("洗車") || title.includes("車内"))
        return true;
      if (title.includes("ドラレコ") || title.includes("チャイルドシート"))
        return true;
      if (title.includes("バッテリー") || title.includes("ジャンプスターター"))
        return true;
      return false;
    })
    .slice(0, 12);
}

export default async function MaintenanceHubPage() {
  const all = await getAllGuides();
  const picks = pickMaintenanceGuides(all);

  // Hubの“入口”は洗車/コーティングの検索リンクを採用（他カテゴリは記事内から回遊させる）
  const links = resolveAffiliateLinksForGuide({
    monetizeKey: "goods_car_wash_coating",
  });
  const amazonHref = links?.amazonCarWashUrl ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Reveal delay={80}>
        <header className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            GUIDE HUB
          </p>
          <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
            メンテ用品の選び方（まず揃える定番）
          </h1>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
            いきなり全部は揃えなくてOKです。日常で困りやすい順に、最低限の定番を“薄く”揃えるのが現実的。
            この記事群は、その順番と基準をまとめたハブです。
          </p>
        </header>
      </Reveal>

      <HubCtaCard
        partner="amazon"
        href={amazonHref}
        heading="まずは“洗車・基本ケア”の定番から揃える"
        body={[
          "洗車シャンプー＋クロス＋簡易コーティングがあるだけで、見た目と劣化の差が出ます。",
          "迷う場合は“中性シャンプー”を軸に、定番レビューの多いものから選ぶのが安全です。",
        ]}
        ctaLabel="Amazonで洗車・ケア用品をまとめて見る"
        ctaPosition="hub_maintenance_primary"
      />

      <Reveal delay={180}>
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
                RECOMMENDED GUIDES
              </p>
              <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                目的別：まず読んでおきたいGUIDE
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
