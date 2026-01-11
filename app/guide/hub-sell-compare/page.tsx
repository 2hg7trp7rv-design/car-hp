import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";

import { getAllCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";

export const metadata: Metadata = {
  title: "売却HUB｜比較の使い方（電話・条件・断り方）",
  description:
    "一括査定や買取比較で詰まりやすいポイント（連絡・条件・減額）を先に整理。迷わず比較できる形にします。",

  alternates: { canonical: "/guide/hub-sell-compare" },
};

export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const cars = (await getAllCars()).slice(0, 8);

  const base = "guide_hub_sell_compare";

  return (
    <main className="min-h-screen bg-site text-text-main pb-20 pt-24">
      <ScrollDepthTracker />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mb-6">
          <p className="text-[12px] tracking-wide text-slate-500">GUIDE HUB</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            比較の使い方を先に揃える
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            売却は「相場」より先に、比較のやり方で損しやすいです。電話・条件・減額のズレを先に
            整えて、落ち着いて進められる形にします。
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-slate-700">
              連絡方法
            </span>
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-slate-700">
              比較条件
            </span>
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-slate-700">
              断り方
            </span>
          </div>
        </div>

        <GlassCard className="p-6 md:p-7">
          <Reveal>
            <h2 className="text-[14px] font-semibold tracking-wide text-slate-800">まずはここから</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              「条件を揃える」だけで、迷いとブレはかなり減ります。勢いで決めないための入口です。
            </p>

            <div className="mt-5">
              <HubEntryShelf
                experimentId="hub_sell_compare_entry"
                contentId="hub-sell-compare"
                primaryA={{
                  monetizeKey: "sell_basic_checklist",
                  position: "hub_top",
                  ctaId: `${base}_hub_top_sell_basic_checklist_A`,
                }}
                primaryB={{
                  monetizeKey: "sell_prepare",
                  position: "hub_top",
                  ctaId: `${base}_hub_top_sell_prepare_B`,
                }}
                secondary={[
                  {
                    monetizeKey: "sell_price_check",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_sell_price_check_secondary`,
                  },
                  {
                    monetizeKey: "sell_documents",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_sell_documents_secondary`,
                  },
                  {
                    monetizeKey: "sell_timing",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_sell_timing_secondary`,
                  },
                ]}
                note={
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    “連絡が多いのが不安”な人ほど、最初に比較条件と断り方を決めておくと楽です。
                  </p>
                }
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-[12px] leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-800">迷ったらこの順番</p>
              <ol className="mt-2 list-decimal pl-5">
                <li>条件を揃える（年式・走行・傷・修復など）</li>
                <li>相場を取る（同じ条件で）</li>
                <li>最後に決める（入金日・名義変更・キャンセル）</li>
              </ol>
              <p className="mt-3 text-slate-600">
                もっと基礎から見たい場合は{" "}
                <Link className="underline hover:text-tiffany-700" href="/guide/hub-sell">
                  売却HUB（全体像）
                </Link>{" "}
                へ。
              </p>
            </div>
          </Reveal>
        </GlassCard>

        <div className="mt-10">
          <HubRelatedGuidesGrid
            title="関連GUIDE（読み進める）"
            guides={guides}
            pageType="guide_hub"
            contentId="hub-sell-compare"
          />
        </div>

        <div className="mt-10">
          <HubNextReadShelf
            title="関連CARS（雰囲気で選ばない）"
            cars={cars}
            pageType="guide_hub"
            contentId="hub-sell-compare"
          />
        </div>
      </div>
    </main>
  );
}
