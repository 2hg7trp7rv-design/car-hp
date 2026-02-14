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
  title: "輸入車メンテ・故障HUB｜不安を現実の手順に変える",
  description:
    "輸入車の故障・警告灯・維持費の不安を、具体的な判断手順に落とし込むハブ。まずは優先順位と費用感を整理してから動く。",

  alternates: { canonical: "/guide/hub-import-trouble" },
};


function pickImportTroubleGuides(all: GuideItem[]): GuideItem[] {
  // NOTE: 更新日が同日に揃うと並びが不安定になりやすい。
  // まず読ませたい“初動ガイド”を先頭に固定する。
  const pinnedSlugs: string[] = [
    "engine-check-light-first-response",
    "overheat-coolant-leak-guide",
    "oil-leak-first-response",
  ];

  const bySlug = new Map(all.map((g) => [g.slug, g] as const));
  const pinned = pinnedSlugs
    .map((s) => bySlug.get(s))
    .filter(Boolean) as GuideItem[];

  const keywords = [
    "輸入車",
    "外車",
    "故障",
    "トラブル",
    "警告灯",
    "修理",
    "維持費",
    "メンテ",
    "点検",
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

export default async function HubImportTroublePage() {
  const allGuides = await getAllGuides();
  const guides = pickImportTroubleGuides(allGuides);
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "triage",
      label: "まずは危険判定（走行OK/NG）",
      description: "“今すぐ止めるべきか”が分かれば、無駄な不安と悪化を減らせます。",
      guides: reading.slice(0, 2),
    },
    {
      id: "cost",
      label: "次に費用（修理費レンジ）",
      description: "軽症/中/重のレンジだけ先に押さえて、判断を早くします。",
      guides: reading.slice(2, 4),
    },
    {
      id: "handoff",
      label: "最後に依頼（業者への伝え方）",
      description: "伝える順序を揃えると、診断が早く・見積もりがブレにくいです。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_import_trouble";

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
              輸入車メンテ・故障HUB
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/65">
              「壊れやすい？」を不安のまま放置しない。
              症状別の優先順位（すぐ止める/様子見できる）と、費用感の当たりを先に作ります。
            </p>
          </header>
        </Reveal>

        <StickyConclusionCard
          title="輸入車の不安は“危険判定→費用レンジ→依頼”に分解すると消える"
          bullets={[
            "まず危険判定（走行OK/NG）",
            "次に費用レンジ（軽症/中/重）",
            "最後に業者へ（伝える情報を揃える）",
            "不安の正体を“手順”に変える",
          ]}
          note="このHUBは、輸入車トラブルの“判断手順”を固定して、迷いと手戻りを減らすPillarです。"
        />

        {/* 1) 行動の入口 */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-[#222222]">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
              トラブル時は“出口”も同時に確保。
              修理・保険・売却のどこに着地するかで、意思決定が速くなります。
            </p>

            <HubEntryShelf
              experimentId="hub_import_trouble_entry"
              contentId="hub-import-trouble"
              primaryA={{
                monetizeKey: "insurance_compare_core",
                position: "hub_top",
                ctaId: `${base}_hub_top_insurance_compare_core_A`,
              }}
              primaryB={{
                monetizeKey: "sell_import_highclass",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_import_highclass_B`,
              }}
              secondary={[
                {
                  monetizeKey: "shaken_rakuten",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_shaken_rakuten`,
                },
                {
                  monetizeKey: "goods_jump_starter",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_goods_jump_starter`,
                },
              ]}
            />
          </Reveal>
        </section>

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-import-trouble"
          theme="light"
          shelfIdPrefix="hub_import_trouble_reading"
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
                  不安を“判断手順”にする
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
                  警告灯・異音・漏れなど、まず切り分けるポイントをまとめて確認します。
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
              <HubRelatedGuidesGrid
                guides={guides.slice(0, 9)}
                fromIdOverride="hub-import-trouble"
              />
            </div>
          </Reveal>
        </section>

        <FaqList
          title="輸入車トラブルのFAQ"
          description="不安が膨らみやすい“誤解”を先に潰します。"
          items={[
            {
              q: "警告灯が点いたら即レッカー？",
              a: "即レッカーが必要なケースもありますが、全てではありません。危険判定（走行OK/NG）を先に固定すると、無駄な出費と悪化を減らせます。",
            },
            {
              q: "ディーラーしか無理？",
              a: "症状と作業内容次第です。伝える情報を揃えると、専門店/整備工場でも診断が速くなります。",
            },
            {
              q: "費用が怖くて先延ばししたい",
              a: "先延ばしが高くつくケースがあります。最低でも“軽症/中/重”のレンジを押さえ、悪化ラインだけ把握してから判断します。",
            },
          ]}
        />

        {/* 3) 次に読む */}
        <HubUpdateLog hubId="hub-import-trouble" />


        <HubNextReadShelf
          guides={guides.slice(0, 6)}
          cars={cars}
          fromIdOverride="hub-import-trouble"
        />

        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-[#222222]/12 bg-white/70 p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-[#222222]/65">
                ※ 症状が重い場合（警告灯の点滅、焦げ臭い、冷却水漏れ、異常振動など）は、無理に走らず安全を優先してください。
                迷うときは「運転を続けてよい状態か」を先に確認するのが基本です。
              </p>
            </GlassCard>
          </Reveal>
        </div>
        </div>

      </div>
    </main>
  );
}
