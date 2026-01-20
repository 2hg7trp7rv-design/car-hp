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
  title: "査定準備HUB｜減額を避けるためのチェックポイント",
  description:
    "売却で損しがちなポイントは、査定前の準備でほぼ決まります。最低限の段取りを短くまとめました。",

  alternates: { canonical: "/guide/hub-sell-prepare" },
};


export default async function HubSellPreparePage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const cars = (await getAllCars()).slice(0, 6);

  const base = "hub_sell_prepare";

  return (
    <main className="min-h-screen bg-site text-text-main pt-24 pb-20">
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-4xl">
        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">HUB</p>
            <h1 className="serif-heading mt-2 text-3xl text-slate-900">査定準備HUB</h1>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
              売却で損しがちなポイントは、査定前の準備でほぼ決まります。最低限の段取りを短くまとめました。
            </p>
          </header>
        </Reveal>

        {/* 1) 行動の入口（主要CTAは1つに絞る） */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              比較を始める前に、減額要因を潰します。ここが弱いと、最後に金額が崩れやすいです。
            </p>
            <HubEntryShelf
              experimentId="hub_sell_prepare_entry"
              contentId="hub-sell-prepare"
              primaryA={{
                monetizeKey: "sell_prepare",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_prepare_A`,
              }}
              primaryB={{
                monetizeKey: "sell_basic_checklist",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_basic_checklist_B`,
              }}
              secondary={[
                {
                  monetizeKey: "sell_documents",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_sell_documents`,
                },
                {
                  monetizeKey: "sell_price_check",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_sell_price_check`,
                },
              ]}
            />
          </Reveal>
        </section>

        {/* 2) 準備チェック */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">準備チェック</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <GlassCard className="border border-slate-200/80 bg-white/70 p-5 text-slate-800 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-tiffany-600">CHECK</p>
                <h3 className="mt-2 text-sm font-semibold">減額されやすいポイント</h3>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-600">
                  <li>・小傷/内装の汚れ（写真で分かるレベル）</li>
                  <li>・タイヤ/バッテリー/消耗品の状態</li>
                  <li>・整備記録や取扱説明書などの付属品</li>
                </ul>
              </GlassCard>
              <GlassCard className="border border-slate-200/80 bg-white/70 p-5 text-slate-800 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-tiffany-600">RULE</p>
                <h3 className="mt-2 text-sm font-semibold">先に決めること</h3>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-600">
                  <li>・最低ライン（これ以下なら売らない）</li>
                  <li>・引き渡し希望日（いつまでに手放すか）</li>
                  <li>・連絡手段（電話が苦手なら先に決める）</li>
                </ul>
              </GlassCard>
            </div>
          </Reveal>
        </section>

        {/* 3) 次に読む */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">次に読む</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              準備ができたら、相場を掴んでから比較に入るとブレません。
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/guide/hub-sell-price"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 hover:border-tiffany-200 hover:text-tiffany-700"
              >
                相場の目安へ
              </Link>
              <Link
                href="/guide/hub-sell"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 hover:border-tiffany-200 hover:text-tiffany-700"
              >
                売却の全体の流れへ
              </Link>
            </div>
          </Reveal>
        </section>

        {/* 4) 関連GUIDE */}
        <section className="mb-14">
          <Reveal>
            <HubRelatedGuidesGrid
              title="売却・乗り換えの関連GUIDE"
              guides={guides}
              pageType="guide_hub"
              contentId="hub-sell-prepare"
              shelfId={base + "_related_guides"}
              theme="light"
            />
          </Reveal>
        </section>

        {/* 5) Next Read */}
        <section className="mb-2">
          <Reveal>
            <HubNextReadShelf
              title="次に読む（CARS）"
              cars={cars}
              pageType="guide_hub"
              contentId="hub-sell-prepare"
              shelfId={base + "_next_read"}
              theme="light"
            />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
