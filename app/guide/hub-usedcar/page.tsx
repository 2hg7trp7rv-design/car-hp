import type { Metadata } from "next";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { FaqList } from "@/components/guide/FaqList";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";

import { getIndexCars } from "@/lib/cars";
import { getGuidesBySlugs, getGuidesForHub, type GuideItem } from "@/lib/guides";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export const metadata: Metadata = {
  title: "中古車検索HUB｜条件で探して、失敗を減らす",
  description: "市場の非公開在庫も含めて、条件に合う一台を見つけるための入口。まずは条件を揃え、判断材料を集めます。",

  alternates: { canonical: "/guide/hub-usedcar" },
};


export default async function HubPage() {
  const fixedStep1 = [
    "used-import-car-buying-guide",
    "repair-history-used-car-checklist",
  ];
  const fixedStep2 = [
    "tax-and-fees-before-buying-import",
    "new-grad-first-car-choice",
  ];
  const fixedStep3 = [
    "how-to-choose-first-sports-car",
    "self-gas-station-beginner-mistake",
  ];

  const fixedSlugs = [...fixedStep1, ...fixedStep2, ...fixedStep3];

  const fixedGuides = await getGuidesBySlugs(fixedSlugs);
  const fixedMap = new Map(fixedGuides.map((g) => [g.slug, g] as const));

  const step1Guides = fixedStep1
    .map((slug) => fixedMap.get(slug))
    .filter((g): g is GuideItem => Boolean(g));
  const step2Guides = fixedStep2
    .map((slug) => fixedMap.get(slug))
    .filter((g): g is GuideItem => Boolean(g));
  const step3Guides = fixedStep3
    .map((slug) => fixedMap.get(slug))
    .filter((g): g is GuideItem => Boolean(g));

  const guides = await getGuidesForHub({ kind: "usedcar", limit: 12 });
  const extraGuides = guides.filter((g) => !fixedSlugs.includes(g.slug));
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_usedcar";

  return (
    <main className="relative min-h-screen text-white pt-24 pb-20">
      <DetailFixedBackground />
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-6xl">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        <div className="lg:flex lg:items-start lg:gap-10">
          <div className="lg:flex-1">
            <Reveal>
              <header className="mb-10">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">
                  HUB
                </p>
                <h1 className="serif-heading mt-2 text-3xl text-[#222222]">中古車検索HUB</h1>
                <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/65">
                  市場の非公開在庫も含めて、条件に合う一台を見つけるための入口。まずは条件を揃え、判断材料を集めます。
                </p>
              </header>
            </Reveal>

            <HubReadingPath
              title="まず読む順番（この6本）"
              lead="迷ったらこの順番でOK。候補選び → 失敗回避 → 生活側の段取りまでを、最短で揃えます。"
              steps={[
                {
                  id: "first",
                  label: "まずこれ：候補選びと失敗回避",
                  description:
                    "候補の絞り方と、失敗しやすいポイントだけ先に押さえます。",
                  guides: step1Guides,
                },
                {
                  id: "middle",
                  label: "次にこれ：総額と生活コストを固める",
                  description:
                    "支払総額・税金・“初めての車”の落とし穴を先に潰します。",
                  guides: step2Guides,
                },
                {
                  id: "last",
                  label: "最後にこれ：最初の運用ミスを減らす",
                  description:
                    "買った後に詰まりやすい所（運転・給油など）を先に回避します。",
                  guides: step3Guides,
                },
              ]}
              fromIdOverride="hub-usedcar"
              theme="light"
              shelfIdPrefix="hub_usedcar_path"
            />

            <section className="mb-12">
              <Reveal>
                <ComparisonTable
                  theme="light"
                  title="中古車の探し方（ざっくり比較）"
                  description="“見つける”よりも、“同じ条件で比べる”が先です。総額・保証・整備記録で条件を揃えるとブレが減ります。"
                  columns={[
                    { label: "検索サイト" },
                    { label: "認定中古車" },
                    { label: "専門店" },
                    { label: "個人売買" },
                  ]}
                  rows={[
                    { label: "在庫量", values: ["◎", "△", "◯", "△"] },
                    { label: "保証/安心", values: ["◯", "◎", "◯", "△"] },
                    { label: "価格の振れ幅", values: ["◯", "△", "◯", "◎"] },
                    {
                      label: "向いている人",
                      values: [
                        "まず候補を広げたい",
                        "状態と保証を重視",
                        "特定ジャンル狙い",
                        "安さ優先で自己責任",
                      ],
                    },
                  ]}
                  footnote="※ 最終判断は“総額（諸費用込み）”と“保証の範囲”、そして“整備記録”で揃えるのがコツです。"
                />
              </Reveal>
            </section>

            {/* 行動の入口（主要CTAは“読む順番”の後） */}
            <section id="entry" className="mb-12 scroll-mt-24">
              <Reveal>
                <h2 className="serif-heading text-xl text-[#222222]">行動の入口</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
                  読む順番で判断材料が揃ったら、あとは条件を同じにして探すだけ。
                  先に“比較条件”を固定すると迷いが減ります。
                </p>
                <HubEntryShelf
                  experimentId="hub_usedcar_entry"
                  contentId="hub-usedcar"
                  primaryA={{
                    monetizeKey: "car_search_conditions",
                    position: "hub_mid",
                    ctaId: `${base}_hub_mid_car_search_conditions_A`,
                  }}
                  primaryB={{
                    monetizeKey: "usedcar_search",
                    position: "hub_mid",
                    ctaId: `${base}_hub_mid_usedcar_search_B`,
                  }}
                  secondary={[
                    {
                      monetizeKey: "usedcar_finance",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_usedcar_finance`,
                    },
                    {
                      monetizeKey: "loan_precheck",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_loan_precheck`,
                    },
                  ]}
                />
              </Reveal>
            </section>

            <section className="mb-12">
              <Reveal>
                <FaqList
                  theme="light"
                  title="中古車検索のFAQ"
                  description="“見る順番”を決めると迷いが減ります。"
                  items={[
                    {
                      q: "総額って何を含めて比べればいい？",
                      a: "車両本体だけでなく、諸費用（登録/整備/保証/税金）まで含めた“支払総額”で揃えます。条件が揃うと比較が速いです。",
                    },
                    {
                      q: "修復歴はどこまで気にする？",
                      a: "“修復歴あり”の定義は販売店の説明を必ず確認。走行に関わる骨格部位の修理はリスクが上がりやすいので、納得できる説明と保証が鍵です。",
                    },
                    {
                      q: "保証はあった方がいい？",
                      a: "輸入車や高年式は部品単価が高くなりがちです。予算に余裕がない場合ほど、保証範囲と免責（自己負担）を確認しておくと安心です。",
                    },
                    {
                      q: "試乗できない時はどうする？",
                      a: "試乗不可でも“点検記録簿/整備内容/第三者機関の検査”などで情報を補います。気になる点は書面で残すと後悔が減ります。",
                    },
                  ]}
                />
              </Reveal>
            </section>

            {/* 3) 次に読む（棚クリック計測） */}
            <HubUpdateLog hubId="hub-usedcar" />


            <HubNextReadShelf
              guides={extraGuides.slice(0, 6)}
              cars={cars}
              fromIdOverride="hub-usedcar"
            />

            {/* 下部：補足カード */}
            <div className="mt-10">
              <Reveal>
                <GlassCard className="border border-[#222222]/12 bg-white/70 p-6" padding="none">
                  <p className="text-[11px] leading-relaxed text-[#222222]/65">
                    ※ 本ページは「比較・見積もり」ではなく、判断の準備を整えるための入口です。
                    最終的な手続きはリンク先で行われます。
                  </p>
                </GlassCard>
              </Reveal>
            </div>
          </div>

          <aside className="mt-10 lg:mt-0 lg:w-80">
            <div className="sticky top-28">
              <Reveal>
                <StickyConclusionCard
                  theme="light"
                  title="“支払総額”で条件を揃える"
                  bullets={[
                    "迷ったら、まず“読む順番”で判断材料を揃える",
                    "本体価格ではなく支払総額で比較する",
                    "保証の範囲と免責を先に確認",
                    "候補を3台に絞ってから現車確認",
                  ]}
                  note="条件を揃えると、直感のミスが減ります。"
                  cta={{ href: "#reading", label: "読む順番へ" }}
                />
              </Reveal>
            </div>
          </aside>
        </div>
        </div>

      </div>
    </main>
  );
}
