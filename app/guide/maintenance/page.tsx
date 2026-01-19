import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { HubCtaCompareShelf } from "@/components/monetize/HubCtaCompareShelf";


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
    </div>
  );
}
