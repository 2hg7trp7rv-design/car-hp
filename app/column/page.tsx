// app/column/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Columns | CAR BOUTIQUE",
  description:
    "オーナー目線のストーリー、メンテナンス、トラブル体験、技術解説などを集めたコラムページです。",
};

type ColumnCategory = {
  id: string;
  label: string;
  description: string;
};

const categories: ColumnCategory[] = [
  {
    id: "story",
    label: "ストーリー",
    description: "オーナー体験記や、クルマと過ごす時間にまつわる物語。",
  },
  {
    id: "maintenance",
    label: "メンテナンス",
    description: "日々のケアや、長く付き合うためのメンテナンスのコツ。",
  },
  {
    id: "trouble",
    label: "トラブル・修理",
    description: "実際に起きた不調や修理体験から学べるリアルな知見。",
  },
  {
    id: "tech",
    label: "技術解説",
    description: "エンジンや電子制御など、気になる技術をやさしく解説。",
  },
];

export default function ColumnPage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white pb-20">
      <section className="mx-auto max-w-5xl px-6 pt-16">
        {/* ヘッダー */}
        <header className="mb-12 space-y-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
            COLUMN
          </p>
          <h1 className="serif-font text-3xl font-bold text-slate-900 md:text-4xl">
            コラムとストーリー
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            クルマと暮らす日々の出来事、オーナーだからこそ書ける本音、
            そして少しディープな技術の話をここに並べていきます。
          </p>
        </header>

        {/* カテゴリカード */}
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="group rounded-2xl border border-slate-200 bg-white/90 px-6 py-7 shadow-sm backdrop-blur transition hover:border-tiffany-400 hover:shadow-soft"
            >
              <h2 className="serif-font text-base font-semibold tracking-tight text-slate-900">
                {cat.label}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 md:text-sm">
                {cat.description}
              </p>
              <p className="mt-4 text-[11px] text-slate-400">
                まずは数本の代表的な記事から、少しずつ充実させていきます。
              </p>
            </article>
          ))}
        </div>

        {/* 補足テキスト */}
        <div className="mt-12 text-xs text-slate-500 md:text-sm">
          <p>
            それぞれのカテゴリごとにタグやシリーズを後から追加できるように、
            まずは「入り口」としてのページ構成だけ整えています。
          </p>
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
