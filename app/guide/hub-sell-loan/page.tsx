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

export const metadata: Metadata = {
  title: "売却HUB｜残債あり・名義・所有権を先に整理",
  description:
    "ローン残債や所有権で止まりやすい所を先に整理。必要書類・入金の流れ・確認ポイントをまとめます。",

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
    <main className="min-h-screen bg-site text-text-main pb-20 pt-24">
      <ScrollDepthTracker />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mb-6">
          <p className="text-[12px] tracking-wide text-slate-500">GUIDE HUB</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            残債ありの手放しを、先に片付ける
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            「売れるかどうか」より前に、手続きで止まるケースがあります。名義・所有権・入金の流れを
            先に整理して、比較に入れる状態にします。
          </p>
        </div>

        <StickyConclusionCard
          title="残債があっても売却は可能。鍵は“残債確認→精算→手続き”"
          bullets={[
            "残債を先に確定（数字）",
            "精算方法を決める（差額）",
            "所有権/名義の手続きを固定",
            "迷ったら“残債”に戻る",
          ]}
          note="このHUBは、ローン残債がある売却の手順を固定するPillarです。"
        />

        <GlassCard className="p-6 md:p-7">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
              BRANCH
            </p>
            <h2 className="mt-2 text-[14px] font-semibold tracking-wide text-slate-800">
              状況別分岐：まずはここから
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              “手続きが不安”な時は、必要書類と確認事項を先に揃えると、後から詰まりません。
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
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    “売却の全体像”は{" "}
                    <Link className="underline hover:text-tiffany-700" href="/guide/hub-sell">
                      こちら
                    </Link>
                    。比較の入口は{" "}
                    <Link className="underline hover:text-tiffany-700" href="/guide/hub-sell-compare">
                      比較HUB
                    </Link>
                    。
                  </p>
                }
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-[12px] leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-800">最低限の確認（3つ）</p>
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
            title="関連GUIDE（読み進める）"
            guides={guides}
            pageType="guide_hub"
            contentId="hub-sell-loan"
          />
        </div>

        <div className="mt-10">
          <FaqList
            title="ローン残債売却のFAQ"
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
            title="関連CARS（雰囲気で選ばない）"
            cars={cars}
            pageType="guide_hub"
            contentId="hub-sell-loan"
          />
        </div>
      </div>
    </main>
  );
}
