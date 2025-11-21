// app/reviews/page.tsx
import Link from "next/link";

export default function ReviewsPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(129,216,208,0.65) 0%, rgba(129,216,208,0.65) 70%, #ffffff 100%)",
        }}
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <header className="border-b border-neutral-200 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-700">
              DRIVE NOTE
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              試乗記
            </h1>
            <p className="mt-2 text-xs text-neutral-600">
              最新モデルから少し前の名車まで、気になるクルマの乗り味や質感を静かなトーンで綴る試乗記コーナーです。
              まずは骨組みとして、今後の記事を追加できるようにしてあります。
            </p>
          </header>

          <main className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm shadow-neutral-100">
              <p className="text-[10px] uppercase tracking-[0.25em] text-sky-600">
                SAMPLE
              </p>
              <h2 className="mt-2 text-sm font-semibold tracking-tight text-neutral-900">
                試乗記のサンプル記事タイトル
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-neutral-600">
                ここに試乗記本文の導入を入れていきます。量産するときは、このカードをベースにコンポーネント化してもよいです。
              </p>
            </article>

            <article className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-5 text-xs text-neutral-500">
              ここから先は、実際の試乗記が書けるタイミングでコンテンツを追加していくスペースです。
              一覧表示か年別アーカイブにするかは、記事が増えてきた段階で決める想定です。
            </article>
          </main>

          <div className="mt-8 text-[11px] text-neutral-500">
            <Link
              href="/"
              className="underline-offset-4 hover:text-neutral-700 hover:underline"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
