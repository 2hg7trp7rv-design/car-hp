// app/guide/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カーライフ実用ガイド | CAR BOUTIQUE",
  description:
    "買い方・売り方・維持費・保険など、カーライフにまつわるお金とリスクの話を整理した実用ガイドの入り口ページです。",
};

export default function GuidePage() {
  return (
    <main className="min-h-screen px-4 pt-24 pb-24 md:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 md:gap-12">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.35em] text-slate-500">
            GUIDE
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            カーライフ実用ガイド
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
            買う前も、乗り始めてからも、「知らなかった」で損をしないために。
            お金と時間の両方を守る視点で、カーライフを整理していくエリアです。
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            まずは全体像とロードマップを示す記事からスタートし、各テーマごとに詳しいガイドを追加していく予定です。
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 md:gap-7">
          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              BUYING
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              買い方ガイド
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              新車・中古車それぞれの選び方、グレードやオプションの考え方、値引き交渉のポイントなど。
              「欲しい」と「必要」のバランスを取りながら、後悔しない一台の選び方を整理します。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              予算シミュレーションやグレード比較など、実際に手を動かしながら考えられる内容にしていきます。
            </p>
          </article>

          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              SELL & REPLACE
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              売り方・乗り換え
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              下取りか買取か、タイミングの決め方、査定で損をしないためのチェックポイント。
              クルマを手放すときに見落としがちな条件や、ディーラーと買取店の使い分けも扱います。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              実際の見積書を例にしながら、「どこでお金が動いているのか」を整理していく予定です。
            </p>
          </article>

          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              COST & LIFE PLAN
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              維持費とお金の話
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              税金・保険・車検・タイヤなど、年間トータルでどれくらい掛かるのかを整理。
              数年先までのライフプランと合わせて考えられるよう、ざっくりとした試算も示していきます。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              「今の一台を維持する」のか「乗り換える」のかを判断する材料として使える内容を目指します。
            </p>
          </article>

          <article className="rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
              INSURANCE & RISK
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              保険とリスク管理
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              任意保険の選び方や補償内容の考え方、万が一の事故時に備えて決めておきたいこと。
              難しい用語を整理しながら、「自分にとってちょうどいい保険」を選べるようにしていきます。
            </p>
            <p className="mt-3 text-xs text-slate-500">
              実際のトラブル事例と紐づけながら、見直しチェックリストなども用意する予定です。
            </p>
          </article>
        </section>

        <div className="mt-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#0ABAB5]/40 bg白/70 px-6 py-2 text-xs font-medium text-[#0ABAB5] shadow-[0_0_0_1px_rgba(255,255,255,0.7)] hover:bg-white"
          >
            トップページへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
