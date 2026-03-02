import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";
import { FaqList } from "@/components/guide/FaqList";

import { getIndexCars } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

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
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "baseline",
      label: "まずは交換の目安（損しない基準）",
      description: "交換時期が分かると、突然の出費と判断ミスが減ります。",
      guides: reading.slice(0, 2),
    },
    {
      id: "cost",
      label: "次に費用（いくらかかる？）",
      description: "相場を先に見て、過剰な提案や買い直しを避けます。",
      guides: reading.slice(2, 4),
    },
    {
      id: "execute",
      label: "最後に実行（買う/頼むの判断）",
      description: "自分でやる/店に任せるの境界を決めて、行動に落とします。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_consumables";

  return (
    <main className="relative min-h-screen text-white pt-24 pb-20">
      <DetailFixedBackground />
      <ScrollDepthTracker />

      <div className="container mx-auto px-4 md:max-w-4xl">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-tiffany-600">
              HUB
            </p>
            <h1 className="serif-heading mt-2 text-3xl text-[#222222]">
              タイヤ・バッテリー・消耗品HUB
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/65">
              交換の目安を先に押さえると、突然の出費と判断ミスが減ります。
              「今すぐ必要か」「次の車検まで持つか」を判断できる状態にします。
            </p>
          </header>
        </Reveal>

        <StickyConclusionCard
          title="消耗品は“交換目安”を先に覚えると、維持費が読めるようになる"
          bullets={[
            "交換の目安＝突然の出費を減らす",
            "相場を先に知る＝過剰な提案に振り回されない",
            "迷うなら定番から＝失敗コストが最小",
            "最後は“頼む/自分でやる”の境界を決める",
          ]}
          note="このHUBは、消耗品を“読める化”して、無駄な出費と判断ミスを減らすためのPillarです。"
        />

        {/* 1) 行動の入口 */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-[#222222]">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
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

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-consumables"
          theme="light"
          shelfIdPrefix="hub_consumables_reading"
        />

        {/* 2) 関連GUIDE */}
        <section className="mb-12">
          <Reveal>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[#222222]/55">
                  GUIDES
                </p>
                <h2 className="serif-heading mt-2 text-xl text-[#222222]">
                  交換目安と判断基準
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
                  交換タイミングのサイン・費用感・よくある落とし穴をまとめて確認します。
                </p>
              </div>
              <Link
                href="/guide"
                className="text-[10px] font-medium tracking-[0.18em] text-[#222222]/55 hover:text-tiffany-700"
              >
                GUIDE一覧 →
              </Link>
            </div>

            <div className="mt-4">
              <HubRelatedGuidesGrid guides={guides.slice(0, 9)} fromIdOverride="hub-consumables" theme="light" />
            </div>
          </Reveal>
        </section>

        <FaqList
          title="消耗品のFAQ"
          description="誤解しやすいポイントだけ先に潰します。"
          items={[
            {
              q: "交換は“まだ走れる”なら先延ばしでいい？",
              a: "危険度が上がる部品（タイヤ/ブレーキ周りなど）は先延ばしが高リスクです。目安を先に覚えて、判断を“当日”にしないのがコツです。",
            },
            {
              q: "安い消耗品でOK？",
              a: "目的次第です。迷うなら“定番”を推奨します。最初は失敗コスト（買い直し/作業の手戻り）が一番高いです。",
            },
            {
              q: "自分で交換しても大丈夫？",
              a: "安全に直結する部位は無理をしないのが原則です。迷うなら“店に任せる境界”を先に決めると迷いが減ります。",
            },
          ]}
        />

        {/* 3) 次に読む */}
        <HubUpdateLog hubId="hub-consumables" />


        <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-consumables" theme="light" />

        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-[#222222]/12 bg-white/70 p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-[#222222]/65">
                ※ “交換の目安”は走行距離・乗り方・保管環境で変わります。
                不安がある場合は、現物（残溝/劣化/漏れ/異音）を優先して判断し、整備工場の点検も併用してください。
              </p>
            </GlassCard>
          </Reveal>
        </div>
        </div>

      </div>
    </main>
  );
}
