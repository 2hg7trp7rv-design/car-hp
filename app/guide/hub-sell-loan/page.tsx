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
  title: "売却・乗り換え｜残債あり・名義・所有権を先に整理",
  description:
    "ローン残債や所有権で止まりやすい所を先に整理。必要書類・入金の流れ・確認ポイントを。",

  alternates: { canonical: "/guide/hub-sell-loan" },
};

export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "debt",
      label: "まず残債（数字を確定）",
      description: "残債が曖昧だと、売却も乗り換えも前に進みません。",
      guides: reading.slice(0, 2),
    },
    {
      id: "settle",
      label: "次に精算（どう払う？）",
      description: "売却額と残債の差額をどう処理するかを決めます。",
      guides: reading.slice(2, 4),
    },
    {
      id: "process",
      label: "最後に手続き（所有権/名義）",
      description: "書類と窓口を固定して、詰まりを減らします。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 8);

  const base = "guide_hub_sell_loan";

  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground />
      <ScrollDepthTracker />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] text-[var(--text-primary)] shadow-soft-card backdrop-blur p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-[12px] tracking-wide text-[rgba(107,101,93,0.88)]">目的別に読む</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            残債ありの手放しを、先に片付ける
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[rgba(76,69,61,0.82)]">
            「売れるかどうか」より前に、手続きで止まるケースがあります。名義・所有権・入金の流れを
            先に整理して、比較に入れる状態にします。
          </p>
        </div>

        <StickyConclusionCard
          title="残債があっても売却は可能。鍵は“残債確認→精算→手続き”"
          bullets={[
            "残債を確認する（数字）",
            "精算方法を決める（差額）",
            "所有権/名義の手続きを固定",
            "迷ったら“残債”に戻る",
          ]}
          note="ローン残債がある売却で確認したい手順を置いています。"
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
              必要書類と確認事項を整理しておくと、後から詰まりにくくなります。
            </p>

            <div className="mt-5">
              <HubEntryShelf
                experimentId="hub_sell_loan_entry"
                contentId="hub-sell-loan"
                primaryA={{
                  monetizeKey: "sell_documents",
                  position: "hub_top",
                  ctaId: `${base}_hub_top_sell_documents_A`,
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
                    monetizeKey: "sell_basic_checklist",
                    position: "hub_top",
                    ctaId: `${base}_hub_top_sell_basic_checklist_secondary`,
                  },
                ]}
                note={
                  <p className="text-[11px] leading-relaxed text-[rgba(76,69,61,0.82)]">
                    “売却の全体像”は{" "}
                    <Link className="underline hover:text-[var(--accent-strong)]" href="/guide/hub-sell">
                      こちら
                    </Link>
                    。比較ページは{" "}
                    <Link className="underline hover:text-[var(--accent-strong)]" href="/guide/hub-sell-compare">
                      比較
                    </Link>
                    。
                  </p>
                }
              />
            </div>

            <div className="mt-6 rounded-[20px] border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-4 text-[12px] leading-relaxed text-[rgba(31,28,25,0.8)]">
              <p className="font-semibold text-[rgba(31,28,25,0.86)]">最低限の確認（3つ）</p>
              <ul className="mt-2 list-disc pl-5">
                <li>所有権（信販/ディーラー名義など）</li>
                <li>残債の精算方法（入金タイミング）</li>
                <li>名義変更と必要書類（期限・不足の有無）</li>
              </ul>
            </div>
          </Reveal>
        </GlassCard>

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-sell-loan"
          theme="light"
          shelfIdPrefix="hub_sell_loan_reading"
        />

        <div className="mt-10">
          <HubRelatedGuidesGrid
            title="関連ガイド（読み進める）"
            guides={guides}
            pageType="guide_hub"
            contentId="hub-sell-loan"
          />
        </div>

        <div className="mt-10">
          <FaqList
            title="ローン残債売却のよくある質問"
            description="危ない落とし穴だけ先に潰します。"
            items={[
              {
                q: "残債があると売れない？",
                a: "売れます。ポイントは“残債額の確定”と“精算の段取り”。ここが曖昧だと話が進みません。",
              },
              {
                q: "所有権がディーラーだと面倒？",
                a: "手順は増えますが解決可能です。必要書類と窓口を先に固定します。",
              },
              {
                q: "売却額が残債を下回ったら？",
                a: "差額の支払いが必要になります。先に数字（残債/相場）を押さえてから判断します。",
              },
            ]}
          />

          <HubUpdateLog hubId="hub-sell-loan" />


          <HubNextReadShelf
            title="関連車種（雰囲気で選ばない）"
            cars={cars}
            pageType="guide_hub"
            contentId="hub-sell-loan"
          />
        </div>
        </div>
      </div>
    </main>
  );
}
