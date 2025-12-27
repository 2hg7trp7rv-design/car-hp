import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { GuideMonetizeBlock } from "@/components/guide/GuideMonetizeBlock";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";

import { getAllCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";

export const metadata: Metadata = {
  title: "中古車検索HUB｜条件で探して、失敗を減らす",
  description: "市場の非公開在庫も含めて、条件に合う一台を見つけるための入口。まずは条件を揃え、判断材料を集めます。",
};

export const runtime = "edge";

export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "usedcar", limit: 10 });
  const cars = (await getAllCars()).slice(0, 6);

  const ctaVariant = "A";
  const base = "hub_usedcar";

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-4xl">
        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-400">
              HUB
            </p>
            <h1 className="serif-heading mt-2 text-3xl text-slate-100">中古車検索HUB</h1>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
              市場の非公開在庫も含めて、条件に合う一台を見つけるための入口。まずは条件を揃え、判断材料を集めます。
            </p>
          </header>
        </Reveal>

        {/* 1) 行動の入口（主要CTAは1つに絞る） */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-100">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
              まずは「条件を揃える」ことで、迷いの大半は減ります。煽らず、淡々と次の一歩だけ。
            </p>
            <div className="mt-4">
              <GuideMonetizeBlock
                monetizeKey="car_search_conditions"
                position="hub_top"
                ctaId={base + "_hub_top_car_search_conditions"}
                variant={ctaVariant}
                pageType="guide_hub"
                contentId="hub-usedcar"
              />
            </div>
          </Reveal>
        </section>

        {/* 2) 不安解消（関連GUIDE） */}
        <section className="mb-12">
          <Reveal>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-slate-500">
                  GUIDES
                </p>
                <h2 className="serif-heading mt-2 text-xl text-slate-100">不安を先に解消する</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                  判断材料を揃えてから動くと、失敗が減ります。
                </p>
              </div>
              <Link
                href="/guide"
                className="text-[10px] font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-300"
              >
                GUIDE一覧 →
              </Link>
            </div>

            <div className="mt-4">
              <HubRelatedGuidesGrid guides={guides.slice(0, 6)} fromIdOverride="hub-usedcar" />
            </div>
          </Reveal>
        </section>

        {/* 3) 次に読む（棚クリック計測） */}
        <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-usedcar" />

        {/* 下部：補足カード（世界観を壊さない簡易メモ） */}
        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-white/10 bg-white/5 p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-slate-400">
                ※ 本ページは「比較・見積もり」ではなく、判断の準備を整えるための入口です。
                最終的な手続きはリンク先で行われます。
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
