// app/column/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "コラムとストーリー | CAR BOUTIQUE",
  description:
    "オーナー体験記やトラブル・修理、技術解説など、クルマと暮らしにまつわる物語を集めたコラムエリアです。",
};

export default function ColumnPage() {
  return (
    <main className="min-h-screen px-4 pt-24 pb-24 md:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 md:gap-12">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.35em] text-slate-500">
            COLUMN
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            コラムとストーリー
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
            クルマと暮らす日々の出来事、オーナーだからこそ書ける本音、
            そして少しディープな技術の話をここに並べていきます。
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            まずは代表的なテーマごとに入り口を用意し、順次コラム記事を追加していく予定です。
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 md:gap-7">
          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              STORY
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              ストーリー
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              オーナー体験記や、クルマと過ごす時間にまつわる物語。
              長く乗ってきたからこそ見えてくる視点や、記憶に残るドライブのエピソードを中心に届けていきます。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              B48エンジンの長期レビューなど、濃い目のオーナー視点もここにまとめていきます。
            </p>
          </article>

          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              MAINTENANCE
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              メンテナンス
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              日々のケアや、長く付き合うためのメンテナンスのコツ。
              ワイパーやオイル交換のようなライトな話題から、足回りリフレッシュなど大掛かりな整備まで扱っていきます。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              まずは全体像を整理したうえで、代表的な作業を一つずつ掘り下げていく予定です。
            </p>
          </article>

          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              TROUBLE & REPAIR
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              トラブル・修理
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              実際に起きた不調や修理体験から学べるリアルな知見。
              見積もりの読み方や、ディーラーと専門ショップの使い分けなども含めて整理していきます。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              ユーザーの実体験ベースで、同じ症状に悩む人が検索から辿り着ける記事群に育てていきます。
            </p>
          </article>

          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              TECH
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              技術解説
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              エンジンや電子制御など、気になる技術をやさしく解説。
              専門用語をできるだけ噛み砕きながら、本質的な仕組みを理解できる内容を目指します。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              VANOSやB48エンジンの解説など、実際のトラブル事例と結びつけながら整理していきます。
            </p>
          </article>
        </section>

        <div className="mt-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#0ABAB5]/40 bg-white/70 px-6 py-2 text-xs font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.7)] hover:bg-white"
          >
            トップページへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
