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
    "CAR BOUTIQUE JOURNALの出典・ファクトチェック方針です。参照する情報源、要約の考え方、誤りへの対応を説明します。",
  alternates: { canonical: "/legal/sources-factcheck" },
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
        title="何を参照し、どこまで確認して書くか。"
        lead="CAR BOUTIQUE JOURNALでは、内容の正確性を重視します。本ページは、参照する情報源と検証の基本方針を置いたもの。"
        meta={[
          { label: "優先", value: "メーカー公式発表 / 公的機関 / 一次情報に近い資料" },
          { label: "補足", value: "信頼できる報道機関や専門媒体で裏取り" },
          { label: "連絡", value: <Link href="/contact">誤りの報告はこちら</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="優先する情報源">
          <p>
            可能な限り、メーカー公式発表（ニュースリリース / プレスルーム）、
            公的機関、一次情報に近い資料を優先します。
          </p>
          <p>
            そのうえで、信頼できる報道機関や専門媒体を参照し、
            表現や解釈の妥当性を確認します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="要約と表現">
          <p>
            公式発表などの一次情報を扱う場合、原文の趣旨が変わらない範囲で要点を見ます。
          </p>
          <p>
            推測や断定になりやすい部分は避け、必要に応じて「未発表」「確認できない」などの表現で区別します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="数値・仕様の扱い">
          <p>
            価格、スペック、発売時期などは変更されることがあります。
            記事内の数値は執筆時点の情報に基づきます。
          </p>
          <p>
            更新が確認できた場合は、記事本文や注記を見直します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="誤りの報告と修正">
          <p>
            誤りのご指摘は歓迎します。確認のうえ、必要に応じて修正し、
            重要な訂正は注記します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="05" title="外部リンクについて">
          <p>
            参照先サイトの URL や内容は、予告なく変更される場合があります。
            リンク切れ等を確認した場合は、差し替えや削除を行います。
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
              description: "誤りの報告やリンク切れの連絡窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
