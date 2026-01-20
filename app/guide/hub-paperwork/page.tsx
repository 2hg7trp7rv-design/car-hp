import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";

import { getAllCars } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";

export const metadata: Metadata = {
  title: "名義変更・必要書類HUB｜手続きで詰まらないために",
  description:
    "名義変更（移転登録）や住所変更、車庫証明など“書類で止まりやすい所”を先に整理するハブ。売却・譲渡・乗り換え前の準備に。",

  alternates: { canonical: "/guide/hub-paperwork" },
};


function pickPaperworkGuides(all: GuideItem[]): GuideItem[] {
  // NOTE: Hub は「新着順 + キーワード」で並ぶが、
  // サイト初期は更新日が同日に揃って並びが不安定になりやすい。
  // ここでは“まず読ませたい柱”を先頭に固定する。
  const pinnedSlugs: string[] = [
    "meigi-henko-hitsuyou-shorui-futsuu",
    "meigi-henko-hitsuyou-shorui-kei",
    "jyuusho-henkou-shaken-shou",
    "shako-shoumei-torikata",
    "number-change-kibou-number-guide",
  ];

  const bySlug = new Map(all.map((g) => [g.slug, g] as const));
  const pinned = pinnedSlugs
    .map((s) => bySlug.get(s))
    .filter(Boolean) as GuideItem[];

  const keywords = [
    "名義",
    "名義変更",
    "必要書類",
    "書類",
    "住所変更",
    "車庫証明",
    "委任状",
    "譲渡",
    "移転登録",
    "抹消",
    "ナンバー",
  ];

  const rest = all
    .filter((g) => {
      if (pinnedSlugs.includes(g.slug)) return false;
      const title = g.title ?? "";
      const summary = g.summary ?? "";
      const tags = g.tags ?? [];

      if (keywords.some((k) => title.includes(k))) return true;
      if (keywords.some((k) => summary.includes(k))) return true;
      if (tags.some((t) => keywords.some((k) => t.includes(k)))) return true;

      return false;
    })

  return [...pinned, ...rest].slice(0, 12);
}

export default async function HubPaperworkPage() {
  const allGuides = await getAllGuides();
  const guides = pickPaperworkGuides(allGuides);
  const cars = (await getAllCars()).slice(0, 6);

  const base = "hub_paperwork";

  return (
    <main className="min-h-screen bg-site text-text-main pt-24 pb-20">
      <ScrollDepthTracker />

      <div className="container mx-auto px-4 md:max-w-4xl">
        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">
              HUB
            </p>
            <h1 className="serif-heading mt-2 text-3xl text-slate-900">
              名義変更・必要書類HUB
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
              手続きを始める前に、「必要書類」「管轄」「いつ・どこで手続きするか」を先に整理。
              書類で止まらないだけで、売却も譲渡もスムーズになります。
            </p>
          </header>
        </Reveal>

        {/* 1) 行動の入口 */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              まずは“詰まりやすい所”だけ先に潰す。準備が整ったら、比較や見積もりに進みます。
            </p>

            <HubEntryShelf
              experimentId="hub_paperwork_entry"
              contentId="hub-paperwork"
              primaryA={{
                monetizeKey: "sell_prepare",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_prepare_A`,
              }}
              primaryB={{
                monetizeKey: "sell_basic_checklist",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_basic_checklist_B`,
              }}
              secondary={[
                {
                  monetizeKey: "sell_price_check",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_sell_price_check`,
                },
                {
                  monetizeKey: "insurance_compare_core",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_insurance_compare_core`,
                },
              ]}
            />
          </Reveal>
        </section>

        {/* 2) 関連GUIDE */}
        <section className="mb-12">
          <Reveal>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-slate-500">
                  GUIDES
                </p>
                <h2 className="serif-heading mt-2 text-xl text-slate-900">
                  書類で止まらないための整理
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  名義変更・住所変更・車庫証明など、手続きの入口をまとめて確認します。
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
              <HubRelatedGuidesGrid guides={guides.slice(0, 9)} fromIdOverride="hub-paperwork" />
            </div>
          </Reveal>
        </section>

        {/* 3) 次に読む */}
        <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-paperwork" />

        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-slate-600">
                ※ 書類や必要手続きは「普通車/軽」「所有者/使用者」「住所変更の有無」などで変わります。
                不明点がある場合は、管轄の運輸支局・軽自動車検査協会・自治体の案内も合わせて確認してください。
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
