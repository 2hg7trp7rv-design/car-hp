// app/legal/editorial-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "編集方針",
  description:
    "CAR BOUTIQUEの編集方針です。記事の目的、制作プロセス、更新・修正、誤りへの対応などを説明します。",
  alternates: {
    canonical: `${getSiteUrl()}/legal/editorial-policy`,
  },
};

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-wide">編集方針</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-sub">
          CAR BOUTIQUEは、クルマの背景と判断材料を「読みやすく、正確に」届けることを目的としています。
          本ページは運営の基準を示すもので、必要に応じて更新します。
        </p>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">1. 取り扱う内容</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            COLUMNS / CARS / GUIDE / HERITAGE の各カテゴリで、事実情報の整理と背景の解説を中心に扱います。
            断定的な表現は、根拠が確認できる場合に限ります。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">2. 記事制作の基本</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            記事は、公式発表・公的機関・信頼できる報道機関などの情報を参照し、読みやすい形に整理します。
            参照先は可能な範囲で明記します（詳細は「出典・ファクトチェック」を参照）。
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            内容の要点が変わらない範囲で、見出し構成や表現を調整することがあります。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">3. 更新・修正・訂正</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            事実の追加・仕様変更・制度改定などにより、記事を更新する場合があります。
            明確な誤りが判明した場合は、速やかに修正し、必要に応じて注記を追加します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">4. 第三者の権利への配慮</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            画像・文章・商標など、第三者の権利を尊重します。引用は、出典の明記と、引用の範囲が必要最小限となるよう配慮します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">5. お問い合わせ</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            記事内容に関するご指摘、誤りのご連絡、掲載依頼などは、お問い合わせページからご連絡ください。
          </p>
        </section>

        <div className="mt-10 rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-sm font-semibold text-text-main">関連ページ</div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href="/legal/sources-factcheck"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              出典・ファクトチェック
            </Link>
            <Link
              href="/legal/ads-affiliate-policy"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              広告・アフィリエイト
            </Link>
            <Link
              href="/legal/about"
              className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
            >
              運営者情報
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
