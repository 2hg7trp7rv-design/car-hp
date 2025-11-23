// app/guide/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Guides | CAR BOUTIQUE",
  description: "クルマの買い方、売り方、維持費や保険など、お金と暮らしに近いテーマをまとめたガイドページです。",
};

type GuideCategory = {
  id: string;
  label: string;
  description: string;
};

const guides: GuideCategory[] = [
  {
    id: "buying",
    label: "賢い買い方",
    description: "新車と中古車、残クレやリースなど、自分に合った選び方の整理。",
  },
  {
    id: "selling",
    label: "売却と乗り換え",
    description: "下取りと買取の違い、タイミング、査定で損をしないためのポイント。",
  },
  {
    id: "cost",
    label: "維持費とお金の話",
    description: "税金、保険、タイヤや車検など、数年スパンで見た時のリアルなコスト感。",
  },
  {
    id: "insurance",
    label: "保険と保証",
    description: "任意保険や延長保証、ロードサービスの考え方を整理します。",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto max-w-5xl px-4 py-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            Guide
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            クルマとの付き合い方ガイド
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300">
            買う時、手放す時、そして日々の維持費。
            スペック表には載らない「お金と暮らし」の部分を、
            少し落ち着いた目線で整理していきます。
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 px-5 py-6 backdrop-blur transition hover:border-neutral-500 hover:bg-neutral-900/70"
            >
              <h2 className="text-base font-medium tracking-tight">
                {guide.label}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                {guide.description}
              </p>
              <p className="mt-4 text-[11px] text-neutral-500">
                実際の数字や事例は、順番に記事として加えていきます。
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-xs text-neutral-400">
          <p>
            将来的には、ここから各車種ページやニュース解説、
            比較機能へも自然につながる導線を追加していきます。
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
