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
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";

import { getIndexCars } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";

export const metadata: Metadata = {
  title: "車検HUB｜費用と流れを理解して、無駄を減らす",
  description:
    "車検の費用・内訳・当日の流れ・落ちやすいポイントを整理。相場を把握してから予約へ進むための入口。",

  alternates: { canonical: "/guide/hub-shaken" },
};


function pickShakenGuides(all: GuideItem[]): GuideItem[] {
  const keywords = ["車検", "ユーザー車検", "点検", "整備", "費用", "見積", "検査"]; 

  return all
    .filter((g) => {
      const title = g.title ?? "";
      const summary = g.summary ?? "";
      const tags = g.tags ?? [];
      const mk = (g as any).monetizeKey as string | undefined | null;

      if (mk === "shaken_rakuten") return true;
      if (keywords.some((k) => title.includes(k))) return true;
      if (keywords.some((k) => summary.includes(k))) return true;
      if (tags.some((t) => keywords.some((k) => t.includes(k)))) return true;

      return false;
    })
    .slice(0, 12);
}

export default async function HubShakenPage() {
  const allGuides = await getAllGuides();
  const guides = pickShakenGuides(allGuides);
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "baseline",
      label: "まず前提（何が検査で見られる？）",
      description: "通す/通さないの判断材料を先に揃える。",
      guides: reading.slice(0, 2),
    },
    {
      id: "cost",
      label: "次に費用（内訳と相場）",
      description: "相場を押さえて、過剰整備の不安を減らす。",
      guides: reading.slice(2, 4),
    },
    {
      id: "execute",
      label: "最後に実行（予約/持ち込み/当日の流れ）",
      description: "やることを固定して、当日バタつかない。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_shaken";

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
                <h1 className="serif-heading mt-2 text-3xl text-slate-900">車検HUB</h1>
                <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
                  まずは「費用の内訳」と「当日の流れ」を把握し、落とし穴を減らします。
                  そのうえで、対応店舗と概算を早めに押さえるのが最短です。
                </p>
              </header>
            </Reveal>

            {/* 1) 行動の入口 */}
            <section id="entry" className="mb-12 scroll-mt-24">
              <Reveal>
                <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  予約前に「相場」と「必要な整備」を把握しておくと、当日の判断がラクになります。
                </p>

                <HubEntryShelf
                  experimentId="hub_shaken_entry"
                  contentId="hub-shaken"
                  primaryA={{
                    monetizeKey: "shaken_rakuten",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_shaken_A`,
                  }}
                  primaryB={{
                    monetizeKey: "shaken_rakuten",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_shaken_B`,
                  }}
                  secondary={[
                    {
                      monetizeKey: "sell_timing",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_sell_timing`,
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

            <section className="mb-12">
              <Reveal>
                <ComparisonTable
                  theme="light"
                  title="車検の受け方（ざっくり比較）"
                  description="『安さ』だけで選ぶと、当日の追加整備でズレやすいです。優先したい軸（価格/安心/スピード）を先に決めます。"
                  columns={[
                    { label: "ディーラー" },
                    { label: "整備工場" },
                    { label: "車検チェーン" },
                    { label: "ユーザー車検" },
                  ]}
                  rows={[
                    {
                      label: "費用感",
                      values: ["△", "◯", "◯", "◎"],
                    },
                    {
                      label: "安心/品質",
                      values: ["◎", "◯", "◯", "△"],
                    },
                    {
                      label: "手間",
                      values: ["◎", "◯", "◯", "×"],
                    },
                    {
                      label: "向いている人",
                      values: [
                        "任せたい/純正志向",
                        "近所で相談したい",
                        "早く・分かりやすく",
                        "時間があり自分で動ける",
                      ],
                    },
                  ]}
                  footnote="※ 追加整備は車の状態次第です。見積もりで『必須整備』と『推奨整備』を分けてもらうと判断が速いです。"
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
                    <h2 className="serif-heading mt-2 text-xl text-slate-900">
                      まず把握しておきたいこと
                    </h2>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                      車検の費用感・落ちやすいポイント・当日の流れをまとめて確認。
                    </p>
                  </div>
                  <Link
                    href="/guide"
                    className="text-[10px] font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-700"
                  >
                    GUIDE一覧 →
                  </Link>
                </div>

                <div className="mt-4">
                  <HubRelatedGuidesGrid guides={guides.slice(0, 9)} fromIdOverride="hub-shaken" />
                </div>
              </Reveal>
            </section>

            <HubReadingPath
              steps={steps}
              fromIdOverride="hub-shaken"
              shelfIdPrefix="hub_shaken_reading"
              theme="light"
            />

            <section className="mb-12">
              <Reveal>
                <FaqList
                  theme="light"
                  title="車検のFAQ"
                  description="予約前に、よくある不安を整理します。"
                  items={[
                    {
                      q: "車検はいつから受けられる？",
                      a: "一般に『満了日の2ヶ月前』から受検できます（地域・制度変更等で扱いが異なる場合があります）。余裕を持って早めに段取りするのが安全です。",
                    },
                    {
                      q: "落ちやすいポイントは？",
                      a: "タイヤ/ブレーキ/灯火類/排気などの消耗・不具合が多いです。事前点検で『必須』と『推奨』を分けてもらうと判断しやすくなります。",
                    },
                    {
                      q: "輸入車は費用が上がりやすい？",
                      a: "部品単価・工賃・診断機対応などで差が出やすいです。見積もりで内訳を確認し、必要整備の優先順位を決めるのがポイントです。",
                    },
                    {
                      q: "代車は出ますか？",
                      a: "店舗によります。必要なら予約時に『代車の有無/費用/保険』を確認しておくと当日困りません。",
                    },
                  ]}
                />
              </Reveal>
            </section>

            {/* 3) 次に読む */}
            <HubUpdateLog hubId="hub-shaken" />


            <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-shaken" />

            {/* 下部メモ */}
            <div className="mt-10">
              <Reveal>
                <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    ※ 車検費用・整備内容・代車等は地域・店舗・車種状態で変動します。
                    最終条件は必ずリンク先の公式ページ・店舗案内でご確認ください。
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
                  title="相場を押さえて、必須整備だけで通す"
                  bullets={[
                    "期限2ヶ月前から段取りすると余裕が出る",
                    "見積もりは『必須』と『推奨』を分けてもらう",
                    "価格だけで即決せず、内訳で判断する",
                    "不安なら複数店舗で見積もりを取る",
                  ]}
                  note="車検は“見積もりの取り方”で出費がブレます。"
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
