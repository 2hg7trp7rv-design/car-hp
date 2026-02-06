import type { Metadata } from "next";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { FaqList } from "@/components/guide/FaqList";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";

import { getIndexCars } from "@/lib/cars";
import { getGuidesBySlugs, getGuidesForHub, type GuideItem } from "@/lib/guides";

export const metadata: Metadata = {
  title: "ローン/支払いHUB｜月々の目安を出して、現実を固める",
  description: "残クレ・リース・ローン。言葉の違いで迷う前に、まずは月々の目安と条件を整理します。",

  alternates: { canonical: "/guide/hub-loan" },
};


export default async function HubPage() {
  const fixedStep1 = [
    "compare-loan-lease-zancre",
    "car-loan-interest-rate-guide",
  ];
  const fixedStep2 = ["loan-or-lump-sum", "car-budget-simulation"];
  const fixedStep3 = [
    "loan-vs-lease-luxury-sedan",
    "family-suv-budget-and-lifeplan",
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

  const guides = await getGuidesForHub({ kind: "loan", limit: 12 });
  const extraGuides = guides.filter((g) => !fixedSlugs.includes(g.slug));
  const cars = (await getIndexCars()).slice(0, 6);
  const base = "hub_loan";

  return (
    <main className="min-h-screen bg-site text-text-main pt-24 pb-20">
      <ScrollDepthTracker />
      <div className="container mx-auto px-4 md:max-w-6xl">
        <div className="lg:flex lg:items-start lg:gap-10">
          <div className="lg:flex-1">
            <Reveal>
              <header className="mb-10">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">
                  HUB
                </p>
                <h1 className="serif-heading mt-2 text-3xl text-slate-900">ローン/支払いHUB</h1>
                <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
                  残クレ・リース・ローン。言葉の違いで迷う前に、まずは月々の目安と条件を整理します。
                </p>
              </header>
            </Reveal>

            <HubReadingPath
              title="まず読む順番（この6本）"
              lead="迷ったらこの順番でOK。言葉の違いでブレる前に、数字と条件を先に固定します。"
              steps={[
                {
                  id: "first",
                  label: "まずこれ：用語を整理して比較の土台を作る",
                  description: "ローン/残クレ/リースの違いと、金利の見方を最短で揃えます。",
                  guides: step1Guides,
                },
                {
                  id: "middle",
                  label: "次にこれ：支払いの現実を出す",
                  description:
                    "一括とローンの分岐、月々予算の作り方を先に固めて迷いを減らします。",
                  guides: step2Guides,
                },
                {
                  id: "last",
                  label: "最後にこれ：ケース別の落とし穴を潰す",
                  description:
                    "高級セダン/ファミリーSUVなど、買い方で差が出る所だけ確認します。",
                  guides: step3Guides,
                },
              ]}
              fromIdOverride="hub-loan"
              theme="light"
              shelfIdPrefix="hub_loan_path"
            />

            {/* 1.5) 条件を揃えて比較（ミニ比較表） */}
            <section className="mb-12">
              <Reveal>
                <ComparisonTable
                  theme="light"
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

            {/* 行動の入口（主要CTAは“読む順番”の後） */}
            <section id="entry" className="mb-12 scroll-mt-28">
              <Reveal>
                <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  読む順番で“比較条件”が固まったら、次は数字で現実を固定します。
                  先に上限を決めると、車選びでブレません。
                </p>
                <HubEntryShelf
                  experimentId="hub_loan_entry"
                  contentId="hub-loan"
                  primaryA={{
                    monetizeKey: "loan_estimate",
                    position: "hub_mid",
                    ctaId: `${base}_hub_mid_loan_estimate_A`,
                  }}
                  primaryB={{
                    monetizeKey: "loan_precheck",
                    position: "hub_mid",
                    ctaId: `${base}_hub_mid_loan_precheck_B`,
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

            {/* 2.5) FAQ */}
            <section className="mb-12">
              <Reveal>
                <FaqList
                  theme="light"
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
            <HubUpdateLog hubId="hub-loan" />


            <HubNextReadShelf
              guides={extraGuides.slice(0, 6)}
              cars={cars}
              fromIdOverride="hub-loan"
            />

            {/* 下部：補足カード（世界観を壊さない簡易メモ） */}
            <div className="mt-10">
              <Reveal>
                <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
                  <p className="text-[11px] leading-relaxed text-slate-600">
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
                  theme="light"
                  title="まず“月々上限”と“出口条件”を固定する"
                  bullets={[
                    "迷ったら、まず“読む順番”で条件を揃える",
                    "月々の上限（生活費と維持費込み）を先に決める",
                    "金利・期間・頭金を揃えて比較する",
                    "残クレ/リースは走行距離と返却条件まで確認",
                    "迷ったら事前審査で現実を固める",
                  ]}
                  note="月々だけで決めると、出口でズレます。条件を揃えると判断が速いです。"
                  cta={{ href: "#reading", label: "読む順番へ" }}
                />
              </Reveal>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
