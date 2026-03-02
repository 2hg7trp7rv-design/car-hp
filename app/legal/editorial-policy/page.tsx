// app/legal/editorial-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "編集方針",
  description:
    "CAR BOUTIQUE JOURNALの編集方針です。記事の目的、制作プロセス、更新・修正、誤りへの対応などを説明します。",
  alternates: { canonical: "/legal/editorial-policy" },
};

export default function EditorialPolicyPage() {
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
        name: "編集方針",
        item: `${getSiteUrl()}/legal/editorial-policy`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-editorial-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "HOME", href: "/" },
          { label: "LEGAL" },
          { label: "編集方針" },
        ]}
        className="mb-8"
      />

      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
          LEGAL
        </p>
        <h1 className="serif-heading text-3xl leading-tight text-[#222222]">
          編集方針
        </h1>
        <p className="max-w-3xl text-[12px] leading-relaxed text-[#222222]/65 sm:text-sm">
          CAR BOUTIQUE JOURNALは、クルマの背景と判断材料を「読みやすく、正確に」届けることを目的としています。
          本ページは運営の基準を示すもので、必要に応じて更新します。
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">1. 取り扱う内容</h2>
          <p>
            COLUMNS / CARS / GUIDE / HERITAGE の各カテゴリで、事実情報の整理と背景の解説を中心に扱います。
            断定的な表現は、根拠が確認できる場合に限ります。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">2. 記事制作の基本</h2>
          <p>
            記事は、公式発表・公的機関・信頼できる報道機関などの情報を参照し、読みやすい形に整理します。
            参照先は可能な範囲で明記します（詳細は「出典・ファクトチェック」を参照）。
          </p>
          <p>
            内容の要点が変わらない範囲で、見出し構成や表現を調整することがあります。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">3. 更新・修正・訂正</h2>
          <p>
            事実の追加・仕様変更・制度改定などにより、記事を更新する場合があります。
            明確な誤りが判明した場合は、速やかに修正し、必要に応じて注記を追加します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">4. 第三者の権利への配慮</h2>
          <p>
            画像・文章・商標など、第三者の権利を尊重します。引用は、出典の明記と、引用の範囲が必要最小限となるよう配慮します。
          </p>
        </section>

        <section className="space-y-3 text-[13px] leading-relaxed text-[#222222]/80">
          <h2 className="text-lg font-semibold text-[#222222]">5. お問い合わせ</h2>
          <p>
            記事内容に関するご指摘、誤りのご連絡、掲載依頼などは、お問い合わせページからご連絡ください。
          </p>
        </section>

        <div className="rounded-2xl border border-[#222222]/12 bg-white p-5 shadow-soft">
          <div className="text-[12px] font-semibold tracking-[0.18em] text-[#222222]/80">
            RELATED
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
            <Link
              href="/legal/sources-factcheck"
              className="text-[#222222]/65 underline-offset-4 hover:text-[#222222] hover:underline"
            >
              出典・ファクトチェック
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
