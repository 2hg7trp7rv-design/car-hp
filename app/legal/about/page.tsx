// app/legal/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { LegalSummaryGrid } from "@/components/legal/LegalSummaryGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { CBJ_SITE_DESCRIPTION } from "@/lib/brand/cbj-copy";
import { OPERATOR } from "@/lib/operator";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "CAR BOUTIQUE JOURNALの運営者、編集責任、確認体制、サイトの目的についてのページです",
  alternates: { canonical: `${getSiteUrl()}/legal/about` },
};

const PROFILE_ITEMS = [
  { label: "サイト名", value: OPERATOR.siteName },
  { label: "運営", value: OPERATOR.operatorName },
  { label: "編集責任", value: `${OPERATOR.siteName} 編集部` },
  { label: "確認軸", value: "公式情報・一次資料" },
] as const;

const OPERATOR_DETAIL_ITEMS: Array<{ label: string; value: string }> = [
  { label: "運営者名", value: OPERATOR.operatorName },
  { label: "運営形態", value: OPERATOR.operatorType },
  { label: "代表者", value: OPERATOR.representative },
  { label: "所在地", value: OPERATOR.address },
  { label: "連絡先メールアドレス", value: OPERATOR.contactEmail },
  { label: "運営開始", value: OPERATOR.established },
  { label: "事業内容", value: OPERATOR.businessDescription },
];

const STANCE_ITEMS = [
  {
    label: "Official",
    title: "公式情報",
    body: "メーカー公式発表、公的機関、取扱説明書、技術資料を優先して確認",
  },
  {
    label: "Editorial",
    title: "読者目線の整理",
    body: "専門用語と条件差を分け、読者が判断に使える順番へ編集",
  },
  {
    label: "Condition",
    title: "条件差",
    body: "年式、グレード、個体差、契約条件で変わる内容を分けて扱う",
  },
] as const;

export default function AboutOperatorPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/legal/about`;
  const organizationId = `${siteUrl}/#organization`;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "法務・運営情報", item: `${siteUrl}/legal` },
      { "@type": "ListItem", position: 3, name: "運営者情報", item: pageUrl },
    ],
  };

  const operatorProfileData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": pageUrl,
    url: pageUrl,
    name: "CAR BOUTIQUE JOURNAL 運営者情報",
    dateModified: "2026-07-12",
    mainEntity: {
      "@type": "Organization",
      "@id": organizationId,
      name: "CAR BOUTIQUE JOURNAL",
      url: siteUrl,
      description:
        "車選び、維持、整備修理、カスタム、売却、車やメーカーの歴史に関する記事の企画、編集、出典確認、公開後の見直しを行う自動車メディア",
    },
  };

  return (
    <>
      <JsonLd id="jsonld-legal-about-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-operator-profile" data={operatorProfileData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "運営者情報" },
        ]}
        className="mb-8"
      />

      <header className="overflow-hidden rounded-[28px] border border-black/10 bg-[#f9f5ee]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative overflow-hidden bg-[#080b0d] p-[clamp(22px,5vw,48px)] text-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00708d]/25 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/[0.34]">
                OPERATOR
              </p>
              <h1 className="mt-5 whitespace-pre-line text-[clamp(40px,7vw,76px)] font-semibold leading-[0.95] tracking-[-0.085em] text-white/[0.94]">
                {"CAR BOUTIQUE\nJOURNAL"}
              </h1>
              <p className="mt-5 max-w-[520px] text-[14px] leading-[1.9] tracking-[0.03em] text-white/[0.54]">
                運営・編集 / CAR BOUTIQUE JOURNAL 編集部
              </p>
            </div>
          </div>

          <div className="p-[clamp(20px,4vw,40px)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              PROFILE
            </p>
            <h2 className="mt-4 max-w-[14ch] text-[clamp(28px,5vw,50px)] font-semibold leading-[1.03] tracking-[-0.075em] text-[#080b0d]">
              車を見る基準を、記事の形にする
            </h2>
            <p className="mt-5 text-[13px] leading-[1.95] tracking-[0.02em] text-[#657078]">
              {CBJ_SITE_DESCRIPTION}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        <section className="rounded-[28px] border border-black/10 bg-white/[0.72] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILE_ITEMS.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-black/10 bg-[#f9f5ee] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/[0.34]">
                  {item.label}
                </p>
                <p className="mt-2 text-[14px] leading-[1.75] text-[#101519]">
                  {item.value}
                </p>
              </div>
            ))}
            <Link href="/contact" className="rounded-[20px] border border-black/10 bg-[#080b0d] p-4 text-white transition-colors hover:bg-[#152026]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/[0.34]">
                窓口
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.75] text-white/[0.9]">
                お問い合わせフォーム ↗
              </p>
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-white/[0.72] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
            OPERATOR DETAIL
          </p>
          <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
            運営者情報
          </h2>
          <p className="mt-4 text-[13px] leading-[1.9] text-[#657078]">
            運営者情報は data/site/operator.json を単一ソースとして管理しています。未設定の項目は「要設定」と表示されます。
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {OPERATOR_DETAIL_ITEMS.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-black/10 bg-[#f9f5ee] p-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/[0.34]">
                  {item.label}
                </dt>
                <dd className="mt-2 text-[14px] leading-[1.75] text-[#101519]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-[#f9f5ee] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
            CHARACTERS
          </p>
          <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
            登場キャラクターについて
          </h2>
          <p className="mt-4 text-[13px] leading-[1.95] text-[#657078]">
            記事に登場する「莉奈（りな）」と「JUNA（じゅな）」は、読みやすさのために設計された架空のキャラクターです。対話の内容は編集部が一次資料に基づいて作成したものであり、キャラクターの発言そのものが事実の根拠になるわけではありません。記事の事実確認と正確性への責任は、すべて運営者と各記事に記載された一次資料（出典）に帰属します。
          </p>
        </section>

        <LegalSummaryGrid items={STANCE_ITEMS} />

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-black/10 bg-[#f9f5ee] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              CAN DO
            </p>
            <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
              記事でできること
            </h2>
            <ul className="mt-5 space-y-3 text-[13px] leading-[1.9] text-[#657078]">
              <li>車選び、維持、整備修理、カスタム、売却、歴史の判断材料を整理すること</li>
              <li>公式情報と条件で変わる内容を分けて示すこと</li>
              <li>誤記や古い情報が判明した場合に見直すこと</li>
            </ul>
          </article>

          <article className="rounded-[28px] border border-black/10 bg-[#f9f5ee] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              CANNOT DO
            </p>
            <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
              記事でできないこと
            </h2>
            <ul className="mt-5 space-y-3 text-[13px] leading-[1.9] text-[#657078]">
              <li>個別車両の診断、契約判断、整備作業そのものの代替</li>
              <li>価格、保証、故障原因、査定額の確定</li>
              <li>販売店、整備工場、保険会社、専門家による確認の代替</li>
            </ul>
          </article>
        </section>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/editorial-policy",
              label: "編集方針",
              description: "記事制作と公開後の更新・修正の考え方",
            },
            {
              href: "/legal/sources-factcheck",
              label: "出典・ファクトチェック",
              description: "一次情報をどう優先し、どこまで確認して書くか",
            },
            {
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "修正依頼や掲載内容へのご連絡はこちらから",
            },
          ]}
        />
      </div>
    </>
  );
}
