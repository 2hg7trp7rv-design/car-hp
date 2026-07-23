// app/decide/page.tsx
import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MonetizeCtaCard } from "@/components/monetize/MonetizeCtaCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPartnersByCategory } from "@/lib/monetize";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "売却・車検・保険の判断ハブ",
  description:
    "車の売却・査定、車検、自動車保険の3つの判断を、確認する順番と比較の軸で整理するハブページです",
  alternates: { canonical: `${getSiteUrl()}/decide` },
};

const FONT_STACK =
  '"Zen Maru Gothic", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';

const DECIDE_CARDS = [
  {
    key: "sell",
    label: "SELL",
    accent: "#ff6b8a",
    title: "売却・査定",
    body: "売却で後悔しやすいのは、1社だけの査定で決めてしまうことです。買取店とディーラー下取りでは評価の軸が違い、同じ車でも提示額に差が出ます。まず複数社の相場を並べ、ローン残債の有無、車検の残り期間、修復歴の扱いを確認してから交渉に入るのが基本です。タイミングは車検満了前やモデルチェンジの発表前後で変わるため、急ぎすぎず、しかし相場が下がる時期を見極める視点が必要です。",
    points: ["複数社の相場比較", "ローン残債の確認", "売却タイミング"],
  },
  {
    key: "inspection",
    label: "INSPECTION",
    accent: "#26a69a",
    title: "車検",
    body: "車検費用は「法定費用」と「整備費用」の合計で決まります。法定費用はどこで受けても同じですが、整備費用は工場やディーラー、チェーン店で差が出ます。安さだけで選ぶと、必要な整備が後回しになったり、逆に不要な整備を勧められたりすることがあります。見積もりの内訳を比較し、交換が本当に必要な部品かを説明してもらえるかどうかが、依頼先を選ぶ軸になります。",
    points: ["法定費用と整備費用の分離", "見積もり内訳の比較", "整備の必要性の説明"],
  },
  {
    key: "insurance",
    label: "INSURANCE",
    accent: "#ff8c42",
    title: "自動車保険",
    body: "自動車保険は、補償内容を揃えて比較しないと保険料の差を正しく評価できません。対人・対物は無制限が基本で、車両保険を付けるか、免責金額をどう設定するかで保険料が大きく変わります。等級や運転者の範囲、年齢条件の見直しだけで安くなることもあります。更新のたびに補償と保険料を点検し、今の使い方に合った条件かを確認する習慣が大切です。",
    points: ["補償内容を揃えた比較", "車両保険と免責の設定", "等級・条件の見直し"],
  },
] as const;

const COMPARE_ROWS = [
  {
    axis: "まず確認すること",
    sell: "今の相場と残債",
    inspection: "法定費用と整備内訳",
    insurance: "今の補償と等級",
  },
  {
    axis: "差が出やすい部分",
    sell: "査定額・買取方式",
    inspection: "整備費用・割引",
    insurance: "保険料・特約",
  },
  {
    axis: "失敗しやすい点",
    sell: "1社だけで即決",
    inspection: "価格だけで選ぶ",
    insurance: "補償を削りすぎる",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "売却と車検、どちらを先に考えるべきですか？",
    answer:
      "車検満了が近い場合、売却は車検前に検討するのが一般的です。車検を通すと費用は掛かりますが、車検残ありの車として査定に出せる場合もあるため、相場を確認してから判断してください。",
  },
  {
    question: "保険は更新のたびに見直すべきですか？",
    answer:
      "はい。等級の進行や運転者条件の変化で保険料が変わるため、更新時期に補償内容と保険料を点検するのがおすすめです。なお、このページは特定の保険商品を推奨するものではありません。",
  },
  {
    question: "ここで紹介するサービスはPRですか？",
    answer:
      "広告・PRを含む場合は、ページ上部とCTAに必ず「PR」と明示します。比較の軸や確認順序の解説は、PRの有無に関わらず一次資料と編集方針に基づいて作成しています。",
  },
] as const;

const CATEGORY_CONTENT_ID = "decide_hub";

export default function DecideHubPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/decide`;

  const breadcrumbData = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "判断ハブ", item: pageUrl },
    ],
  };

  const faqData = {
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main
      className="min-h-screen bg-[#fff8f0] text-[#2d2d2d]"
      style={{ fontFamily: FONT_STACK }}
    >
      <JsonLd id="jsonld-decide-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-decide-faq" data={faqData} />

      <div className="mx-auto w-full max-w-[800px] px-[clamp(18px,4.8vw,40px)] pb-[clamp(72px,10vw,120px)] pt-[clamp(48px,8vw,96px)]">
        <Breadcrumb
          items={[{ label: "ホーム", href: "/" }, { label: "判断ハブ" }]}
          className="mb-8"
        />

        <header className="overflow-hidden rounded-[23px] bg-[linear-gradient(135deg,#ff6b8a_0%,#ff8e53_100%)] p-[clamp(26px,5vw,44px)] text-white shadow-[0_12px_30px_rgba(255,107,138,0.2)]">
          <p className="font-['Quicksand',sans-serif] text-[.7rem] font-bold tracking-[0.13em]">
            DECIDE
          </p>
          <h1 className="mt-2 text-[clamp(1.6rem,5vw,2.2rem)] font-bold leading-[1.4]">
            売却・車検・保険の判断ハブ
          </h1>
          <p className="mt-3 max-w-[560px] text-[.86rem] leading-[1.85] text-white/[0.84]">
            お金が絡む3つの判断を、「確認する順番」と「比較の軸」で整理しました。急いで決める前に、ここで全体像を押さえてください。
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {DECIDE_CARDS.map((card) => (
            <section
              key={card.key}
              className="rounded-[22px] border border-[#e8ddd0] bg-white p-[clamp(20px,4vw,30px)] shadow-[0_7px_26px_rgba(72,50,34,0.07)]"
            >
              <p
                className="font-['Quicksand',sans-serif] text-[.67rem] font-bold tracking-[0.13em]"
                style={{ color: card.accent }}
              >
                {card.label}
              </p>
              <h2 className="mt-2 text-[1.2rem] font-bold leading-[1.5]">
                {card.title}
              </h2>
              <p className="mt-3 text-[.86rem] leading-[1.9] text-[#6b6b6b]">
                {card.body}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {card.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-full border border-[#e8ddd0] bg-[#fff8f0] px-3 py-1.5 text-[.72rem] font-bold text-[#6b6b6b]"
                  >
                    {point}
                  </li>
                ))}
              </ul>

              {getPartnersByCategory(
                card.key as "sell" | "inspection" | "insurance",
              ).map((partner) => (
                <MonetizeCtaCard
                  key={partner.id}
                  partner={partner}
                  position={`decide_hub_${card.key}`}
                  contentId={CATEGORY_CONTENT_ID}
                  pageType="other"
                  heading={`${card.title}の比較窓口`}
                  body={partner.description}
                  note={
                    card.key === "insurance"
                      ? "特定の保険商品を推奨するものではありません"
                      : undefined
                  }
                />
              ))}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[22px] border border-[#e8ddd0] bg-white p-[clamp(20px,4vw,30px)] shadow-[0_7px_26px_rgba(72,50,34,0.07)]">
          <p className="font-['Quicksand',sans-serif] text-[.67rem] font-bold tracking-[0.13em] text-[#ff8c42]">
            COMPARE
          </p>
          <h2 className="mt-2 text-[1.2rem] font-bold leading-[1.5]">
            3つの判断を並べて見る
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[.8rem] leading-[1.7]">
              <thead>
                <tr className="text-left text-[#6b6b6b]">
                  <th className="border-b border-[#e8ddd0] px-2 py-2.5 font-bold" />
                  <th className="border-b border-[#e8ddd0] px-2 py-2.5 font-bold">売却・査定</th>
                  <th className="border-b border-[#e8ddd0] px-2 py-2.5 font-bold">車検</th>
                  <th className="border-b border-[#e8ddd0] px-2 py-2.5 font-bold">保険</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.axis}>
                    <th className="border-b border-dashed border-[#e8ddd0] px-2 py-2.5 text-left font-bold text-[#2d2d2d]">
                      {row.axis}
                    </th>
                    <td className="border-b border-dashed border-[#e8ddd0] px-2 py-2.5 text-[#6b6b6b]">
                      {row.sell}
                    </td>
                    <td className="border-b border-dashed border-[#e8ddd0] px-2 py-2.5 text-[#6b6b6b]">
                      {row.inspection}
                    </td>
                    <td className="border-b border-dashed border-[#e8ddd0] px-2 py-2.5 text-[#6b6b6b]">
                      {row.insurance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <p className="font-['Quicksand',sans-serif] text-[.67rem] font-bold tracking-[0.13em] text-[#ff6b8a]">
            FAQ
          </p>
          <h2 className="mt-2 text-[1.2rem] font-bold leading-[1.5]">
            よくある質問
          </h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-[18px] border border-[#e8ddd0] bg-white px-5 py-4 shadow-[0_4px_17px_rgba(72,50,34,0.05)]"
              >
                <summary className="flex cursor-pointer list-none items-start gap-3 text-[.86rem] font-bold leading-[1.7] [&::-webkit-details-marker]:hidden">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ff6b8a] font-['Quicksand',sans-serif] text-[.7rem] font-bold text-white">
                    Q
                  </span>
                  <span className="flex-1">{item.question}</span>
                  <span className="text-[#6b6b6b] transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 pl-9 text-[.83rem] leading-[1.9] text-[#6b6b6b]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 rounded-[18px] border border-[#e8ddd0] bg-white px-5 py-4 text-[.72rem] leading-[1.8] text-[#6b6b6b]">
          このページの保険に関する案内は、一般的な比較の視点を示すものであり、特定の保険商品を推奨するものではありません。売却・車検・保険の最終判断は、必ず各サービスの公式情報と契約条件をご確認のうえで行ってください。
        </p>
      </div>
    </main>
  );
}
