// app/legal/ads-affiliate-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告・アフィリエイト",
  description:
    "CAR BOUTIQUE JOURNALの広告・アフィリエイトに関する方針です。収益化の方法、表記、第三者からの提供の有無などを説明します。",
  alternates: {
    canonical: "/legal/ads-affiliate-policy",
  },
};

export default function AdsAffiliatePolicyPage() {
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
        name: "広告・アフィリエイト",
        item: `${getSiteUrl()}/legal/ads-affiliate-policy`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-ads-affiliate-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "HOME", href: "/" },
          { label: "LEGAL" },
          { label: "広告・アフィリエイト" },
        ]}
        className="mb-8"
      />

      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
          LEGAL
        </p>
        <h1 className="serif-heading text-3xl leading-tight text-[#222222]">
          広告・アフィリエイト
        </h1>
        <p className="max-w-3xl text-[12px] leading-relaxed text-[#222222]/65 sm:text-sm">
          CAR BOUTIQUE JOURNALは、サイト運営のために広告配信やアフィリエイトプログラムを利用することがあります。
          その際も、読者にとって有益な情報提供を優先します。
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">1. 収益化の方法</h2>
          <p>
            広告配信（例：ディスプレイ広告）や、リンク経由の成果報酬（アフィリエイト）によって収益を得ることがあります。
            リンクを経由して商品・サービスが購入・申込された場合、サイトに報酬が発生することがあります。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">2. 表記について</h2>
          <p>
            アフィリエイトリンクを含むページでは、必要に応じてその旨を明示します。広告であることが分かりにくい表示は行いません。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">3. 記事内容への影響</h2>
          <p>
            収益目的で不正確な情報を掲載したり、事実と異なる誇張表現を行うことはありません。
            評価や見解は、可能な範囲で根拠に基づき、読者の判断材料になるよう記載します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">4. 第三者からの提供・取材</h2>
          <p>無償提供や招待、取材協力などがある場合は、記事内で分かる形で明記する方針です。</p>
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
              href="/legal/sources-factcheck"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              出典・ファクトチェック
            </Link>
            <Link
              href="/legal/disclaimer"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              免責事項
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
