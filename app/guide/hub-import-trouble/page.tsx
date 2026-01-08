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
  const cars = (await getAllCars()).slice(0, 6);

  const base = "hub_import_trouble";

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
              輸入車メンテ・故障HUB
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600">
              「壊れやすい？」を不安のまま放置しない。
              症状別の優先順位（すぐ止める/様子見できる）と、費用感の当たりを先に作ります。
            </p>
          </header>
        </Reveal>

        {/* 1) 行動の入口 */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-slate-900">行動の入口</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
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

        {/* 2) 関連GUIDE */}
        <section className="mb-12">
          <Reveal>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-slate-500">
                  GUIDES
                </p>
                <h2 className="serif-heading mt-2 text-xl text-slate-900">
                  不安を“判断手順”にする
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  警告灯・異音・漏れなど、まず切り分けるポイントをまとめて確認します。
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
              <HubRelatedGuidesGrid
                guides={guides.slice(0, 9)}
                fromIdOverride="hub-import-trouble"
              />
            </div>
          </Reveal>
        </section>

        {/* 3) 次に読む */}
        <HubNextReadShelf
          guides={guides.slice(0, 6)}
          cars={cars}
          fromIdOverride="hub-import-trouble"
        />

        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-slate-600">
                ※ 症状が重い場合（警告灯の点滅、焦げ臭い、冷却水漏れ、異常振動など）は、無理に走らず安全を優先してください。
                迷うときは「運転を続けてよい状態か」を先に確認するのが基本です。
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
