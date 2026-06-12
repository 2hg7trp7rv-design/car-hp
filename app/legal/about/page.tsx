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
    "CAR BOUTIQUE JOURNALの運営者、編集責任、確認体制、サイトの目的についてのページです。",
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

  const operatorData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "山田太郎",
    jobTitle: "CAR BOUTIQUE JOURNAL 運営・編集",
    worksFor: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: getSiteUrl(),
    },
  };

  return (
    <>
      <JsonLd id="jsonld-legal-about-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-operator-yamada-taro" data={operatorData} />

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
        title="車を選ぶ前に、何を見ておくべきか。"
        lead="CAR BOUTIQUE JOURNALは、車種、整備、維持費、売買、歴史を扱う自動車メディアです。車を所有し、維持していく中で生まれる疑問を出発点に、公式情報や資料で確認できることと、実際の判断で迷いやすいことを分けて整理します。"
        meta={[
          { label: "サイト名", value: "CAR BOUTIQUE JOURNAL" },
          { label: "運営者", value: "山田太郎" },
          { label: "編集責任", value: "山田太郎 / CAR BOUTIQUE JOURNAL 編集部" },
          { label: "窓口", value: <Link href="/contact">お問い合わせフォーム</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="サイトについて">
          <p>
            CAR BOUTIQUE JOURNALは、車種一覧、ガイド、コラム、系譜記事を組み合わせた自動車メディアです。
            ただスペックを並べるだけではなく、買う前、維持する途中、カスタムを考える場面で必要になる判断材料を整理します。
          </p>
          <p>
            速く結論を出すための記事ではなく、読者が自分の車や予算、使い方に当てはめて考えられる記事を目指しています。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="運営者と編集責任">
          <p>
            運営者は山田太郎です。CAR BOUTIQUE JOURNALの企画、記事構成、本文の編集、公開後の見直しを行っています。
          </p>
          <p>
            記事では、メーカー公式発表、公的機関、取扱説明書、技術資料、信頼できる専門媒体などを確認し、
            断定できることと、条件によって変わることをできるだけ分けて書きます。
          </p>
          <p>
            整備、車検、保証、保険、売買に関わる内容は、車種、年式、地域、契約条件、施工内容によって結果が変わります。
            そのため、記事内では一般的な判断材料を示し、最終確認が必要な内容は各窓口や現車確認を前提に扱います。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="編集で重視していること">
          <ul>
            <li>公式情報で確認できる事実と、運営者の見解を混ぜすぎないこと。</li>
            <li>読者が判断を誤りやすい部分では、メリットだけでなくデメリットも並べること。</li>
            <li>車種、年式、個体差、施工内容で変わる内容は、断定せず条件を添えること。</li>
            <li>古くなった情報、誤記、リンク切れが判明した場合は、本文または更新履歴で修正すること。</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="04" title="このサイトで提供したい価値">
          <ul>
            <li>車選びの悩みを整理する材料を、短時間で把握できる形にすること。</li>
            <li>維持費、故障、車検、保証、売買、カスタムの判断軸を、落ち着いたガイドとしてまとめること。</li>
            <li>車の背景や系譜を知ることで、スペック表だけでは見えない魅力を伝えること。</li>
            <li>読者が自分の条件に置き換えて考えられるよう、前提と限界を明示すること。</li>
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
          制定日: 2025年12月1日 / 最終更新: 2026年6月13日 / 運営者: 山田太郎
        </section>
      </div>
    </>
  );
}
