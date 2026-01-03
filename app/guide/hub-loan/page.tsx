import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { FaqList } from "@/components/guide/FaqList";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";

import { getAllCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";

export const metadata: Metadata = {
  title: "ローン/支払いHUB｜月々の目安を出して、現実を固める",
  description: "残クレ・リース・ローン。言葉の違いで迷う前に、まずは月々の目安と条件を整理します。",
};


export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "loan", limit: 10 });
  const cars = (await getAllCars()).slice(0, 6);
  const base = "hub_loan";

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
                <h1 className="serif-heading mt-2 text-3xl text-slate-100">ローン/支払いHUB</h1>
                <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
                  残クレ・リース・ローン。言葉の違いで迷う前に、まずは月々の目安と条件を整理します。
                </p>
              </header>
            </Reveal>

            {/* 1) 行動の入口（主要CTAは1つに絞る） */}
            <section id="entry" className="mb-12 scroll-mt-28">
              <Reveal>
                <h2 className="serif-heading text-xl text-slate-100">行動の入口</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                  まずは「条件を揃える」ことで、迷いの大半は減ります。煽らず、淡々と次の一歩だけ。
                </p>
                <HubEntryShelf
                  experimentId="hub_loan_entry"
                  contentId="hub-loan"
                  primaryA={{
                    monetizeKey: "loan_estimate",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_loan_estimate_A`,
                  }}
                  primaryB={{
                    monetizeKey: "loan_precheck",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_loan_precheck_B`,
                  }}
                  secondary={[
                    {
                      monetizeKey: "lease_compare",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_lease_compare`,
                    },
                    {
                      monetizeKey: "usedcar_search",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_usedcar_search`,
                    },
                  ]}
                />
              </Reveal>
            </section>

            {/* 1.5) 条件を揃えて比較（ミニ比較表） */}
            <section className="mb-12">
              <Reveal>
                <ComparisonTable
                  theme="dark"
                  title="支払い方法の比較（出口条件まで揃える）"
                  description="月々だけで決めると、出口（残価/返却/乗換え）でズレます。先に“条件”を固定して比較します。"
                  columns={[
                    { label: "ローン", subLabel: "所有前提" },
                    { label: "残クレ", subLabel: "出口条件が肝" },
                    { label: "リース", subLabel: "定額・返却" },
                    { label: "現金", subLabel: "総コスト明快" },
                  ]}
                  rows={[
                    {
                      label: "月々の安定",
                      values: ["◯", "◯", "◎", "—"],
                    },
                    {
                      label: "総支払の見えやすさ",
                      values: ["◯", "△（条件次第）", "△（残価/距離条件）", "◎"],
                    },
                    {
                      label: "途中での自由度",
                      values: ["◯（繰上げ等）", "△（精算条件）", "△（違約/精算）", "◎"],
                    },
                    {
                      label: "所有/資産性",
                      values: ["◎", "△（最終選択で変動）", "✕（基本は返却）", "◎"],
                    },
                    {
                      label: "向いている人",
                      values: ["長く乗る/自由度重視", "短期乗換え前提", "固定費で管理したい", "金利を避けたい"],
                    },
                  ]}
                  footnote="※ 残クレ/リースは『走行距離・返却条件・修復扱い』まで揃えて比較すると失敗が減ります。"
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
                  <HubRelatedGuidesGrid guides={guides.slice(0, 6)} fromIdOverride="hub-loan" />
                </div>
              </Reveal>
            </section>

            {/* 2.5) FAQ */}
            <section className="mb-12">
              <Reveal>
                <FaqList
                  theme="dark"
                  title="ローン/支払いでよくある質問"
                  description="審査や金利は“早めに現実を固定する”ほど、迷いが減ります。"
                  items={[
                    {
                      q: "事前審査はいつやるべき？",
                      a: "『欲しい車が決まる前』でも、月々上限や金利感を掴むために役立ちます。年収・勤続・借入状況が影響するので、無理のない範囲を先に把握しましょう。",
                    },
                    {
                      q: "金利は何を見ればいい？",
                      a: "名目金利だけでなく、手数料や保証料、繰上げ返済条件も確認します。期間が長いほど総支払に効きやすいので、条件を揃えて比較するのが基本です。",
                    },
                    {
                      q: "残クレの注意点は？",
                      a: "“出口条件”が本体です。走行距離・返却時の修復扱い・乗換え時の精算など、想定より厳しいと追加費用になりえます。",
                    },
                    {
                      q: "リースは途中でやめられますか？",
                      a: "途中解約は原則コストが発生しやすいです。契約年数・精算条件・距離条件を確認し、生活変化が大きいなら短めを検討します。",
                    },
                    {
                      q: "頭金は入れるべき？",
                      a: "月々を下げたいなら有効です。ただし手元資金が薄くなると故障・車検などで詰みやすいので、維持費の余裕を残すのが安全です。",
                    },
                  ]}
                />
              </Reveal>
            </section>

            {/* 3) 次に読む（棚クリック計測） */}
            <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-loan" />

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

          {/* 右：結論の固定表示（デスクトップ） */}
          <aside className="mt-10 lg:mt-0 lg:w-80">
            <div className="sticky top-28">
              <Reveal>
                <StickyConclusionCard
                  theme="dark"
                  title="まず“月々上限”と“出口条件”を固定する"
                  bullets={[
                    "月々の上限（生活費と維持費込み）を先に決める",
                    "金利・期間・頭金を揃えて比較する",
                    "残クレ/リースは走行距離と返却条件まで確認",
                    "迷ったら事前審査で現実を固める",
                  ]}
                  note="月々だけで決めると、出口でズレます。条件を揃えると判断が速いです。"
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
