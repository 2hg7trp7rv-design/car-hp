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

export const metadata: Metadata = {
  title: "売却相場HUB｜まず相場を掴んで、判断を早くする",
  description:
    "査定前に相場を押さえるだけで、迷いと損が減ります。比較の前の短い手順をまとめました。",

  alternates: { canonical: "/guide/hub-sell-price" },
};


export default async function HubSellPricePage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "baseline",
      label: "まず相場（判断の基準）",
      description: "基準が無いと比較がブレます。先に相場を掴みます。",
      guides: reading.slice(0, 2),
    },
    {
      id: "quote",
      label: "次に査定（条件を揃える）",
      description: "条件を揃えると、価格の比較が成立します。",
      guides: reading.slice(2, 4),
    },
    {
      id: "exit",
      label: "最後に売り方（出口で手残りが変わる）",
      description: "手残り/手間/確実性の優先順位で決めます。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_sell_price";

  return (
    <main className="min-h-screen bg-site text-text-main pt-24 pb-20">
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-4xl">
        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">HUB</p>
            <h1 className="serif-heading mt-2 text-3xl text-slate-900">売却相場HUB</h1>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
              査定前に相場を掴むだけで、迷いと損が減ります。比較の前の短い手順をまとめました。
            </p>
          </header>
        </Reveal>

        <StickyConclusionCard
          title="売却は“相場→査定→売り方”の順でやると損しにくい"
          bullets={[
            "相場を先に掴む（判断の基準）",
            "査定は条件を揃える（比較）",
            "売り方で手残りが変わる（出口）",
            "迷ったら“相場”に戻る",
          ]}
          note="このHUBは、売却の“相場の掴み方”を起点に迷いを潰すPillarです。"
        />

        {/* 1) 行動の入口（主要CTAは1つに絞る） */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              まずは「相場の目安」を先に取ります。ここがブレると、比較の判断が遅くなります。
            </p>
            <HubEntryShelf
              experimentId="hub_sell_price_entry"
              contentId="hub-sell-price"
              primaryA={{
                monetizeKey: "sell_price_check",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_price_check_A`,
              }}
              primaryB={{
                monetizeKey: "sell_timing",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_timing_B`,
              }}
              secondary={[
                {
                  monetizeKey: "sell_prepare",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_sell_prepare`,
                },
                {
                  monetizeKey: "sell_ikkatsu_phone",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_sell_ikkatsu_phone`,
                },
              ]}
            />
          </Reveal>
        </section>

        {/* 2) 最短チェック */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">最短チェック</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <GlassCard className="border border-slate-200/80 bg-white/70 p-5 text-slate-800 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-tiffany-600">POINT</p>
                <h3 className="mt-2 text-sm font-semibold">比較の前に揃える3つ</h3>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-600">
                  <li>・年式/走行距離/グレードは同じ条件で見る</li>
                  <li>・修復歴の有無は早めに確認する</li>
                  <li>・車検残やタイヤなど、減額の要因をメモする</li>
                </ul>
              </GlassCard>
              <GlassCard className="border border-slate-200/80 bg-white/70 p-5 text-slate-800 shadow-soft">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-tiffany-600">CAUTION</p>
                <h3 className="mt-2 text-sm font-semibold">よくあるズレ</h3>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-600">
                  <li>・最高額だけを見て期待値が上がる</li>
                  <li>・条件が違う相場を混ぜてしまう</li>
                  <li>・下取りと買取を同じ前提で比べる</li>
                </ul>
              </GlassCard>
            </div>
          </Reveal>
        </section>

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-sell-price"
          theme="light"
          shelfIdPrefix="hub_sell_price_reading"
        />

        {/* 3) 次に読む */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">次に読む</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              相場が掴めたら、次は「減額を避ける準備」と「売り方の選択」です。
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/guide/hub-sell-prepare"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 hover:border-tiffany-200 hover:text-tiffany-700"
              >
                査定前の準備へ
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
              contentId="hub-sell-price"
              shelfId={base + "_related_guides"}
            />
          </Reveal>
        </section>

        {/* 5) Next Read */}
        <section className="mb-2">
          <Reveal>
            <FaqList
          title="売却相場のFAQ"
          description="よくある誤解を先に潰します。"
          items={[
            {
              q: "一括査定は危険？",
              a: "危険というより“条件が揃わないとブレる”のが問題です。相場→条件統一→比較の順で進めるとリスクが下がります。",
            },
            {
              q: "走行距離が多いと売れない？",
              a: "売れないわけではありません。価格は下がりますが、相場を先に掴めば現実的な落とし所が作れます。",
            },
            {
              q: "傷や凹みは直してから？",
              a: "費用倒れになることがあります。相場と減額幅を見てから判断するのが安全です。",
            },
          ]}
        />

        <HubUpdateLog hubId="hub-sell-price" />


            <HubNextReadShelf
              title="次に読む（CARS）"
              cars={cars}
              pageType="guide_hub"
              contentId="hub-sell-price"
              shelfId={base + "_next_read"}
            />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
