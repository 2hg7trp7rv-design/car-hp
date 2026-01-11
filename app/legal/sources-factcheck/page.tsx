// app/legal/sources-factcheck/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "出典・ファクトチェック",
  description:
    "CAR BOUTIQUEの出典・ファクトチェック方針です。参照する情報源、要約の考え方、誤りへの対応を説明します。",
  alternates: {
    canonical: `${getSiteUrl()}/legal/sources-factcheck`,
  },
};

export default function SourcesFactcheckPage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-2xl font-semibold tracking-wide">出典・ファクトチェック</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-sub">
          CAR BOUTIQUEでは、内容の正確性を重視します。本ページは、参照する情報源と検証の基本方針をまとめたものです。
        </p>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">1. 優先する情報源</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            可能な限り、メーカー公式発表（ニュースリリース/プレスルーム）、公的機関、一次情報に近い資料を優先します。
            次に、信頼できる報道機関や専門媒体を参照します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">2. 要約と表現</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            公式発表などの一次情報を扱う場合、原文の趣旨が変わらない範囲で要点を整理します。
            推測や断定になりやすい部分は避け、必要に応じて「未発表」「確認できない」などの表現で区別します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">3. 数値・仕様の扱い</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            価格、スペック、発売時期などは変更されることがあります。記事内の数値は執筆時点の情報に基づきます。
            更新が確認できた場合、記事を更新します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">4. 誤りの報告と修正</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            誤りのご指摘は歓迎します。確認の上、必要に応じて修正し、重要な訂正は注記します。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-main">5. 外部リンクについて</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-sub">
            参照先サイトのURLや内容は、予告なく変更される場合があります。リンク切れ等を確認した場合は、差し替えや削除を行います。
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
