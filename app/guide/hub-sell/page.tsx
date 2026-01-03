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
  title: "売却HUB｜損しない準備をして、相場で迷わない",
  description: "売り時・減額ポイント・書類。先に準備を整えてから動くと、損が減ります。",
};


export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const cars = (await getAllCars()).slice(0, 6);

  const base = "hub_sell";

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
                <h1 className="serif-heading mt-2 text-3xl text-slate-100">売却HUB</h1>
                <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
                  売り時・減額ポイント・書類。先に準備を整えてから動くと、損が減ります。
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
                  experimentId="hub_sell_entry"
                  contentId="hub-sell"
                  primaryA={{
                    monetizeKey: "sell_basic_checklist",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_sell_basic_checklist_A`,
                  }}
                  primaryB={{
                    monetizeKey: "sell_price_check",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_sell_price_check_B`,
                  }}
                  secondary={[
                    {
                      monetizeKey: "sell_prepare",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_sell_prepare`,
                    },
                    {
                      monetizeKey: "sell_timing",
                      position: "hub_secondary",
                      ctaId: `${base}_hub_secondary_sell_timing`,
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
                  title="売却ルートの比較（条件を揃えると迷いが減る）"
                  description="“どれが一番得か”ではなく、あなたの優先順位（価格/手間/スピード）で選ぶための整理表です。"
                  columns={[
                    { label: "買取（複数）", subLabel: "相場が見えやすい" },
                    { label: "店舗買取（1社）", subLabel: "手間は少なめ" },
                    { label: "下取り", subLabel: "購入とセット" },
                    { label: "個人売買", subLabel: "上振れも" },
                  ]}
                  rows={[
                    {
                      label: "価格の期待値",
                      values: [
                        "◯（競争で上がりやすい）",
                        "△（相場が見えにくい）",
                        "△（値引きと混ざりやすい）",
                        "◎（上振れの可能性）",
                      ],
                    },
                    {
                      label: "手間",
                      values: [
                        "△（連絡/比較が必要）",
                        "◯（やり取りが少ない）",
                        "◎（手続きが最短）",
                        "✕（名変/支払い/トラブル対応）",
                      ],
                    },
                    {
                      label: "スピード",
                      values: ["◯", "◯", "◎", "△"],
                    },
                    {
                      label: "減額リスク",
                      values: [
                        "△（査定条件次第）",
                        "△",
                        "◯（購入条件に吸収されがち）",
                        "✕（交渉・クレーム対応）",
                      ],
                    },
                    {
                      label: "向いている人",
                      values: [
                        "相場を掴んで納得したい",
                        "面倒を減らしたい",
                        "乗り換えが決まっている",
                        "手間より価格を優先",
                      ],
                    },
                  ]}
                  footnote="※ 事故歴・修復歴・ローン残債・名義などの条件は、どのルートでも“先に揃える”ほど減額が減ります。"
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
                  <HubRelatedGuidesGrid guides={guides.slice(0, 6)} fromIdOverride="hub-sell" />
                </div>
              </Reveal>
            </section>

            {/* 2.5) FAQ */}
            <section className="mb-12">
              <Reveal>
                <FaqList
                  theme="dark"
                  title="売却でよくある質問"
                  description="“ここが不安で動けない”を先に潰すための確認ポイントです。"
                  items={[
                    {
                      q: "ローンが残っていても売れますか？",
                      a: "多くの場合は可能です。残債と売却額の差（追い金が要るか/手元に残るか）が重要です。名義がディーラー/信販の場合は、手続きと必要書類を先に確認しておくとスムーズです。",
                    },
                    {
                      q: "査定の減額を減らすコツは？",
                      a: "“申告漏れ”が一番危険です。修復歴・交換歴・警告灯・異音などは先に伝え、同条件で比較するのが基本です。写真や整備記録があると説明コストが下がります。",
                    },
                    {
                      q: "売り時はいつがいい？",
                      a: "相場は車種/グレード/需要期で動きますが、迷うなら『次の車が決まる前に相場確認 → 準備完了 → 条件を揃えて比較』の順で損を減らせます。",
                    },
                    {
                      q: "必要書類はいつ用意する？",
                      a: "査定前に全部揃える必要はありませんが、車検証・自賠責・納税証明・リサイクル券の所在は先に確認しておくと後半が速いです。",
                    },
                    {
                      q: "個人売買は本当に得？",
                      a: "上振れ余地はありますが、名義変更・支払い・トラブル対応まで自分で背負う必要があります。時間とリスク許容度がある人向けです。",
                    },
                  ]}
                />
              </Reveal>
            </section>

            {/* 3) 次に読む（棚クリック計測） */}
            <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-sell" />

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
                  title="迷ったら “準備→同条件で比較” だけやる"
                  bullets={[
                    "ローン残債・名義・書類の状況を先に整理",
                    "減額ポイント（傷/警告灯/整備記録）を先に把握",
                    "同条件で2〜3社に当たると相場が見える",
                    "急いで1社決めすると損が出やすい",
                  ]}
                  note="売却の“難しさ”は比較条件がバラけることです。条件を揃えると、ほぼ解決します。"
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
