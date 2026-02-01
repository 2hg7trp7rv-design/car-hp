// app/guide/lease/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { FaqList } from "@/components/guide/FaqList";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";
import { HubCtaCompareShelf } from "@/components/monetize/HubCtaCompareShelf";


export const metadata: Metadata = {
  title: "定額カーリースの選び方｜比較・失敗回避のチェック",
  description:
    "月額だけで選ばない。契約条件（残価・中途解約・メンテ範囲）を読めるようにして、失敗しない比較へ進むためのハブ。",

  alternates: { canonical: "/guide/lease" },
};

const PICK_SLUGS = new Set([
  "loan-vs-lease-luxury-sedan",
  "subscription-vs-owning",
  "compare-loan-lease-zancre",
]);

function pickLeaseGuides(all: GuideItem[]): GuideItem[] {
  const picked = all.filter((g) => PICK_SLUGS.has(g.slug));
  return picked;
}

export default async function LeaseHubPage() {
  const all = await getAllGuides();
  const picks = pickLeaseGuides(all);

  // READING PATH: 迷ったらこの順で読めばOK（最大6本）
  const reading = picks.slice(0, 6);
  const steps = [
    {
      id: "baseline",
      label: "まずは前提（損しない判断軸）",
      description: "契約の“落とし穴”を先に潰して、比較の土台を揃える。",
      guides: reading.slice(0, 2),
    },
    {
      id: "compare",
      label: "次に比較（総支払と出口条件）",
      description: "月額だけで決めない。出口（返却/買取/精算）まで確認する。",
      guides: reading.slice(2, 4),
    },
    {
      id: "execute",
      label: "最後に実行（契約前のチェック）",
      description: "契約前に確認すべき“文章”と、やってはいけない選び方を固める。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);

  const sompoLinks = resolveAffiliateLinksForGuide({
    monetizeKey: "lease_sompo_noru",
  });
  const sompoHref = sompoLinks?.leaseSompoNoruUrl ?? "";

  const enkiloLinks = resolveAffiliateLinksForGuide({
    monetizeKey: "lease_enkilo",
  });
  const enkiloHref = enkiloLinks?.leaseEnkiloUrl ?? "";

  return (
    <main className="min-h-screen bg-site text-text-main pb-20 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="lg:flex lg:items-start lg:gap-10">
          <div className="lg:flex-1">
            <Reveal delay={80}>
              <header className="mb-8">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                  GUIDE HUB
                </p>
                <h1 className="serif-heading mt-3 text-2xl text-slate-900 sm:text-3xl">
                  定額カーリースの選び方（条件の読み方）
                </h1>
                <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
                  「月額が安い」だけで決めると、条件の差で後からズレが出ます。
                  比較前に“見るべき条件”を押さえて、納得できる契約に寄せましょう。
                </p>
              </header>
            </Reveal>

            <section id="entry" className="scroll-mt-24">
              <HubCtaCompareShelf
                experimentId="hub_lease_entry"
                contentId="hub-lease"
                primaryA={{
                  partner: "sompo_noru",
                  href: sompoHref,
                  heading: "条件を理解したら、候補を絞って比較する",
                  body: [
                    "比較の前に、契約期間・メンテ範囲・中途解約条件を揃えるのがコツです。",
                    "候補が絞れたら、実際のプランを見て“月額の内訳”を確認しましょう。",
                  ],
                  ctaLabel: "定額カーリースのプランを見て条件を確認する",
                  ctaPosition: "hub_lease_primary_A",
                  monetizeKey: "lease_sompo_noru",
                }}
                primaryB={{
                  partner: "sompo_noru",
                  href: sompoHref,
                  heading: "月額の前に、条件の“差が出る場所”だけ見る",
                  body: [
                    "見るべきは、残価・メンテ範囲・中途解約の3つだけで十分です。",
                    "そこが揃ったら、月額の比較に進むとブレが減ります。",
                  ],
                  ctaLabel: "リースの候補プランを見て条件をチェックする",
                  ctaPosition: "hub_lease_primary_B",
                  monetizeKey: "lease_sompo_noru",
                }}
                secondary={[
                  {
                    label: "購入（ローン）と迷っている",
                    description: "月々の目安を出して、比較の土台を作る",
                    partner: "sompo_noru",
                    href: "/guide/hub-loan",
                    ctaLabel: "ローンHUBへ",
                    ctaPosition: "hub_lease_secondary_loan",
                  },
                  {
                    label: "保険も一緒に見直したい",
                    description: "条件を揃えて比較すると、差が見えやすい",
                    partner: "sompo_noru",
                    href: "/guide/insurance",
                    ctaLabel: "保険HUBへ",
                    ctaPosition: "hub_lease_secondary_insurance",
                  },
                  {
                    label: "走行距離が少ないなら",
                    description: "距離で支払うリースも比較対象に入れる",
                    partner: "enkilo",
                    href: enkiloHref,
                    ctaLabel: "エンキロを見る",
                    ctaPosition: "hub_lease_secondary_enkilo",
                    monetizeKey: "lease_enkilo",
                  },
                ]}
              />
            </section>

            <section className="mt-12">
              <Reveal delay={140}>
                <ComparisonTable
                  title="リースで差が出る条件（ここだけ見ればOK）"
                  description="月額の差は、ほぼこの3点から出ます。『条件を揃える』→『月額比較』の順で進むと失敗が減ります。"
                  columns={[
                    { label: "残価", subLabel: "出口の条件" },
                    { label: "メンテ範囲", subLabel: "含まれる/含まれない" },
                    { label: "中途解約", subLabel: "精算条件" },
                  ]}
                  rows={[
                    {
                      label: "見るポイント",
                      values: [
                        "返却時の追加精算・距離条件",
                        "消耗品/車検/故障対応の範囲",
                        "違約金・買取可否・乗換え条件",
                      ],
                    },
                    {
                      label: "落とし穴",
                      values: [
                        "距離/傷で追加費用",
                        "想定外の出費が残る",
                        "生活変化で縛られる",
                      ],
                    },
                    {
                      label: "おすすめ",
                      values: [
                        "走行距離は余裕を見て設定",
                        "“何が含まれるか”を文章で確認",
                        "短期で変化があるなら短め",
                      ],
                    },
                  ]}
                  footnote="※ 迷ったら、走行距離・契約年数・メンテ範囲を揃えてから月額比較に進みます。"
                />
              </Reveal>
            </section>

            <HubReadingPath
              steps={steps}
              fromIdOverride="lease"
              shelfIdPrefix="hub_lease_reading"
              theme="light"
            />

            <section className="mt-12">
              <Reveal delay={180}>
                <FaqList
                  title="カーリースのFAQ"
                  description="よくある不安を先に潰してから比較に進みます。"
                  items={[
                    {
                      q: "途中で解約できますか？",
                      a: "原則は可能ですが、精算（違約）条件が重くなりやすいです。契約前に“中途解約の精算ルール”を必ず確認します。",
                    },
                    {
                      q: "走行距離を超えるとどうなる？",
                      a: "超過精算が発生するケースが多いです。普段の走行距離に余裕を持たせた設定にしておくと安全です。",
                    },
                    {
                      q: "メンテ込みの範囲はどこまで？",
                      a: "プランによって差が大きいです。オイル・タイヤ・車検・故障対応まで含むのか、文章で確認するのが確実です。",
                    },
                    {
                      q: "ローンとどちらが得？",
                      a: "得かどうかは“出口条件と総支払”で決まります。月々の見やすさと自由度のどちらを優先するかで選ぶとブレにくいです。",
                    },
                  ]}
                />
              </Reveal>
            </section>

            <HubUpdateLog hubId="lease" />

            <Reveal delay={220}>
              <section className="mt-12">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
                      RECOMMENDED GUIDES
                    </p>
                    <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                      先に読んでおくと失敗しにくいGUIDE
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
                    <Reveal key={guide.id} delay={260 + index * 40}>
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

          <aside className="mt-10 lg:mt-0 lg:w-80">
            <div className="sticky top-24">
              <Reveal delay={160}>
                <StickyConclusionCard
                  theme="light"
                  title="月額の前に、条件3点だけ固定する"
                  bullets={[
                    "残価（距離/返却精算）を確認",
                    "メンテ範囲（含む/含まない）を文章で確認",
                    "中途解約の精算条件を確認",
                    "条件が揃ったら月額比較に進む",
                  ]}
                  note="迷いの9割は“条件差”から出ます。先に条件を固定すると比較が速いです。"
                  cta={{ href: "#entry", label: "行動の入口へ" }}
                />
              </Reveal>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
