// app/legal/disclaimer/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "免責事項",
  description:
    "CAR BOUTIQUEの免責事項です。掲載情報の正確性・安全性・損害賠償責任などについて記載しています。",
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
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
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
          { label: "HOME", href: "/" },
          { label: "LEGAL" },
          { label: "免責事項" },
        ]}
        className="mb-8"
      />

      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
          LEGAL
        </p>
        <h1 className="serif-heading text-3xl leading-tight text-slate-900">
          免責事項
        </h1>
        <p className="max-w-3xl text-[12px] leading-relaxed text-slate-600 sm:text-sm">
          CAR BOUTIQUE(以下「当サイト」)に掲載する情報の取り扱いと、利用にあたっての注意点を記載しています。
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">
            1. 情報の正確性について
          </h2>
          <p>
            当サイトでは、できる限り正確な情報を掲載するよう努めていますが、その内容の正確性・完全性・最新性を保証するものではありません。
          </p>
          <p>
            特に、自動車のスペック・価格・維持費・トラブル事例などは、年式・グレード・市場状況や個体差により大きく異なる場合があります。
          </p>
          <p>
            掲載内容に誤りがあった場合や情報が古くなっていた場合でも、必ずしもリアルタイムでの修正・更新をお約束するものではありません。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">
            2. 損害等の責任について
          </h2>
          <p>
            当サイトに掲載されている情報を利用したことにより生じた一切の損害について、当サイトおよび運営者は責任を負いません。
          </p>
          <p>
            自動車の購入・売却・整備・改造・保険契約などの重要な判断は、必ずディーラー・整備工場・保険会社・専門家等と相談のうえ、利用者ご自身の責任において行ってください。
          </p>
          <p>
            当サイトの情報は、特定の商品・サービス・工場・販売店等を保証・推奨するものではありません。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">
            3. 外部サイトへのリンクについて
          </h2>
          <p>
            当サイトからのリンクやバナーなどによって外部サイトへ移動した場合、移動先サイトで提供される情報・サービス等について当サイトは一切の責任を負いません。
          </p>
          <p>
            外部サイトの利用にあたっては、各サイトの利用規約・プライバシーポリシー等を必ずご確認ください。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">
            4. 広告・アフィリエイトプログラムについて
          </h2>
          <p>
            当サイトでは、アフィリエイトプログラムや広告サービスを利用して商品・サービスを紹介する場合があります。
          </p>
          <p>
            紹介している商品・サービスに関するお問い合わせは、リンク先の販売店・提供元に直接ご連絡ください。当サイトではお答えできない場合があります。
          </p>
          <p>
            広告の内容・表示順・配信条件等は広告配信事業者の仕組みによって自動最適化される場合があり、当サイトが個別に内容を保証するものではありません。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">
            5. 将来の変更について
          </h2>
          <p>
            本免責事項の内容は、法令の改正やサイト運営方針の変更等に応じて、事前の予告なく変更されることがあります。
          </p>
          <p>重要な変更がある場合は、当サイト上で告知するよう努めます。</p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">6. お問い合わせ</h2>
          <p>
            本免責事項に関するお問い合わせは、
            <Link
              href="/contact"
              className="text-tiffany-700 underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <p className="border-t border-slate-200 pt-6 text-[11px] text-slate-500">
          制定日: 2025年12月1日 / CAR BOUTIQUE 運営
        </p>
      </div>
    </>
  );
}
