import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";
import { FaqList } from "@/components/guide/FaqList";

import { getIndexCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export const metadata: Metadata = {
  title: "査定準備HUB｜減額を避けるためのチェックポイント",
  description:
    "売却で損しがちなポイントは、査定前の準備でほぼ決まります。最低限の段取りを短くまとめました。",

  alternates: { canonical: "/guide/hub-sell-prepare" },
};


export default async function HubSellPreparePage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "docs",
      label: "まず書類（詰まらない準備）",
      description: "提出先と期限→必要書類→記入。順番でミスが減ります。",
      guides: reading.slice(0, 2),
    },
    {
      id: "quote",
      label: "次に査定（比較できる形にする）",
      description: "条件を揃えると、価格の比較が成立します。",
      guides: reading.slice(2, 4),
    },
    {
      id: "handoff",
      label: "最後に当日（やることを固定）",
      description: "当日の流れを決めると、連絡・持ち込みでバタつきません。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_sell_prepare";

  return (
    <main className="relative min-h-screen text-white pt-24 pb-20">
      <DetailFixedBackground />
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-4xl">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">HUB</p>
            <h1 className="serif-heading mt-2 text-3xl text-[#222222]">査定準備HUB</h1>
            <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/65">
              売却で損しがちなポイントは、査定前の準備でほぼ決まります。最低限の段取りを短くまとめました。
            </p>
          </header>
        </Reveal>

        <StickyConclusionCard
          title="売却準備は“書類→査定→当日”で詰まらない"
          bullets={[
            "必要書類を先に確定（提出先と期限）",
            "査定条件を揃える（比較）",
            "当日の流れを固定（やり直し防止）",
            "迷ったら“書類”に戻る",
          ]}
          note="このHUBは、売却準備で詰まりやすいポイントを先回りで潰すPillarです。"
        />

        {/* 1) 行動の入口（主要CTAは1つに絞る） */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-[#222222]">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
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
            <h2 className="serif-heading text-xl text-[#222222]">準備チェック</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <GlassCard className="border border-[#222222]/12 bg-white/70 p-5 text-[#222222]/85 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-tiffany-600">CHECK</p>
                <h3 className="mt-2 text-sm font-semibold">減額されやすいポイント</h3>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[#222222]/65">
                  <li>・小傷/内装の汚れ（写真で分かるレベル）</li>
                  <li>・タイヤ/バッテリー/消耗品の状態</li>
                  <li>・整備記録や取扱説明書などの付属品</li>
                </ul>
              </GlassCard>
              <GlassCard className="border border-[#222222]/12 bg-white/70 p-5 text-[#222222]/85 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-tiffany-600">RULE</p>
                <h3 className="mt-2 text-sm font-semibold">先に決めること</h3>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[#222222]/65">
                  <li>・最低ライン（これ以下なら売らない）</li>
                  <li>・引き渡し希望日（いつまでに手放すか）</li>
                  <li>・連絡手段（電話が苦手なら先に決める）</li>
                </ul>
              </GlassCard>
            </div>
          </Reveal>
        </section>

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-sell-prepare"
          theme="light"
          shelfIdPrefix="hub_sell_prepare_reading"
        />

        {/* 3) 次に読む */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-[#222222]">次に読む</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
              準備ができたら、相場を掴んでから比較に入るとブレません。
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/guide/hub-sell-price"
                className="inline-flex items-center justify-center rounded-full border border-[#222222]/12 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#222222]/80 hover:border-tiffany-200 hover:text-tiffany-700"
              >
                相場の目安へ
              </Link>
              <Link
                href="/guide/hub-sell"
                className="inline-flex items-center justify-center rounded-full border border-[#222222]/12 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#222222]/80 hover:border-tiffany-200 hover:text-tiffany-700"
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
            <FaqList
          title="売却準備のFAQ"
          description="当日バタつく原因を先に消します。"
          items={[
            {
              q: "書類が足りないとどうなる？",
              a: "基本は手続きが止まります。提出先/期限→必要書類→記入の順で揃えると詰まりません。",
            },
            {
              q: "洗車や清掃はやるべき？",
              a: "やる価値はありますが、やり過ぎは不要です。“第一印象で減額を避ける”目的で最低限を整えます。",
            },
            {
              q: "査定前に修理した方がいい？",
              a: "費用倒れの可能性があります。減額幅と修理費の比較が先です。",
            },
          ]}
        />

        <HubUpdateLog hubId="hub-sell-prepare" />


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

      </div>
    </main>
  );
}
