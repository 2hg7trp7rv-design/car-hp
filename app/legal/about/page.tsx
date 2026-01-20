// app/legal/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "CAR BOUTIQUEの運営方針とサイトの目的、運営者情報についてのページです。",

  alternates: { canonical: "/legal/about" },
};

export default function AboutOperatorPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            About
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
            運営者情報
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            CAR BOUTIQUEの運営方針と、このサイトで提供したい価値についてまとめています。
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            サイト名とコンセプト
          </h2>
          <p>・サイト名: CAR BOUTIQUE</p>
          <p>
            ・コンセプト:
            オーナー目線のコラム、車種データベース、判断材料を整理するガイドを組み合わせた
            「クルマ好きのための静かなブティック的な場所」を目指しています。
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            運営者について
          </h2>
          <p>
            ・運営者: 個人(詳細な氏名や住所は、必要に応じてお問い合わせいただいた際に開示します)
          </p>
          <p>
            ・主な関心分野:
            欧州車、プレミアムセダン、スポーツカー、日常とクルマの関係、維持費やトラブルのリアル
          </p>
          <p>
            当サイトのコンテンツは、実体験や各種資料、一次情報に近い出典等をもとに独自の視点でまとめています。
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">
            サイトで提供したい価値
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>クルマ選びの悩みを整理するための材料</li>
            <li>オーナー目線の本音やトラブルの実例</li>
            <li>維持費やお金まわりを考えるためのガイド</li>
            <li>情報の「何がポイントか」を短時間で把握できる整理</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-slate-50">お問い合わせ</h2>
          <p>
            サイト内容に関するご意見やご感想、車種リクエストなどがありましたら、
            <Link
              href="/contact"
              className="text-teal-300 underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <p className="border-t border-slate-800 pt-6 text-xs text-slate-500">
          制定日: 2025年12月1日 / CAR BOUTIQUE 運営
        </p>
      </div>
    </main>
  );
}
