import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { FaqList } from "@/components/guide/FaqList";

import { getIndexCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export const metadata: Metadata = {
  title: "売却・乗り換え｜比較の使い方（電話・条件・断り方）",
  description:
    "一括査定や買取比較で詰まりやすいポイント（連絡・条件・減額）を先に整理。迷わず比較できる形にします。",

  alternates: { canonical: "/guide/hub-sell-compare" },
};

export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "criteria",
      label: "まず比較軸（手残り/手間/確実性）",
      description: "優先順位を先に決めると、迷いが消えます。",
      guides: reading.slice(0, 2),
    },
    {
      id: "numbers",
      label: "次に数字（相場/見積もり）",
      description: "条件を揃えて、比較が成立する状態にします。",
      guides: reading.slice(2, 4),
    },
    {
      id: "contract",
      label: "最後に契約（入金/名義/キャンセル）",
      description: "出口条件を確認して、トラブルを避けます。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 8);

  const base = "guide_hub_sell_compare";

  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground />
      <ScrollDepthTracker />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] text-[var(--text-primary)] shadow-soft-card backdrop-blur p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-[12px] tracking-wide text-[rgba(107,101,93,0.88)]">目的別に読む</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            比較の前提を整理する
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[rgba(76,69,61,0.82)]">
            売却は「相場」より先に、比較のやり方で損しやすいです。電話・条件・減額のズレを整理して、比較しやすい形にします。
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-[rgba(76,69,61,0.82)]">
            <span className="rounded-full border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] px-3 py-1 text-[rgba(31,28,25,0.8)]">
              連絡方法
            </span>
            <span className="rounded-full border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] px-3 py-1 text-[rgba(31,28,25,0.8)]">
              比較条件
            </span>
            <span className="rounded-full border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] px-3 py-1 text-[rgba(31,28,25,0.8)]">
              断り方
            </span>
          </div>
        </div>

        <StickyConclusionCard
          title="売却先の比較は“手残り・手間・確実性”の優先順位で決める"
          bullets={[
            "まず優先順位（何を重視？）",
            "条件を揃えて比較（相場/入金条件）",
            "出口条件（減額/キャンセル）を確認",
            "迷ったら“優先順位”に戻る",
          ]}
          note="比較前に見ておきたい順番を置いています。"
        />

        <GlassCard className="p-6 md:p-7">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[rgba(107,101,93,0.88)]">
              BRANCH
            </p>
            <h2 className="mt-2 text-[14px] font-semibold tracking-wide text-[rgba(31,28,25,0.86)]">
              状況別ガイド
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
              比較前に確認したい論点を置いています。
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
                  <p className="text-[11px] leading-relaxed text-[rgba(76,69,61,0.82)]">
                    “連絡が多いのが不安”な人ほど、最初に比較条件と断り方を決めておくと楽です。
                  </p>
                }
              />
            </div>

            <div className="mt-6 rounded-[20px] border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-4 text-[12px] leading-relaxed text-[rgba(31,28,25,0.8)]">
              <p className="font-semibold text-[rgba(31,28,25,0.86)]">迷ったときの順番</p>
              <ol className="mt-2 list-decimal pl-5">
                <li>条件を揃える（年式・走行・傷・修復など）</li>
                <li>相場を取る（同じ条件で）</li>
                <li>最後に決める（入金日・名義変更・キャンセル）</li>
              </ol>
              <p className="mt-3 text-[rgba(76,69,61,0.82)]">
                もっと基礎から見たい場合は{" "}
                <Link className="underline hover:text-[var(--accent-strong)]" href="/guide/hub-sell">
                  売却・乗り換え（全体像）
                </Link>{" "}
                へ。
              </p>
            </div>
          </Reveal>
        </GlassCard>

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-sell-compare"
          theme="light"
          shelfIdPrefix="hub_sell_compare_reading"
        />

        <div className="mt-10">
          <HubRelatedGuidesGrid
            title="関連ガイド（読み進める）"
            guides={guides}
            pageType="guide_hub"
            contentId="hub-sell-compare"
          />
        </div>

        <div className="mt-10">
          <FaqList
          title="売却先比較のよくある質問"
          description="比較で迷いやすいポイントを見ます。"
          items={[
            {
              q: "高く売れるのはどこ？",
              a: "ケースで変わります。重要なのは“比較条件を揃える”こと。揃えないと高い/安いの判断が崩れます。",
            },
            {
              q: "ディーラー下取りは損？",
              a: "損とは限りません。手間の少なさや値引きとの相殺も含めて“手残り”で比較します。",
            },
            {
              q: "減額トラブルが怖い",
              a: "事前に確認するポイント（修復歴/傷/付属品）を固定すると減額リスクは下がります。",
            },
          ]}
        />

        <HubUpdateLog hubId="hub-sell-compare" />


          <HubNextReadShelf
            title="関連車種（雰囲気で選ばない）"
            cars={cars}
            pageType="guide_hub"
            contentId="hub-sell-compare"
          />
        </div>
        </div>
      </div>
    </main>
  );
}
