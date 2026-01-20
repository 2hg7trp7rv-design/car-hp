// app/legal/ads-affiliate-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告・アフィリエイト",
  description:
    "CAR BOUTIQUEの広告・アフィリエイトに関する方針です。収益化の方法、表記、第三者からの提供の有無などを説明します。",
  alternates: {
    canonical: `${getSiteUrl()}/legal/ads-affiliate-policy`,
  },
};

export default function AdsAffiliatePolicyPage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-wide">広告・アフィリエイト</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-sub">
          CAR BOUTIQUEは、サイト運営のために広告配信やアフィリエイトプログラムを利用することがあります。
          その際も、読者にとって有益な情報提供を優先します。
        </p>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">1. 収益化の方法</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            広告配信（例：ディスプレイ広告）や、リンク経由の成果報酬（アフィリエイト）によって収益を得ることがあります。
            リンクを経由して商品・サービスが購入・申込された場合、サイトに報酬が発生することがあります。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">2. 表記について</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            アフィリエイトリンクを含むページでは、必要に応じてその旨を明示します。広告であることが分かりにくい表示は行いません。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">3. 記事内容への影響</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            収益目的で不正確な情報を掲載したり、事実と異なる誇張表現を行うことはありません。
            評価や見解は、可能な範囲で根拠に基づき、読者の判断材料になるよう記載します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">4. 第三者からの提供・取材</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            無償提供や招待、取材協力などがある場合は、記事内で分かる形で明記する方針です。
          </p>
        </section>

        <div className="mt-10 rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-sm font-semibold text-text-main">関連ページ</div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href="/legal/editorial-policy"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              編集方針
            </Link>
            <Link
              href="/legal/sources-factcheck"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              出典・ファクトチェック
            </Link>
            <Link
              href="/legal/disclaimer"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              免責事項
            </Link>
            <Link
              href="/contact"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
