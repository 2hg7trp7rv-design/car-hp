// app/legal/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "CAR BOUTIQUE JOURNALのプライバシーポリシーです。取得する情報の種類と利用目的、第三者提供、アクセス解析ツールなどについて記載しています。",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPolicyPage() {
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
        name: "プライバシーポリシー",
        item: `${getSiteUrl()}/legal/privacy`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-privacy-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "プライバシーポリシー" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="プライバシー"
        title="取得する情報と、その使い方を先に示す。"
        lead="CAR BOUTIQUE JOURNAL（以下『当サイト』）は、利用者の個人情報を適切に取り扱うため、以下の方針を定めます。"
        meta={[
          { label: "適用", value: "当サイトおよび関連ページ" },
          { label: "主な用途", value: "アクセス解析 / お問い合わせ対応 / 不正防止" },
          { label: "設定変更", value: "Cookie設定はフッターから変更可能" },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="適用範囲">
          <p>
            本プライバシーポリシーは、当サイト（<span className="break-all">{getSiteUrl()}</span>）
            および関連ページに適用されます。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="取得する情報と利用目的">
          <p>当サイトが取得する情報とその目的は、主に次のとおりです。</p>
          <ul>
            <li>アクセス解析のために取得する情報（閲覧ページ・閲覧時間・ブラウザ情報など）</li>
            <li>お問い合わせフォーム経由で利用者が入力した情報（お名前・メールアドレス・問い合わせ内容など）</li>
          </ul>
          <p>これらの情報は、次の目的のために利用します。</p>
          <ul>
            <li>サイトの利用状況の把握とコンテンツ改善</li>
            <li>お問い合わせへの回答および連絡</li>
            <li>不正アクセスやスパムの防止</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="03" title="アクセス解析ツールについて">
          <p>
            当サイトでは、アクセス解析のために Google Analytics などの外部サービスを利用する場合があります。
            これらのツールはクッキーを使用して匿名でトラフィックデータを収集します。
          </p>
          <p>
            収集されたデータは各サービスのプライバシーポリシーに基づいて管理され、
            個人を特定するものではありません。
          </p>
          <p>
            当サイトのアクセス解析の許可・拒否は、フッターの「Cookie設定」からいつでも変更。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="第三者への提供">
          <p>当サイトは、次の場合を除き、取得した個人情報を第三者に提供しません。</p>
          <ul>
            <li>利用者本人の同意がある場合</li>
            <li>法令に基づく開示要請があった場合</li>
            <li>人の生命・身体・財産の保護のために必要であり、本人の同意を得ることが困難な場合</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="05" title="個人情報の管理">
          <p>
            当サイトは、取得した個人情報について、漏えい・滅失・改ざんなどを防止するために
            合理的な安全対策を講じます。
          </p>
        </LegalDocSection>

        <LegalDocSection index="06" title="本ポリシーの変更">
          <p>
            本プライバシーポリシーの内容は、必要に応じて事前の予告なく変更されることがあります。
            重要な変更がある場合は、当サイト上で告知します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="07" title="お問い合わせ窓口">
          <p>
            本ポリシーに関するお問い合わせは、
            <Link href="/contact">お問い合わせフォーム</Link>からご連絡ください。
          </p>
        </LegalDocSection>

        <section className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(238,231,222,0.42)] px-5 py-4 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
          制定日: 2025年12月1日 / CAR BOUTIQUE JOURNAL 運営
        </section>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/disclaimer",
              label: "免責事項",
              description: "掲載情報の範囲と利用時の注意点。",
            },
            {
              href: "/legal/copyright",
              label: "著作権・引用ポリシー",
              description: "文章・画像・引用の扱いについて。",
            },
            {
              href: "/legal/about",
              label: "運営者情報",
              description: "媒体の目的と運営姿勢の概要。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "個人情報の取り扱いに関する連絡窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
