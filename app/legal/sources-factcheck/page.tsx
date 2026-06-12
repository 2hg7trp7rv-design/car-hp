// app/legal/sources-factcheck/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "出典・ファクトチェック",
  description:
    "CAR BOUTIQUE JOURNALの出典確認方針です。どの情報を優先し、どこまで確認して記事にするかを説明します。",
  alternates: { canonical: `${getSiteUrl()}/legal/sources-factcheck` },
};

export default function SourcesFactcheckPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "法務・運営情報",
        item: `${getSiteUrl()}/legal`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "出典・ファクトチェック",
        item: `${getSiteUrl()}/legal/sources-factcheck`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-factcheck-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "出典・ファクトチェック" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="出典確認"
        title="まず一次情報を見て、足りない部分を補う。"
        lead="CAR BOUTIQUE JOURNALでは、山田太郎が出典の確認と公開後の見直しを行います。公式情報で確認できることを軸にしながら、それだけでは読者が判断しにくい部分を専門媒体や実例で補います。"
        meta={[
          { label: "優先", value: "メーカー公式 / 公的機関 / 取扱説明書 / 技術資料" },
          { label: "補足", value: "専門媒体 / 報道機関 / 実例" },
          { label: "連絡", value: <Link href="/contact">誤りの報告はこちら</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="優先する情報源">
          <p>
            メーカー公式発表、取扱説明書、公的機関の公開情報、技術資料など、一次情報に近いものを優先します。
            そのうえで、信頼できる報道機関や専門媒体を確認し、表現や解釈に無理がないかを見直します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="実例の扱い">
          <p>
            オーナーの投稿や実例は、読者がどこで迷うかを知る手がかりになります。
            ただし、それだけで仕様、費用、故障原因を断定することはしません。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="数値と条件の扱い">
          <p>
            価格、スペック、発売時期、保証、売買条件などは変わることがあります。
            記事内の数値や条件は、原則として執筆または更新時点の情報として扱います。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="誤りへの対応">
          <p>
            誤りや古い情報が見つかった場合は、確認のうえで本文、出典表示、更新履歴を見直します。
            重要な訂正は、必要に応じて記事内に注記します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="05" title="読者へのお願い">
          <p>
            整備、保証、売買、契約に関わる内容は、車両や条件によって結果が変わります。
            記事は判断材料として使い、最終確認が必要な内容は販売店、整備工場、各窓口で確認してください。
          </p>
        </LegalDocSection>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/editorial-policy",
              label: "編集方針",
              description: "どの姿勢で記事を作り、更新するか。",
            },
            {
              href: "/legal/about",
              label: "運営者情報",
              description: "運営者と編集責任の表示。",
            },
            {
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "誤りの報告やリンク切れの連絡窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
