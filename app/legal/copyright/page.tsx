// app/legal/copyright/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "著作権・引用ポリシー",
  description:
    "CAR BOUTIQUEにおける著作権の取り扱いと、ニュース引用・外部コンテンツ利用に関するポリシーです。",

  alternates: { canonical: "/legal/copyright" },
};

export default function CopyrightPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
            著作権・引用ポリシー
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            CAR BOUTIQUEに掲載される文章・画像などの取り扱いと、
            ニュースソース等の外部コンテンツをどのように扱うかについての方針です。
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            1. 当サイトのコンテンツについて
          </h2>
          <p>
            当サイトに掲載されている文章・画像・ロゴ・レイアウト・デザイン等の著作権は、
            特段の記載がない限り当サイト運営者に帰属します。
          </p>
          <p>
            個人的な閲覧や引用の範囲を超えた無断転載・複製・再配布等は禁止します。
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            2. 当サイトコンテンツの引用について
          </h2>
          <p>当サイトの内容を引用する場合は、以下の条件を守ってください。</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>引用部分が全体の主従関係において従となっていること</li>
            <li>引用部分が他の部分と明確に区別されていること</li>
            <li>
              出典として当サイト名(CAR BOUTIQUE)と該当ページのURLを明記すること
            </li>
            <li>著作権法その他関係法令に反しない範囲であること</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            3. ニュースソース・外部コンテンツの扱い
          </h2>
          <p>
            当サイトのニュースコンテンツでは、他社メディアのニュース記事等を参照しつつ、
            要約と当サイト独自のコメント、そして明確な出典リンクという形で紹介する方針です。
          </p>
          <p>
            原文の本文を大量に転載することは行わず、見出しや要約、
            当サイトの編集による解説にとどめるよう努めます。
          </p>
          <p>
            引用する際は、出典メディア名および元記事のURLを明示し、
            引用部分と当サイト独自の記述とが区別できるようにします。
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            4. 画像・動画・生成AIコンテンツの取り扱い
          </h2>
          <p>
            当サイトで使用している画像・動画等は、以下のいずれかの方法で入手したものです。
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>当サイト運営者が撮影・制作したもの</li>
            <li>
              利用規約上、商用利用が認められている素材サイトから取得したもの
            </li>
            <li>
              利用規約上、商用利用が認められている生成AIサービスを用いて生成したもの
            </li>
            <li>権利者から利用許諾を得たもの</li>
          </ul>
          <p>
            これらのコンテンツの無断転載・再配布・二次利用はご遠慮ください。
          </p>
          <p>
            万一、権利者と思われる方からのご指摘があった場合は、
            内容を確認のうえ、速やかに修正または削除等の対応を行います。
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            5. 著作権侵害の可能性がある場合の対応
          </h2>
          <p>
            当サイトのコンテンツが著作権その他の権利を侵害している可能性がある場合は、
            お手数ですが権利者ご本人または正当な代理人の方が、
            必要な情報を添えてご連絡ください。
          </p>
          <p>
            ご連絡は
            <Link
              href="/contact"
              className="text-teal-300 underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            よりお願いいたします。
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            6. ポリシーの変更
          </h2>
          <p>
            本ポリシーの内容は、法令やサービス内容の変更等に応じて、
            事前の予告なく変更されることがあります。
          </p>
          <p>
            重要な変更がある場合は、当サイト上で告知するよう努めます。
          </p>
        </section>

        <p className="border-t border-slate-800 pt-6 text-xs text-slate-500">
          制定日: 2025年12月1日 / CAR BOUTIQUE 運営
        </p>
      </div>
    </main>
  );
}
