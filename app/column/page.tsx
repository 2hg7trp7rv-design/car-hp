// app/column/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Columns | CAR BOUTIQUE",
  description: "オーナー目線のストーリー、メンテナンス、トラブル体験、技術解説などを集めたコラムページです。",
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
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto max-w-5xl px-4 py-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            Column
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            コラムとストーリー
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300">
            クルマと暮らす日々の出来事、オーナーだからこそ書ける本音、
            そして少しディープな技術の話をここに並べていきます。
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 px-5 py-6 backdrop-blur transition hover:border-neutral-500 hover:bg-neutral-900/70"
            >
              <h2 className="text-base font-medium tracking-tight">
                {cat.label}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                {cat.description}
              </p>
              <p className="mt-4 text-[11px] text-neutral-500">
                まずは数本の代表的な記事から、少しずつ充実させていきます。
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-xs text-neutral-400">
          <p>
            それぞれのカテゴリごとにタグやシリーズを後から追加できるように、
            まずは「入り口」としてのページ構成だけ先に整えています。
          </p>
        </div>

        <div className="mt-10 text-right text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-[11px] tracking-wide text-neutral-200 transition hover:border-neutral-400 hover:bg-neutral-900"
          >
            トップページへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
