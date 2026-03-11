// app/legal/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

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
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
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
          { label: "HOME", href: "/" },
          { label: "LEGAL" },
          { label: "運営者情報" },
        ]}
        className="mb-8"
      />

      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
          LEGAL
        </p>
        <h1 className="serif-heading text-3xl leading-tight text-[#222222]">
          運営者情報
        </h1>
        <p className="max-w-2xl text-[12px] leading-relaxed text-[#222222]/65 sm:text-sm">
          CAR BOUTIQUE JOURNALの運営方針と、このサイトで提供したい価値についてまとめています。
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#222222]">
            サイト名とコンセプト
          </h2>
          <div className="space-y-2 text-[13px] leading-relaxed text-[#222222]/80">
            <p>・サイト名: CAR BOUTIQUE JOURNAL</p>
            <p>
              ・コンセプト:
              オーナー目線のコラム、車種データベース、判断材料を整理するガイドを組み合わせた
              「クルマ好きのための静かなブティック的な場所」を目指しています。
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#222222]">運営者について</h2>
          <div className="space-y-2 text-[13px] leading-relaxed text-[#222222]/80">
            <p>
              ・運営者:
              個人(詳細な氏名や住所は、必要に応じてお問い合わせいただいた際に開示します)
            </p>
            <p>
              ・主な関心分野:
              欧州車、プレミアムセダン、スポーツカー、日常とクルマの関係、維持費やトラブルのリアル
            </p>
            <p>
              当サイトのコンテンツは、実体験や各種資料、一次情報に近い出典等をもとに独自の視点でまとめています。
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#222222]">
            サイトで提供したい価値
          </h2>
          <ul className="ml-5 list-disc space-y-1 text-[13px] leading-relaxed text-[#222222]/80">
            <li>クルマ選びの悩みを整理するための材料</li>
            <li>オーナー目線の本音やトラブルの実例</li>
            <li>維持費やお金まわりを考えるためのガイド</li>
            <li>情報の「何がポイントか」を短時間で把握できる整理</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#222222]">お問い合わせ</h2>
          <p className="text-[13px] leading-relaxed text-[#222222]/80">
            サイト内容に関するご意見やご感想、車種リクエストなどがありましたら、
            <Link
              href="/contact"
              className="text-tiffany-700 underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <p className="border-t border-[#222222]/12 pt-6 text-[11px] text-[#222222]/55">
          制定日: 2025年12月1日 / CAR BOUTIQUE JOURNAL 運営
        </p>
      </div>
    </>
  );
}
