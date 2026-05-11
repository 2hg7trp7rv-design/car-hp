// app/legal/editorial-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "編集方針",
  description:
    "CAR BOUTIQUE JOURNALの編集方針です。記事の目的、制作プロセス、更新・修正、誤りへの対応などを説明します。",
  alternates: { canonical: "/legal/editorial-policy" },
};

export default function EditorialPolicyPage() {
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
        name: "編集方針",
        item: `${getSiteUrl()}/legal/editorial-policy`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-editorial-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "編集方針" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="編集方針"
        title="読みやすさと正確さを、同じ基準で保つ。"
        lead="CAR BOUTIQUE JOURNAL は、クルマの背景と判断材料を『読みやすく、正確に』届けることを目的としています。本ページはその運営基準を示すもので、必要に応じて更新します。"
        meta={[
          { label: "対象", value: "視点 / 車種 / 実用 / 系譜" },
          { label: "原則", value: "根拠が確認できる内容を優先して掲載" },
          { label: "関連", value: <Link href="/legal/sources-factcheck">出典・ファクトチェック</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="取り扱う内容">
          <p>
            視点、車種、実用、系譜の各カテゴリで、
            事実情報の整理と背景の解説を中心に扱います。
          </p>
          <p>
            断定的な表現は、根拠が確認できる場合に限ります。感想や推測が混じる場合は、
            できるだけ読者が区別できるように書き分けます。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="記事制作の基本">
          <p>
            記事は、公式発表、公的機関、信頼できる報道機関などの情報を参照し、
            読みやすい形に見ます。参照先は可能な範囲で明記します。
          </p>
          <p>
            内容の要点が変わらない範囲で、公開後に見出し構成や表現を調整することがあります。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="更新・修正・訂正">
          <p>
            事実の追加、仕様変更、制度改定などにより、記事を更新する場合があります。
          </p>
          <p>
            明確な誤りが判明した場合は、速やかに修正し、重要な訂正には必要に応じて注記を追加します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="第三者の権利への配慮">
          <p>
            画像、文章、商標など、第三者の権利を尊重します。引用は、出典の明記と、
            引用の範囲が必要最小限となるよう配慮します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="05" title="お問い合わせと訂正依頼">
          <p>
            記事内容に関するご指摘、誤りのご連絡、掲載依頼などは、
            <Link href="/contact">お問い合わせページ</Link>からご連絡ください。
          </p>
        </LegalDocSection>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/sources-factcheck",
              label: "出典・ファクトチェック",
              description: "参照する情報源と確認の基本方針。",
            },
            {
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて。",
            },
            {
              href: "/legal/about",
              label: "運営者情報",
              description: "媒体の目的と運営姿勢の概要。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "誤記修正や掲載内容への連絡窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
