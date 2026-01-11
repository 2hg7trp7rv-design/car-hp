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
  title: "タイヤ・バッテリー・消耗品HUB｜交換の目安と選び方",
  description:
    "タイヤ/バッテリー/オイルなど消耗品の交換目安と、先に押さえるべき注意点をまとめたハブ。維持費を“読める化”して無駄を減らす。",

  alternates: { canonical: "/guide/hub-consumables" },
};


function pickConsumableGuides(all: GuideItem[]): GuideItem[] {
  // NOTE: 更新日が同日に揃うと並びが不安定になりやすい。
  // まず読ませたい“柱”を先頭に固定する。
  const pinnedSlugs: string[] = [
    "tire-replacement-cost-guide",
    "oil-change-frequency-guide",
  ];

  const bySlug = new Map(all.map((g) => [g.slug, g] as const));
  const pinned = pinnedSlugs
    .map((s) => bySlug.get(s))
    .filter(Boolean) as GuideItem[];

  const keywords = [
    "タイヤ",
    "バッテリー",
    "オイル",
    "ワイパー",
    "フィルター",
    "ブレーキ",
    "交換",
    "消耗",
    "メンテ",
    "車検",
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

export default async function HubConsumablesPage() {
  const allGuides = await getAllGuides();
  const guides = pickConsumableGuides(allGuides);
  const cars = (await getAllCars()).slice(0, 6);

  const base = "hub_consumables";

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
              タイヤ・バッテリー・消耗品HUB
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
              交換の目安を先に押さえると、突然の出費と判断ミスが減ります。
              「今すぐ必要か」「次の車検まで持つか」を判断できる状態にします。
            </p>
          </header>
        </Reveal>

        {/* 1) 行動の入口 */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              困ったときに“買って損しにくい定番”から。必要な範囲だけ揃えます。
            </p>

            <HubEntryShelf
              experimentId="hub_consumables_entry"
              contentId="hub-consumables"
              primaryA={{
                monetizeKey: "goods_jump_starter",
                position: "hub_top",
                ctaId: `${base}_hub_top_goods_jump_starter_A`,
              }}
              primaryB={{
                monetizeKey: "goods_car_wash_coating",
                position: "hub_top",
                ctaId: `${base}_hub_top_goods_car_wash_coating_B`,
              }}
              secondary={[
                {
                  monetizeKey: "goods_interior_clean",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_goods_interior_clean`,
                },
                {
                  monetizeKey: "goods_carclub",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_goods_carclub`,
                },
                {
                  monetizeKey: "goods_nagara_carwash",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_goods_nagara_carwash`,
                },
                {
                  monetizeKey: "shaken_rakuten",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_shaken_rakuten`,
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
                  交換目安と判断基準
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  交換タイミングのサイン・費用感・よくある落とし穴をまとめて確認します。
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
              <HubRelatedGuidesGrid guides={guides.slice(0, 9)} fromIdOverride="hub-consumables" theme="light" />
            </div>
          </Reveal>
        </section>

        {/* 3) 次に読む */}
        <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-consumables" theme="light" />

        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-slate-600">
                ※ “交換の目安”は走行距離・乗り方・保管環境で変わります。
                不安がある場合は、現物（残溝/劣化/漏れ/異音）を優先して判断し、整備工場の点検も併用してください。
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
