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
  title: "輸入車のトラブル対応ガイド｜症状の深刻度と修理の目安を整理",
  description:
    "症状の深刻度の判断から修理費用の目安まで、輸入車トラブル時に役立つ情報を置いています。",

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
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)] pt-24 pb-20">
      <DetailFixedBackground />
      <ScrollDepthTracker />

      <div className="container mx-auto px-4 md:max-w-4xl">
        <div className="porcelain porcelain-panel rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] text-[var(--text-primary)] shadow-soft-card backdrop-blur p-6 sm:p-8">

        <Reveal>
          <header className="mb-10">
            <h1 className="cb-sans-heading mt-2 text-3xl text-[var(--text-primary)]">
              輸入車のトラブル対応ガイド
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
              症状の深刻度の判断から修理費用の目安まで、輸入車トラブル時に役立つ情報を置いています。
            </p>
          </header>
        </Reveal>

        <StickyConclusionCard
          title="トラブル時の対応フロー"
          bullets={[
            "まず危険判定（走行OK/NG）",
            "次に費用レンジ（軽症/中/重）",
            "最後に業者へ（伝える情報を揃える）",
            "不安の正体を“手順”に変える",
          ]}
          note="輸入車トラブルで迷いやすい判断手順を整理するページです。"
        />

        {/* 1) 最初にやること */}
        <section className="mb-12">
          <Reveal>
            <h2 className="cb-sans-heading text-xl text-[var(--text-primary)]">最初にやること</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
              修理・保険・売却のどの選択肢が適切かを先に整理しておくと、対応がスムーズになります。
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
          title="おすすめ記事"
          steps={steps}
          fromIdOverride="hub-import-trouble"
          theme="light"
          shelfIdPrefix="hub_import_trouble_reading"
        />

        {/* 2) 関連ガイド */}
        <section className="mb-12">
          <Reveal>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[rgba(107,101,93,0.88)]">
                  ガイド
                </p>
                <h2 className="cb-sans-heading mt-2 text-xl text-[var(--text-primary)]">
                  症状別チェックガイド
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
                  警告灯・異音・漏れなど、まず切り分けるポイントをまとめて確認します。
                </p>
              </div>
              <Link
                href="/guide"
                className="text-[10px] font-medium tracking-[0.18em] text-[rgba(107,101,93,0.88)] hover:text-[var(--accent-strong)]"
              >
                ガイド一覧 →
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
          title="輸入車トラブルのよくある質問"
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
            <GlassCard className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-[rgba(76,69,61,0.82)]">
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
