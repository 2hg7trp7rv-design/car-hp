// app/legal/sources-factcheck/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

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
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
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
          { label: "HOME", href: "/" },
          { label: "LEGAL" },
          { label: "出典・ファクトチェック" },
        ]}
        className="mb-8"
      />

      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
          LEGAL
        </p>
        <h1 className="serif-heading text-3xl leading-tight text-[#222222]">
          出典・ファクトチェック
        </h1>
        <p className="max-w-3xl text-[12px] leading-relaxed text-[#222222]/65 sm:text-sm">
          CAR BOUTIQUE JOURNALでは、内容の正確性を重視します。本ページは、参照する情報源と検証の基本方針をまとめたものです。
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">1. 優先する情報源</h2>
          <p>
            可能な限り、メーカー公式発表（ニュースリリース/プレスルーム）、公的機関、一次情報に近い資料を優先します。
            次に、信頼できる報道機関や専門媒体を参照します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">2. 要約と表現</h2>
          <p>
            公式発表などの一次情報を扱う場合、原文の趣旨が変わらない範囲で要点を整理します。
            推測や断定になりやすい部分は避け、必要に応じて「未発表」「確認できない」などの表現で区別します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">3. 数値・仕様の扱い</h2>
          <p>
            価格、スペック、発売時期などは変更されることがあります。記事内の数値は執筆時点の情報に基づきます。
            更新が確認できた場合、記事を更新します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">4. 誤りの報告と修正</h2>
          <p>
            誤りのご指摘は歓迎します。確認の上、必要に応じて修正し、重要な訂正は注記します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">5. 外部リンクについて</h2>
          <p>
            参照先サイトのURLや内容は、予告なく変更される場合があります。リンク切れ等を確認した場合は、差し替えや削除を行います。
          </p>
        </section>

        <div className="rounded-2xl border border-[#222222]/12 bg-white p-5 shadow-soft">
          <div className="text-[12px] font-semibold tracking-[0.18em] text-[#222222]/80">
            RELATED
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
            <Link
              href="/legal/editorial-policy"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              編集方針
            </Link>
            <Link
              href="/legal/ads-affiliate-policy"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              広告・アフィリエイト
            </Link>
            <Link
              href="/legal/about"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              運営者情報
            </Link>
            <Link
              href="/contact"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
