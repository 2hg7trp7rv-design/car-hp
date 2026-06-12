// app/legal/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "CAR BOUTIQUE JOURNALの運営方針、編集責任、確認体制、サイトの目的についてのページです。",
  alternates: { canonical: `${getSiteUrl()}/legal/about` },
};

export default function AboutOperatorPage() {
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
        name: "運営者情報",
        item: `${getSiteUrl()}/legal/about`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-about-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "運営者情報" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="運営者"
        title="誰が、何を確認して、どの責任で公開するか。"
        lead="CAR BOUTIQUE JOURNALは、車種、整備、維持費、売買、歴史を扱う自動車メディアです。記事の読みやすさだけでなく、出典、更新日、安全上の前提、判断の限界を見える形で示すことを重視します。"
        meta={[
          { label: "サイト名", value: "CAR BOUTIQUE JOURNAL" },
          { label: "運営", value: "個人運営の編集メディア" },
          { label: "編集責任", value: "CAR BOUTIQUE JOURNAL 編集部" },
          { label: "窓口", value: <Link href="/contact">お問い合わせフォーム</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="サイト名とコンセプト">
          <p>
            サイト名は CAR BOUTIQUE JOURNAL です。車種一覧、ガイド、コラム、系譜記事を組み合わせ、
            車を選ぶ前・買った後・維持していく途中で必要になる判断材料を整理します。
          </p>
          <p>
            派手な断定や煽りではなく、読者が自分の条件に当てはめて考えられる情報を残すことを重視します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="運営者と編集責任">
          <p>
            運営者は個人です。詳細な氏名や住所は、必要に応じてお問い合わせをいただいた際に開示します。
          </p>
          <p>
            記事の編集責任は CAR BOUTIQUE JOURNAL 編集部が負います。記事構成、本文表現、出典表示、
            更新履歴、読者判断への影響を確認したうえで公開します。
          </p>
          <p>
            主な関心分野は、欧州車、プレミアムセダン、スポーツカー、日常と車の関係、維持費、
            トラブル、カスタム、売買時の判断材料です。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="確認体制">
          <ul>
            <li>メーカー公式発表、公的機関、取扱説明書、技術資料、信頼できる専門媒体を優先して確認します。</li>
            <li>価格、制度、仕様、装備、保証、整備に関わる内容は、公開時点の情報として扱います。</li>
            <li>車種、年式、地域、個体差、施工内容で結果が変わる内容は、断定ではなく条件付きで記述します。</li>
            <li>誤記、リンク切れ、仕様変更が判明した場合は、本文または更新履歴で修正します。</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="04" title="このサイトで提供したい価値">
          <ul>
            <li>車選びの悩みを整理する材料を、短時間で把握できる形にすること。</li>
            <li>オーナー目線の本音やトラブルの実例を、必要以上に煽らずに伝えること。</li>
            <li>維持費、車検、保証、売買、カスタムの判断軸を、読みやすいガイドとしてまとめること。</li>
            <li>背景を読めば選び方が変わるテーマを、コラムや歴史記事でつなぐこと。</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="05" title="連絡先について">
          <p>
            サイト内容に関するご意見、車種リクエスト、掲載内容へのご指摘は、
            <Link href="/contact">お問い合わせフォーム</Link>よりご連絡ください。
          </p>
          <p>
            数値の誤り、リンク切れ、引用表記の確認、更新が必要な情報の指摘も同じ窓口で受け付けています。
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
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "修正依頼や掲載内容へのご連絡はこちらから。",
            },
          ]}
        />

        <section className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(238,231,222,0.42)] px-5 py-4 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
          制定日: 2025年12月1日 / 最終更新: 2026年6月13日 / CAR BOUTIQUE JOURNAL 運営
        </section>
      </div>
    </>
  );
}
