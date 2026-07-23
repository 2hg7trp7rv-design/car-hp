import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ComparisonTable } from "@/components/guide/ComparisonTable";
import { InlineFaq } from "@/components/taxonomy/InlineFaq";
import { HubCtaCard } from "@/components/monetize/HubCtaCard";
import { JsonLd } from "@/components/seo/JsonLd";
import partners from "@/data/monetize/partners.json";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "売却・査定・車検・保険の判断ハブ",
  description:
    "車の売却・査定、車検、自動車保険の3つの判断場面について、確認すべき基準と比較の進め方を簡潔に整理したハブページです",
  alternates: { canonical: `${getSiteUrl()}/decide` },
};

const HUB_CARDS = [
  {
    key: "sell",
    eyebrow: "SELL / APPRAISAL",
    title: "売却・査定",
    body: "車を売る判断は「いくらで売れるか」だけでなく、売る時期と売り方の組み合わせで変わります。まず一括査定で現在の相場帯を取り、ディーラー下取りと買取店の差を数字で確認するのが第一歩です。輸入車や低走行車は専門性のある買取店で評価が伸びることがあり、ローン残債がある場合は精算まで対応できる窓口を選ぶ必要があります。相場を取ったあと急いで売る必要はありません。複数社の査定額と条件を並べ、納得できる出口を選ぶのが失敗を避ける現実的な進め方です。",
  },
  {
    key: "shaken",
    eyebrow: "INSPECTION",
    title: "車検",
    body: "車検の費用は「法定費用」と「整備・部品代」に分かれ、後者は店舗と車の状態で大きく変わります。ディーラー、チェーン店、整備工場で見積もりの前提が違うため、総額だけでなく交換対象と保証の有無を揃えて比較する必要があります。まず近くの対応店舗と概算費用を出し、整備内容の説明を受けてから依頼先を決めるのが安心です。年式が古い車や輸入車は、対応実績のある店舗を先に絞ると手戻りがありません。",
  },
  {
    key: "insurance",
    eyebrow: "INSURANCE",
    title: "自動車保険",
    body: "自動車保険は補償の型を先に決めてから保険料を比較するのが順序です。対人・対物は無制限が一般的で、車両保険や人身傷害の範囲、免責金額の設定で保険料が変わります。同じ条件で複数社の見積もりを取ると、補償を削らずに保険料だけを見直せる場合があります。等級や事故歴によっては条件が変わるため、現在の契約内容を確認してから比較を始めてください。",
    note: "このページは一般的な比較の進め方を示すものであり、特定の保険商品を推奨するものではありません。契約の判断は、必ず各社の公式資料と重要事項説明を確認のうえで行ってください。",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "査定を取ると、必ず売らないといけませんか",
    a: "いいえ。一括査定や個別の見積もりは相場を知るための手段で、売却義務はありません。相場だけ把握して売却時期を検討する使い方が一般的です。",
  },
  {
    q: "車検の見積もりは、何を揃えて比較すればいいですか",
    a: "法定費用（自賠責・重量税・印紙代）はどこも同じなので、整備費用の内訳、交換する部品の前提、追加整備が出た場合の連絡方法を揃えて比較してください。総額だけで決めると必要な整備が削られることがあります。",
  },
  {
    q: "保険の見直しは、いつ始めるのがいいですか",
    a: "満期の1〜2か月前が目安です。現在の契約の補償内容と等級を確認し、同条件で他社の見積もりを取る時間を確保すると、判断を急がずに済みます。",
  },
] as const;

export default function DecidePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/decide`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "判断ハブ", item: pageUrl },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f6f1e9]">
      <JsonLd id="jsonld-decide-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="jsonld-decide-faq" data={faqJsonLd} />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(0,112,141,0.12),transparent_32%),linear-gradient(180deg,#f9f5ee_0%,#f4eee5_58%,#eee7dc_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-[linear-gradient(180deg,rgba(3,4,4,0.08),rgba(3,4,4,0))]" />

      <div className="mx-auto w-full max-w-[1180px] px-[clamp(18px,4.8vw,56px)] pb-[clamp(76px,11vw,128px)] pt-[clamp(58px,9vw,112px)]">
        <Breadcrumb
          items={[{ label: "ホーム", href: "/" }, { label: "判断ハブ" }]}
          className="mb-8"
        />

        <header className="overflow-hidden rounded-[clamp(24px,4vw,40px)] border border-black/10 bg-[#080b0d] p-[clamp(22px,5vw,48px)] text-white">
          <div className="pointer-events-none relative">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00708d]/25 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/[0.34]">
                DECIDE
              </p>
              <h1 className="mt-4 max-w-[16ch] text-[clamp(36px,6.6vw,68px)] font-semibold leading-[0.98] tracking-[-0.08em] text-white/[0.94]">
                売却・車検・保険の判断ハブ
              </h1>
              <p className="mt-5 max-w-[620px] text-[13px] leading-[1.95] tracking-[0.03em] text-white/[0.54]">
                お金が動く3つの場面について、何を確認し、どう比較するかを整理しました
                まず基準を押さえてから、各サービスの比較に進んでください
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {HUB_CARDS.map((card) => (
            <article
              key={card.key}
              className="flex flex-col rounded-[28px] border border-black/10 bg-white/[0.76] p-[clamp(18px,3.4vw,28px)] shadow-[0_18px_70px_-58px_rgba(3,4,4,0.45)]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
                {card.eyebrow}
              </p>
              <h2 className="mt-3 text-[clamp(22px,3.4vw,30px)] font-semibold leading-[1.1] tracking-[-0.06em] text-[#080b0d]">
                {card.title}
              </h2>
              <p className="mt-4 text-[13px] leading-[1.9] tracking-[0.02em] text-[#657078]">
                {card.body}
              </p>
              {"note" in card && card.note ? (
                <p className="mt-4 rounded-[16px] border border-black/10 bg-[#f9f5ee] px-4 py-3 text-[11px] leading-[1.8] text-[#657078]">
                  {card.note}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <section className="mt-10">
          <ComparisonTable
            title="3つの判断場面の比較の進め方"
            description="場面ごとに「先に確認すること」と「比較で揃えるもの」は異なります"
            columns={[
              { label: "売却・査定" },
              { label: "車検" },
              { label: "保険" },
            ]}
            rows={[
              {
                label: "まず確認すること",
                values: [
                  "現在の相場帯と売る時期",
                  "対応店舗と概算費用",
                  "現在の補償内容と等級",
                ],
              },
              {
                label: "比較で揃えるもの",
                values: [
                  "査定額・対応条件・精算方法",
                  "整備内訳・交換前提・保証",
                  "補償の型・免責・特約条件",
                ],
              },
              {
                label: "判断を急がなくていい場面",
                values: [
                  "相場だけ先に取る段階",
                  "満期まで余裕がある段階",
                  "見積もりを集める段階",
                ],
              },
            ]}
            footnote="各サービスの最新の条件は、必ず公式ページで確認してください"
          />
        </section>

        <section className="mt-10">
          <h2 className="text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
            よくある質問
          </h2>
          <InlineFaq items={[...FAQ_ITEMS]} className="mt-5" />
        </section>

        <section className="mt-10 space-y-2" aria-label="各サービスの比較窓口">
          <HubCtaCard
            partner="sell_ikkatsu"
            href={partners.sell_ikkatsu.url}
            heading="まず相場を取る（売却・査定）"
            body={[
              "売るか迷っている段階でも、一括査定で今の価値帯を把握しておくと判断しやすくなります。",
            ]}
            ctaLabel="買取相場を確認する"
            ctaPosition="decide_sell"
            monetizeKey="decide_sell_ikkatsu"
          />
          <HubCtaCard
            partner="shaken_rakuten"
            href={partners.shaken_rakuten.url}
            heading="近くの店舗と概算費用を出す（車検）"
            body={[
              "対応店舗と概算費用が見えれば、整備内容の比較に進めます。",
            ]}
            ctaLabel="車検の概算を確認する"
            ctaPosition="decide_shaken"
            monetizeKey="decide_shaken"
          />
          <HubCtaCard
            partner="insurance_compare"
            href={partners.insurance_compare.url}
            heading="同条件で見積もりを比べる（保険）"
            body={[
              "補償の型を決めてから、複数社の見積もりを横並びで確認します。",
            ]}
            ctaLabel="保険を一括見積もりで比較する"
            ctaPosition="decide_insurance"
            monetizeKey="decide_insurance"
          />
        </section>
      </div>
    </main>
  );
}
