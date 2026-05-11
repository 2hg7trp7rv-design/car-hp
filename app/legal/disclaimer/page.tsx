// app/legal/disclaimer/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "免責事項",
  description:
    "CAR BOUTIQUE JOURNALの免責事項です。掲載情報の正確性・安全性・損害賠償責任などについて記載しています。",
  alternates: { canonical: "/legal/disclaimer" },
};

export default function DisclaimerPage() {
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
        name: "免責事項",
        item: `${getSiteUrl()}/legal/disclaimer`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-disclaimer-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "免責事項" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="免責事項"
        title="判断の最終責任は、読者自身のもとにある。"
        lead="CAR BOUTIQUE JOURNAL（以下『当サイト』）に掲載する情報の取り扱いと、利用にあたっての注意点を記載しています。"
        meta={[
          { label: "対象", value: "スペック / 価格 / 維持費 / トラブル事例 など" },
          { label: "注意", value: "年式・グレード・市場状況・個体差で大きく変わる場合があります" },
          { label: "相談先", value: "販売店 / 整備工場 / 保険会社 / 専門家" },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="情報の正確性について">
          <p>
            当サイトでは、できる限り正確な情報を掲載するよう努めていますが、
            その内容の正確性・完全性・最新性を保証するものではありません。
          </p>
          <p>
            特に、自動車のスペック、価格、維持費、トラブル事例などは、
            年式・グレード・市場状況や個体差により大きく異なる場合があります。
          </p>
          <p>
            掲載内容に誤りがあった場合や情報が古くなっていた場合でも、
            必ずしもリアルタイムでの修正・更新をお約束するものではありません。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="損害等の責任について">
          <p>
            当サイトに掲載されている情報を利用したことにより生じた一切の損害について、
            当サイトおよび運営者は責任を負いません。
          </p>
          <p>
            自動車の購入、売却、整備、改造、保険契約などの重要な判断は、
            必ずディーラー、整備工場、保険会社、専門家等と相談のうえ、
            利用者ご自身の責任において行ってください。
          </p>
          <p>
            当サイトの情報は、特定の商品、サービス、工場、販売店等を保証・推奨するものではありません。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="外部サイトへのリンクについて">
          <p>
            当サイトからのリンクやバナーなどによって外部サイトへ移動した場合、
            移動先サイトで提供される情報・サービス等について当サイトは一切の責任を負いません。
          </p>
          <p>
            外部サイトの利用にあたっては、各サイトの利用規約やプライバシーポリシー等を必ずご確認ください。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="広告・アフィリエイトプログラムについて">
          <p>
            当サイトでは、アフィリエイトプログラムや広告サービスを利用して商品・サービスを紹介する場合があります。
          </p>
          <p>
            紹介している商品・サービスに関するお問い合わせは、リンク先の販売店・提供元に直接ご連絡ください。
            当サイトではお答えできない場合があります。
          </p>
          <p>
            広告の内容、表示順、配信条件等は広告配信事業者の仕組みによって自動最適化される場合があり、
            当サイトが個別に内容を保証するものではありません。
          </p>
        </LegalDocSection>

        <LegalDocSection index="05" title="将来の変更について">
          <p>
            本免責事項の内容は、法令の改正やサイト運営方針の変更等に応じて、
            事前の予告なく変更されることがあります。
          </p>
          <p>重要な変更がある場合は、当サイト上で告知するよう努めます。</p>
        </LegalDocSection>

        <LegalDocSection index="06" title="お問い合わせ">
          <p>
            本免責事項に関するお問い合わせは、
            <Link href="/contact">お問い合わせフォーム</Link>よりご連絡ください。
          </p>
        </LegalDocSection>

        <section className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(238,231,222,0.42)] px-5 py-4 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
          制定日: 2025年12月1日 / CAR BOUTIQUE JOURNAL 運営
        </section>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて。",
            },
            {
              href: "/legal/privacy",
              label: "プライバシーポリシー",
              description: "取得する情報と利用目的について。",
            },
            {
              href: "/legal/copyright",
              label: "著作権・引用ポリシー",
              description: "文章・画像・引用の扱いについて。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "掲載内容への連絡窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
