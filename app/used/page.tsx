// app/used/page.tsx
import Link from "next/link";

export default function UsedPage() {
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
              USED LOUNGE
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              中古車の目利き
            </h1>
            <p className="mt-2 text-xs text-neutral-600">
              気になるモデルの持病や年式ごとの違い、買う前に見ておきたいポイントを静かなトーンで整理していくためのコーナーです。
            </p>
          </header>

          <main className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm shadow-neutral-100">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                モデル別チェックリスト
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-neutral-600">
                ここには、B48 のようなエンジン別・モデル別の「買う前に見るポイント」をカード形式で載せていく想定です。
              </p>
            </article>

            <article className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-5 text-xs text-neutral-500">
              具体的な整備費用の相場や、購入後に備えておきたいメンテナンス項目など、
              手元の経験や調べた内容を少しずつ反映させていける余白として確保しています。
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
