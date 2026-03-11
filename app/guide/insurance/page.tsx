// app/guide/insurance/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, getGuidesBySlugs, type GuideItem } from "@/lib/guides";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { FaqList } from "@/components/guide/FaqList";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubCtaCompareShelf } from "@/components/monetize/HubCtaCompareShelf";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";


export const metadata: Metadata = {
  title: "自動車保険の見直し｜比較・節約・補償の考え方",
  description:
    "補償条件を揃えてから比較する。見積もり前に迷いやすいポイントを整理して、最短で“納得できる保険”に近づくためのハブ。",

  alternates: { canonical: "/guide/insurance" },
};

function pickInsuranceGuides(all: GuideItem[]): GuideItem[] {
  return all
    .filter((g) => {
      const title = g.title ?? "";
      const tags = g.tags ?? [];
      const mk = (g as any).monetizeKey as string | undefined | null;
      if (mk && mk.startsWith("insurance_")) return true;
      if (title.includes("保険")) return true;
      if (tags.some((t) => t.includes("保険"))) return true;
      return false;
    })
    .slice(0, 12);
}

export default async function InsuranceHubPage() {
  const all = await getAllGuides();
  const fixedStep1 = ["sharyou-hoken-necessary", "insurance-deductible-guide"];
  const fixedStep2 = [
    "tokkyu-hikisugi-chudan-guide",
    "road-service-choice-guide",
  ];
  const fixedStep3 = [
    "bengoshi-hiyou-tokuyaku-guide",
    "car-accident-first-10-minutes",
  ];
  const fixedSlugs = [...fixedStep1, ...fixedStep2, ...fixedStep3];

  const fixedGuides = await getGuidesBySlugs(fixedSlugs);
  const fixedMap = new Map(fixedGuides.map((g) => [g.slug, g] as const));

  const step1Guides = fixedStep1
    .map((slug) => fixedMap.get(slug))
    .filter((g): g is GuideItem => Boolean(g));
  const step2Guides = fixedStep2
    .map((slug) => fixedMap.get(slug))
    .filter((g): g is GuideItem => Boolean(g));
  const step3Guides = fixedStep3
    .map((slug) => fixedMap.get(slug))
    .filter((g): g is GuideItem => Boolean(g));

  const picks = pickInsuranceGuides(all)
    .filter((g) => !fixedSlugs.includes(g.slug))
    .slice(0, 6);

  const linksCore = resolveAffiliateLinksForGuide({ monetizeKey: "insurance_compare_core" });
  const linksSaving = resolveAffiliateLinksForGuide({ monetizeKey: "insurance_saving" });
  const linksConsult = resolveAffiliateLinksForGuide({ monetizeKey: "insurance_after_accident" });

  const compareHref = linksCore?.insuranceCompareUrl ?? "";
  const consultHref = linksConsult?.insuranceConsultUrl ?? "";
  const savingHref = linksSaving?.insuranceCompareUrl ?? compareHref;

  return (
    <main className="relative min-h-screen text-white pb-20 pt-24">
      <DetailFixedBackground />
      <ScrollDepthTracker />
      <div className="porcelain porcelain-panel mx-auto max-w-6xl px-4 sm:px-6 rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur">
        <div className="lg:flex lg:items-start lg:gap-10">
          <div className="lg:flex-1">
            <Reveal delay={80}>
              <header className="mb-8">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/45">
                  GUIDE HUB
                </p>
                <h1 className="serif-heading mt-3 text-2xl text-[#222222] sm:text-3xl">
                  自動車保険の見直し（比較の前に）
                </h1>
                <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-[#222222]/65 sm:text-[14px]">
                  「どこが安い？」の前に、補償条件を揃えるだけで比較の精度が上がります。
                  まずは“迷いやすい箇所”を潰してから見積もりへ進むのが最短です。
                </p>
              </header>
            </Reveal>

            <HubReadingPath
              title="まず読む順番（この6本）"
              lead="迷ったらこの順番でOK。補償設計の迷いどころだけ、先に潰します。"
              steps={[
                {
                  id: "first",
                  label: "まずこれ：車両保険と免責を決める",
                  description:
                    "『付ける/付けない』と『自己負担（免責）』を先に決めると比較が速いです。",
                  guides: step1Guides,
                },
                {
                  id: "middle",
                  label: "次にこれ：特約で迷う所だけ固める",
                  description:
                    "等級引き継ぎ・中断、ロードサービスなど“迷いやすい所”だけ確認します。",
                  guides: step2Guides,
                },
                {
                  id: "last",
                  label: "最後にこれ：事故時の動きと特約を押さえる",
                  description:
                    "万一のときに詰まらないよう、初動と弁護士費用などの要点を先に揃えます。",
                  guides: step3Guides,
                },
              ]}
              fromIdOverride="hub-insurance"
              theme="light"
              shelfIdPrefix="hub_insurance_path"
            />

            <section className="mt-12">
              <Reveal delay={140}>
                <ComparisonTable
                  title="保険の選び方（ざっくり比較）"
                  description="“どれが安いか”より前に、あなたが欲しいのが『相談』『価格』『手続きの楽さ』のどれかを決めます。"
                  columns={[
                    { label: "代理店型", subLabel: "相談しやすい" },
                    { label: "ダイレクト", subLabel: "比較しやすい" },
                    { label: "ディーラー", subLabel: "購入と一体" },
                  ]}
                  rows={[
                    {
                      label: "価格の出やすさ",
                      values: ["△", "◎", "△"],
                    },
                    {
                      label: "相談・調整",
                      values: ["◎", "△", "◯"],
                    },
                    {
                      label: "比較のしやすさ",
                      values: ["△", "◎", "△"],
                    },
                    {
                      label: "向いている人",
                      values: [
                        "補償設計を一緒に詰めたい",
                        "同条件で相場を取りたい",
                        "手続きの一体感を優先",
                      ],
                    },
                  ]}
                  footnote="※ 大事なのは『同じ補償条件で比較する』ことです。条件がズレると、価格比較は破綻します。"
                />
              </Reveal>
            </section>

            <section id="entry" className="mt-12 scroll-mt-24">
              <Reveal delay={160}>
                <h2 className="serif-heading text-xl text-[#222222]">見積もりの入口</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
                  条件を揃えたら、まずは“同条件”で相場を取ります。比較の精度が一気に上がります。
                </p>
              </Reveal>
              <div className="mt-4">
                <HubCtaCompareShelf
                  experimentId="hub_insurance_entry"
                  contentId="hub-insurance"
                  primaryA={{
                    partner: "insweb",
                    href: compareHref,
                    heading: "補償条件を揃えたら、まとめて相場を取る",
                    body: [
                      "同じ条件で比べると、保険料の“差が出る理由”が見えます。",
                      "まずは相場を取り、そこから必要な補償だけを残していくのが安全です。",
                    ],
                    ctaLabel: "一括見積もりで保険料の相場を確認する",
                    ctaPosition: "hub_insurance_primary_A",
                    monetizeKey: "insurance_compare_core",
                  }}
                  primaryB={{
                    partner: "insweb",
                    href: consultHref,
                    heading: "事故後の手続きが不安なら、まず相談先を確保する",
                    body: [
                      "いま困っているときは、比較より先に“手続きの筋道”を作ります。",
                      "状況整理と次の一手を固めてから、見直しに戻る方が安全です。",
                    ],
                    ctaLabel: "事故後の相談・対応を見る",
                    ctaPosition: "hub_insurance_primary_B",
                    monetizeKey: "insurance_after_accident",
                  }}
                  secondary={[
                    {
                      label: "できるだけ保険料を落としたい",
                      description: "同条件で相場を取ってから、必要な補償だけを残す",
                      partner: "insweb",
                      href: savingHref,
                      ctaLabel: "相場を取る",
                      ctaPosition: "hub_insurance_secondary_saving",
                      monetizeKey: "insurance_saving",
                    },
                    {
                      label: "事故後の流れを先に整理したい",
                      description: "状況に応じた手続きの流れを把握してから動く",
                      partner: "insweb",
                      href: consultHref,
                      ctaLabel: "相談を見る",
                      ctaPosition: "hub_insurance_secondary_consult",
                      monetizeKey: "insurance_after_accident",
                    },
                  ]}
                />
              </div>
            </section>

            <section className="mt-12">
              <Reveal delay={180}>
                <FaqList
                  title="自動車保険のFAQ"
                  description="見積もりに進む前に、迷いがちな論点を整理します。"
                  items={[
                    {
                      q: "車両保険は付けるべき？",
                      a: "年式・車の価値・修理費の高さで判断します。『修理費が高い/部品が高い』車ほど車両保険が効くことがありますが、免責や補償範囲もセットで確認します。",
                    },
                    {
                      q: "一括見積もりをすると勧誘が増えますか？",
                      a: "比較サービスや会社によります。必要なら連絡方法（メール中心/電話可否）や、見積もりの目的を先に決めておくと負担が減ります。",
                    },
                    {
                      q: "等級は引き継げますか？",
                      a: "多くの場合は引き継げますが、家族間の扱い・車の入替・中断証明の有無などで条件が変わります。現在の契約内容をメモしてから比較に進むのが安全です。",
                    },
                    {
                      q: "補償はどこを優先すべき？",
                      a: "まず『対人対物（基本）』→ 次に『自分のケガ・同乗者』→ 最後に『車両』の順に優先を決めるとブレにくいです。",
                    },
                  ]}
                />
              </Reveal>
            </section>

            <HubUpdateLog hubId="insurance" />

            <Reveal delay={220}>
              <section className="mt-12">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.22em] text-[#222222]/55">
                      MORE GUIDES
                    </p>
                    <h2 className="serif-heading mt-2 text-lg text-[#222222] sm:text-xl">
                      さらに読む（必要なときだけ）
                    </h2>
                  </div>
                  <Link
                    href="/guide"
                    className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/65 hover:text-[#222222]"
                  >
                    GUIDE一覧へ →
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {picks.map((guide, index) => (
                    <Reveal key={guide.id} delay={260 + index * 40}>
                      <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                        <GlassCard className="group h-full border border-[#222222]/12 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                          <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-[#222222] group-hover:text-tiffany-700">
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
                  title="同条件で相場を取って、補償は“必要な分だけ”残す"
                  bullets={[
                    "迷ったら、まず“読む順番”で条件を揃える",
                    "補償条件を固定してから比較（ズレると比較不能）",
                    "対人対物→人身→車両の順で優先を決める",
                    "連絡負担が不安なら、連絡方法も先に決める",
                    "迷ったらまず相場を取ってから削る",
                  ]}
                  note="比較の精度は“条件を揃えたか”で決まります。"
                  cta={{ href: "#entry", label: "見積もりの入口へ" }}
                />
              </Reveal>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
