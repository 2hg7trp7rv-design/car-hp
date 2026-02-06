import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { HubCtaCompareShelf } from "@/components/monetize/HubCtaCompareShelf";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { FaqList } from "@/components/guide/FaqList";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";


export const metadata: Metadata = {
  title: "メンテ用品の選び方｜洗車・車内・ドラレコ・バッテリー",
  description:
    "最低限そろえるメンテ用品を“順番”で。洗車・車内清掃・ドラレコ・バッテリー対策など、失敗しにくい定番をまとめたハブ。",

  alternates: { canonical: "/guide/maintenance" },
};

function pickMaintenanceGuides(all: GuideItem[]): GuideItem[] {
  return all
    .filter((g) => {
      const title = g.title ?? "";
      const mk = (g as any).monetizeKey as string | undefined | null;
      if (mk && mk.startsWith("goods_")) return true;
      if (title.includes("メンテ") || title.includes("洗車") || title.includes("車内"))
        return true;
      if (title.includes("ドラレコ") || title.includes("チャイルドシート"))
        return true;
      if (title.includes("バッテリー") || title.includes("ジャンプスターター"))
        return true;
      return false;
    })
    .slice(0, 12);
}

export default async function MaintenanceHubPage() {
  const all = await getAllGuides();
  const picks = pickMaintenanceGuides(all);

  // READING PATH: 迷ったらこの順で読めばOK（最大6本）
  const reading = picks.slice(0, 6);
  const steps = [
    {
      id: "basics",
      label: "まずは最低限（失敗しない基準）",
      description: "買う前に“基準”だけ決める。高い道具より“続く道具”が正義。",
      guides: reading.slice(0, 2),
    },
    {
      id: "priority",
      label: "次に、安心が増える順（保険的アイテム）",
      description: "ドラレコ/バッテリー対策など、“いざ”のリスクを先に潰す。",
      guides: reading.slice(2, 4),
    },
    {
      id: "extras",
      label: "最後に、快適性（生活のストレスを減らす）",
      description: "車内・収納・便利グッズは“困った順”に追加する。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);

  // Amazon
  const linksWash = resolveAffiliateLinksForGuide({ monetizeKey: "goods_car_wash_coating" });
  const linksRecorder = resolveAffiliateLinksForGuide({ monetizeKey: "goods_drive_recorder" });
  const linksJump = resolveAffiliateLinksForGuide({ monetizeKey: "goods_jump_starter" });
  const linksInterior = resolveAffiliateLinksForGuide({ monetizeKey: "goods_interior_clean" });

  // A8/ショップ
  const linksNagara = resolveAffiliateLinksForGuide({ monetizeKey: "goods_nagara_carwash" });
  const linksCarclub = resolveAffiliateLinksForGuide({ monetizeKey: "goods_carclub" });
  const linksHidya = resolveAffiliateLinksForGuide({ monetizeKey: "goods_hidya" });

  const washHref = linksWash?.amazonCarWashUrl ?? "";
  const recorderHref = linksRecorder?.amazonDriveRecorderUrl ?? "";
  const jumpHref = linksJump?.amazonJumpStarterUrl ?? "";
  const interiorHref = linksInterior?.amazonInteriorCleanUrl ?? "";
  const nagaraHref = linksNagara?.goodsNagaraCarwashUrl ?? "";
  const carclubHref = linksCarclub?.goodsCarclubUrl ?? "";
  const hidyaHref = linksHidya?.goodsHidyaUrl ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <Reveal delay={80}>
        <header className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            GUIDE HUB
          </p>
          <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
            メンテ用品の選び方（まず揃える定番）
          </h1>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
            いきなり全部は揃えなくてOKです。日常で困りやすい順に、最低限の定番を“薄く”揃えるのが現実的。
            この記事群は、その順番と基準をまとめたハブです。
          </p>
        </header>
      </Reveal>

      <StickyConclusionCard
        title="最初は“全部揃えない”。困る順に薄く揃えるのが正解。"
        bullets={[
          "洗車は“続く道具”を優先（高級品より時短）",
          "ドラレコは画質と取り付けやすさが最優先（迷うほど損）",
          "バッテリー上がり対策は“持っているだけ”で安心が増える",
          "適合/サイズだけは必ず確認（買い直しが一番高い）",
        ]}
        note="このハブは“買う順番”を固定して、無駄買いを減らすためのPillarです。"
      />

      <section className="mt-10" aria-label="状況別分岐">
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
            BRANCH
          </p>
          <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
            状況別分岐：まずは“必要な棚”だけ選ぶ
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-slate-600">
            洗車/ドラレコ/バッテリー対策。目的が決まれば、選ぶべき道具も一気に絞れます。
          </p>
        </div>

        <HubCtaCompareShelf
        experimentId="hub_maintenance_entry"
        contentId="hub-maintenance"
        primaryA={{
          partner: "nagara_carwash",
          href: nagaraHref,
          heading: "まずは“洗車・基本ケア”を続けられる道具で揃える",
          body: [
            "洗車は“やり方”より、まず続けられる道具選びで差が出ます。",
            "時短・手洗い・こだわりの方向性に合わせて、定番アイテムから揃えてみてください。",
          ],
          ctaLabel: "ながら洗車の定番アイテムを見る",
          ctaPosition: "hub_maintenance_primary_A",
          monetizeKey: "goods_nagara_carwash",
        }}
        primaryB={{
          partner: "amazon",
          href: recorderHref,
          heading: "ドラレコは“いざ”のための保険。まずは定番から",
          body: [
            "画質と取り付けのしやすさが最優先です。",
            "迷うならレビュー数の多い定番を選び、まず“録れる状態”を作ります。",
          ],
          ctaLabel: "Amazonでドラレコの定番を見て比較する",
          ctaPosition: "hub_maintenance_primary_B",
          monetizeKey: "goods_drive_recorder",
        }}
        secondary={[
          {
            label: "バッテリー上がりが心配",
            description: "ジャンプスターターは“持っているだけ”で安心が増える",
            partner: "amazon",
            href: jumpHref,
            ctaLabel: "定番を見る",
            ctaPosition: "hub_maintenance_secondary_jump",
            monetizeKey: "goods_jump_starter",
          },
          {
            label: "車内をきれいに保ちたい",
            description: "クリーナー類は“定番セット”にしておくと、汚れた瞬間に動ける",
            partner: "amazon",
            href: interiorHref,
            ctaLabel: "定番を見る",
            ctaPosition: "hub_maintenance_secondary_interior",
            monetizeKey: "goods_interior_clean",
          },
          {
            label: "カー用品をまとめて揃えたい",
            description: "ボディカバーや便利グッズをカテゴリで絞って探す",
            partner: "carclub",
            href: carclubHref,
            ctaLabel: "CARCLUBを見る",
            ctaPosition: "hub_maintenance_secondary_carclub",
            monetizeKey: "goods_carclub",
          },
          {
            label: "ライトを明るくしたい",
            description: "LED/HIDは適合を押さえて候補を比較する",
            partner: "hidya",
            href: hidyaHref,
            ctaLabel: "HID屋を見る",
            ctaPosition: "hub_maintenance_secondary_hidya",
            monetizeKey: "goods_hidya",
          },
        ]}
      />

      </section>

      <HubReadingPath
        steps={steps}
        fromIdOverride="maintenance"
        shelfIdPrefix="hub_maintenance_reading"
      />

      <Reveal delay={180}>
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
                RECOMMENDED GUIDES
              </p>
              <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                目的別：まず読んでおきたいGUIDE
              </h2>
            </div>
            <Link
              href="/guide"
              className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
            >
              GUIDE一覧へ →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {picks.map((guide, index) => (
              <Reveal key={guide.id} delay={220 + index * 40}>
                <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                  <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                      {guide.title}
                    </h3>
                    {guide.summary && (
                      <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                        {guide.summary}
                      </p>
                    )}
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <FaqList
        title="メンテ用品のFAQ"
        description="無駄買いしやすいポイントを先に潰します。"
        items={[
          {
            q: "最初から高い道具を揃えた方がいい？",
            a: "結論、最初は不要です。続かないと“ゼロ”になります。まずは定番・時短・取り回しの良さを優先して、回数を増やす方が確実に効果が出ます。",
          },
          {
            q: "ドラレコは前だけで十分？",
            a: "用途次第ですが、迷うなら前後を推奨します。追突の証明が必要になるケースが多く、後方が無いと判断材料が欠けます。",
          },
          {
            q: "ジャンプスターターは危ない？",
            a: "正しい手順なら危険度は下げられます。重要なのは“自分の車で使えるか（排気量/電圧/端子）”と“保護回路”。適合だけは必ず確認します。",
          },
        ]}
      />

      <HubUpdateLog hubId="maintenance" />
    </div>
  );
}
