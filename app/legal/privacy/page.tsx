// app/legal/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "CAR BOUTIQUEのプライバシーポリシーです。取得する情報の種類と利用目的、第三者提供、アクセス解析ツールなどについて記載しています。",

  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
            プライバシーポリシー
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            CAR BOUTIQUE(以下「当サイト」)は、利用者の個人情報を適切に取り扱うため、以下の方針を定めます。
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            1. 適用範囲
          </h2>
          <p>
            本プライバシーポリシーは、当サイト(
            <span className="break-all">{getSiteUrl()}</span>
            )および関連ページに適用されます。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            2. 取得する情報と利用目的
          </h2>
          <p>当サイトが取得する情報とその目的は、主に次のとおりです。</p>
          <ul className="ml-5 list-disc space-y-1 text-slate-200">
            <li>
              アクセス解析のために取得する情報
              (閲覧ページ・閲覧時間・ブラウザ情報など)
            </li>
            <li>
              お問い合わせフォーム経由で利用者が入力した情報
              (お名前・メールアドレス・問い合わせ内容など)
            </li>
          </ul>
          <p>これらの情報は、次の目的のために利用します。</p>
          <ul className="ml-5 list-disc space-y-1 text-slate-200">
            <li>サイトの利用状況の把握とコンテンツ改善</li>
            <li>お問い合わせへの回答および連絡</li>
            <li>不正アクセスやスパムの防止</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            3. アクセス解析ツールについて
          </h2>
          <p>
            当サイトでは、アクセス解析のためにGoogle
            Analyticsなどの外部サービスを利用する場合があります。
            これらのツールはクッキーを使用して匿名でトラフィックデータを収集します。
          </p>
          <p>
            収集されたデータは各サービスのプライバシーポリシーに基づいて管理され、個人を特定するものではありません。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            4. 第三者への提供
          </h2>
          <p>
            当サイトは、次の場合を除き、取得した個人情報を第三者に提供しません。
          </p>
          <ul className="ml-5 list-disc space-y-1 text-slate-200">
            <li>利用者本人の同意がある場合</li>
            <li>法令に基づく開示要請があった場合</li>
            <li>
              人の生命・身体・財産の保護のために必要であり、本人の同意を得ることが困難な場合
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            5. 個人情報の管理
          </h2>
          <p>
            当サイトは、取得した個人情報について、漏えい・滅失・改ざんなどを防止するために合理的な安全対策を講じます。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            6. 本ポリシーの変更
          </h2>
          <p>
            本プライバシーポリシーの内容は、必要に応じて事前の予告なく変更されることがあります。
            重要な変更がある場合は、当サイト上で告知します。
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            7. お問い合わせ窓口
          </h2>
          <p>
            本ポリシーに関するお問い合わせは、
            <Link
              href="/contact"
              className="text-teal-300 underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            からご連絡ください。
          </p>
        </section>

        <p className="border-t border-slate-800 pt-6 text-xs text-slate-500">
          制定日: 2025年12月1日 / CAR BOUTIQUE 運営
        </p>
      </div>
    </main>
  );
}
