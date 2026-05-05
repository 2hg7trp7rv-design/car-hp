// app/legal/ads-affiliate-policy/page.tsx
import type { Metadata } from "next";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告・アフィリエイト",
  description:
    "CAR BOUTIQUE JOURNALの広告・アフィリエイトに関する方針です。収益化の方法、表記、第三者からの提供の有無などを説明します。",
  alternates: {
    canonical: "/legal/ads-affiliate-policy",
  },
};

export default function AdsAffiliatePolicyPage() {
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
        name: "広告・アフィリエイト",
        item: `${getSiteUrl()}/legal/ads-affiliate-policy`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-ads-affiliate-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "広告・アフィリエイト" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="広告表示"
        title="収益化は行う。けれど、判断をねじ曲げるためには使わない。"
        lead="CAR BOUTIQUE JOURNALは、サイト運営のために広告配信やアフィリエイトプログラムを利用することがあります。その際も、読者にとって有益な情報提供を優先します。"
        meta={[
          { label: "手段", value: "ディスプレイ広告 / アフィリエイト" },
          { label: "原則", value: "広告であることが分かりにくい表示はしない" },
          { label: "関連", value: "必要に応じて記事内で明示" },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="収益化の方法">
          <p>
            広告配信（例: ディスプレイ広告）や、リンク経由の成果報酬（アフィリエイト）によって
            収益を得ることがあります。
          </p>
          <p>
            リンクを経由して商品・サービスが購入・申込された場合、サイトに報酬が発生することがあります。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="表記について">
          <p>
            アフィリエイトリンクを含むページでは、必要に応じてその旨を明示します。
            広告であることが分かりにくい表示は行いません。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="記事内容への影響">
          <p>
            収益目的で不正確な情報を掲載したり、事実と異なる誇張表現を行うことはありません。
          </p>
          <p>
            評価や見解は、可能な範囲で根拠に基づき、読者の判断材料になるよう記載します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="第三者からの提供・取材">
          <p>
            無償提供や招待、取材協力などがある場合は、記事内で分かる形で明記する方針です。
          </p>
        </LegalDocSection>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/editorial-policy",
              label: "編集方針",
              description: "記事制作と公開後の更新・修正の考え方。",
            },
            {
              href: "/legal/sources-factcheck",
              label: "出典・ファクトチェック",
              description: "一次情報をどう優先し、どこまで確認して書くか。",
            },
            {
              href: "/legal/disclaimer",
              label: "免責事項",
              description: "掲載情報の範囲と利用時の注意点。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "広告表記や掲載内容に関するご連絡はこちらから。",
            },
          ]}
        />
      </div>
    </>
  );
}
