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
    "CAR BOUTIQUE JOURNALの運営方針とサイトの目的、運営者情報についてのページです。",
  alternates: { canonical: "/legal/about" },
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
        title="何のために運営し、どの温度で届けるか。"
        lead="CAR BOUTIQUE JOURNALは、車のスペックや話題だけでなく、選ぶ判断と背景まで読める媒体を目指しています。ここでは、その運営姿勢と基本情報を先に開いておきます。"
        meta={[
          { label: "サイト名", value: "CAR BOUTIQUE JOURNAL" },
          { label: "形式", value: "個人運営の編集メディア" },
          { label: "窓口", value: <Link href="/contact">お問い合わせフォーム</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="サイト名とコンセプト">
          <p>
            サイト名は CAR BOUTIQUE JOURNAL です。オーナー目線の視点、車種一覧、
            判断材料を整理するガイドを組み合わせながら、クルマ好きの媒体として運営しています。
          </p>
          <p>
            派手な演出や断定で押し切るのではなく、いま何を知ると判断しやすくなるかを、
            読みやすい形として整えることを重視します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="運営者について">
          <p>
            運営者は個人です。詳細な氏名や住所は、必要に応じて
            お問い合わせをいただいた際に開示します。
          </p>
          <p>
            主な関心分野は、欧州車、プレミアムセダン、スポーツカー、
            日常とクルマの関係、維持費やトラブルのリアルです。
          </p>
          <p>
            コンテンツは、実体験や各種資料、一次情報に近い出典などをもとに、
            独自の視点で整理・編集しています。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="このサイトで提供したい価値">
          <ul>
            <li>クルマ選びの悩みを整理する材料を、短時間で把握できる形にすること。</li>
            <li>オーナー目線の本音やトラブルの実例を、必要以上に煽らずに伝えること。</li>
            <li>維持費やお金まわりを考えるためのガイドを、実用の判断軸としてまとめること。</li>
            <li>背景を読めば選び方が変わるテーマを、視点や歴史記事でつなぐこと。</li>
          </ul>
        </LegalDocSection>

        <LegalDocSection index="04" title="連絡先について">
          <p>
            サイト内容に関するご意見やご感想、車種リクエストなどがありましたら、
            <Link href="/contact">お問い合わせフォーム</Link>よりご連絡ください。
          </p>
          <p>
            数値の誤り、リンク切れ、引用表記の確認なども同じ窓口で受け付けています。
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
          制定日: 2025年12月1日 / CAR BOUTIQUE JOURNAL 運営
        </section>
      </div>
    </>
  );
}
