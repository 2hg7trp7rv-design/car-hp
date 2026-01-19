import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";

import { getAllCars } from "@/lib/cars";
import { getGuidesForHub } from "@/lib/guides";

export const metadata: Metadata = {
  title: "売却HUB｜残債あり・名義・所有権を先に整理",
  description:
    "ローン残債や所有権で止まりやすい所を先に整理。必要書類・入金の流れ・確認ポイントをまとめます。",

  alternates: { canonical: "/guide/hub-sell-loan" },
};

export default async function HubPage() {
  const guides = await getGuidesForHub({ kind: "sell", limit: 10 });
  const cars = (await getAllCars()).slice(0, 8);

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

        <GlassCard className="p-6 md:p-7">
          <Reveal>
            <h2 className="text-[14px] font-semibold tracking-wide text-slate-800">まずはここから</h2>
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

        <div className="mt-10">
          <HubRelatedGuidesGrid
            title="関連GUIDE（読み進める）"
            guides={guides}
            pageType="guide_hub"
            contentId="hub-sell-loan"
          />
        </div>

        <div className="mt-10">
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
