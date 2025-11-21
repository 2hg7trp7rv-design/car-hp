// app/heritage/page.tsx
import Link from "next/link";

export default function HeritagePage() {
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
              HERITAGE
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              クルマの歴史
            </h1>
            <p className="mt-2 text-xs text-neutral-600">
              名車が生まれた背景や、ブランドごとのデザインの流れをゆっくりたどるためのコーナーです。
              カタログをめくるような感覚で読める読み物を少しずつ増やしていきます。
            </p>
          </header>

          <main className="mt-8 space-y-4">
            <article className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm shadow-neutral-100">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                年表スタイルの記事サンプル
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-neutral-600">
                ここには、例えば「BMW 5シリーズの系譜」のような年表・世代ごとの変遷をまとめた記事を載せるイメージです。
              </p>
            </article>

            <article className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-5 text-xs text-neutral-500">
              写真ギャラリーやイラストを入れながら、落ち着いたトーンで読み進められる長めの記事を置くスペースです。
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
