// app/legal/copyright/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "著作権・引用ポリシー",
  description:
    "CAR BOUTIQUE JOURNALにおける著作権の取り扱いと、ニュース引用・外部コンテンツ利用に関するポリシーです。",
  alternates: { canonical: "/legal/copyright" },
};

export default function CopyrightPolicyPage() {
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
        name: "著作権・引用ポリシー",
        item: `${getSiteUrl()}/legal/copyright`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-copyright-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "著作権・引用ポリシー" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="著作権"
        title="つくったものと借りたものを、曖昧にしない。"
        lead="CAR BOUTIQUE JOURNALに掲載される文章・画像などの取り扱いと、ニュースソース等の外部コンテンツをどのように扱うかについての方針です。"
        meta={[
          { label: "対象", value: "文章 / 画像 / ロゴ / レイアウト / デザイン" },
          { label: "許容", value: "法令に沿った引用と必要最小限の紹介" },
          { label: "窓口", value: <Link href="/contact">権利に関する連絡フォーム</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="当サイトのコンテンツについて">
          <p>
            当サイトに掲載されている文章、画像、ロゴ、レイアウト、デザイン等の著作権は、
            特段の記載がない限り当サイト運営者に帰属します。
          </p>
          <p>
            個人的な閲覧や引用の範囲を超えた無断転載、複製、再配布等は禁止します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="当サイトコンテンツの引用について">
          <p>当サイトの内容を引用する場合は、以下の条件を守ってください。</p>
          <ul>
            <li>引用部分が全体の主従関係において従となっていること</li>
            <li>引用部分が他の部分と明確に区別されていること</li>
            <li>出典として当サイト名（CAR BOUTIQUE JOURNAL）と該当ページの URL を明記すること</li>
            <li>著作権法その他関係法令に反しない範囲であること</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="03" title="ニュースソース・外部コンテンツの扱い">
          <p>
            当サイトのニュースコンテンツでは、他社メディアのニュース記事等を参照しつつ、
            要約と当サイト独自のコメント、そして明確な出典リンクという形で紹介する方針です。
          </p>
          <p>
            原文の本文を大量に転載することは行わず、見出しや要約、
            当サイトの編集による解説にとどめるよう努めます。
          </p>
          <p>
            引用する際は、出典メディア名および元記事の URL を明示し、
            引用部分と当サイト独自の記述とが区別できるようにします。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="画像・動画・生成AIコンテンツの取り扱い">
          <p>
            当サイトで使用している画像・動画等は、次のいずれかの方法で入手したものです。
          </p>
          <ul>
            <li>当サイト運営者が撮影・制作したもの</li>
            <li>利用規約上、商用利用が認められている素材サイトから取得したもの</li>
            <li>利用規約上、商用利用が認められている生成AIサービスを用いて生成したもの</li>
            <li>権利者から利用許諾を得たもの</li>
          </ul>
          <p>これらのコンテンツの無断転載、再配布、二次利用はご遠慮ください。</p>
          <p>
            万一、権利者と思われる方からのご指摘があった場合は、内容を確認のうえ、
            速やかに修正または削除等の対応を行います。
          </p>
        </LegalDocSection>

        <LegalDocSection index="05" title="著作権侵害の可能性がある場合の対応">
          <p>
            当サイトのコンテンツが著作権その他の権利を侵害している可能性がある場合は、
            お手数ですが権利者ご本人または正当な代理人の方が、必要な情報を添えてご連絡ください。
          </p>
          <p>
            ご連絡は<Link href="/contact">お問い合わせフォーム</Link>よりお願いいたします。
          </p>
        </LegalDocSection>

        <LegalDocSection index="06" title="ポリシーの変更">
          <p>
            本ポリシーの内容は、法令やサービス内容の変更等に応じて、
            事前の予告なく変更されることがあります。
          </p>
          <p>重要な変更がある場合は、当サイト上で告知するよう努めます。</p>
        </LegalDocSection>

        <section className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(238,231,222,0.42)] px-5 py-4 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
          制定日: 2025年12月1日 / CAR BOUTIQUE JOURNAL 運営
        </section>

        <LegalRelatedLinks
          items={[
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
              href: "/legal/privacy",
              label: "プライバシーポリシー",
              description: "取得する情報と利用目的について。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "権利に関する確認や削除依頼の窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
