import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { FaqList } from "@/components/guide/FaqList";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";

import { getAllCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";

export const metadata: Metadata = {
  title: "中古車検索HUB｜条件で探して、失敗を減らす",
  description: "市場の非公開在庫も含めて、条件に合う一台を見つけるための入口。まずは条件を揃え、判断材料を集めます。",
};


export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "usedcar", limit: 10 });
  const cars = (await getAllCars()).slice(0, 6);

  const base = "hub_usedcar";

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-6xl">
        <div className="lg:flex lg:items-start lg:gap-10">
          <div className="lg:flex-1">
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

            {/* 1) 行動の入口 */}
            <section id="entry" className="mb-12 scroll-mt-24">
              <Reveal>
                <h2 className="serif-heading text-xl text-slate-100">行動の入口</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                  まずは「条件を揃える」ことで、迷いの大半は減ります。煽らず、淡々と次の一歩だけ。
                </p>
                <HubEntryShelf
                  experimentId="hub_usedcar_entry"
                  contentId="hub-usedcar"
                  primaryA={{
                    monetizeKey: "car_search_conditions",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_car_search_conditions_A`,
                  }}
                  primaryB={{
                    monetizeKey: "usedcar_search",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_usedcar_search_B`,
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
                <ComparisonTable
                  theme="dark"
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

            <section className="mb-12">
              <Reveal>
                <FaqList
                  theme="dark"
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
            <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-usedcar" />

            {/* 下部：補足カード */}
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

          <aside className="mt-10 lg:mt-0 lg:w-80">
            <div className="sticky top-28">
              <Reveal>
                <StickyConclusionCard
                  theme="dark"
                  title="“支払総額”で条件を揃える"
                  bullets={[
                    "本体価格ではなく総額で比較する",
                    "保証の範囲と免責を先に確認",
                    "整備記録・消耗品の状態を見る",
                    "候補を3台に絞ってから現車確認",
                  ]}
                  note="条件を揃えると、直感のミスが減ります。"
                  cta={{ href: "#entry", label: "行動の入口へ" }}
                />
              </Reveal>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
