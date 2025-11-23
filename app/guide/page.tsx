// app/guide/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Guide | CAR BOUTIQUE",
  description:
    "買い方・売り方・維持費・保険など、カーライフのお金と暮らしに近いテーマを扱う実用ガイド。",
};

type GuideCategory = {
  id: string;
  label: string;
  description: string;
};

const guides: GuideCategory[] = [
  {
    id: "buy",
    label: "買い方ガイド",
    description:
      "新車・中古車それぞれの選び方、グレードやオプションの考え方、値引き交渉のポイントなど。",
  },
  {
    id: "sell",
    label: "売り方・乗り換え",
    description:
      "下取りか買取か、タイミングの決め方、査定で損をしないためのチェックポイント。",
  },
  {
    id: "cost",
    label: "維持費とお金の話",
    description:
      "税金・保険・車検・タイヤなど、年間トータルでどれくらい掛かるのかを整理しておきます。",
  },
  {
    id: "insurance",
    label: "保険とリスク管理",
    description:
      "任意保険の選び方や補償内容の考え方、万が一の事故時に備えて決めておきたいこと。",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white pb-20">
      <section className="mx-auto max-w-5xl px-6 pt-16">
        {/* ヘッダー */}
        <header className="mb-12 space-y-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
            GUIDE
          </p>
          <h1 className="serif-font text-3xl font-bold text-slate-900 md:text-4xl">
            カーライフ実用ガイド
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            買う前も、乗り始めてからも、「知らなかった」で損をしないために。
            お金と時間の両方を守るための視点で、カーライフを整理していきます。
          </p>
        </header>

        {/* ガイドカテゴリ */}
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="group rounded-2xl border border-slate-200 bg-white/90 px-6 py-7 shadow-sm backdrop-blur transition hover:border-tiffany-400 hover:shadow-soft"
            >
              <h2 className="serif-font text-base font-semibold text-slate-900">
                {guide.label}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 md:text-sm">
                {guide.description}
              </p>
              <p className="mt-4 text-[11px] text-slate-400">
                まずは概要と全体像から整理し、順次詳しい記事を追加していきます。
              </p>
            </article>
          ))}
        </div>

        {/* トップへの戻りボタン */}
        <div className="mt-10 text-right text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-[11px] tracking-wide text-slate-600 transition hover:border-tiffany-400 hover:text-tiffany-600"
          >
            トップページへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
