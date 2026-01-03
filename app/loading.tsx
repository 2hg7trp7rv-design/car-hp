// app/loading.tsx

/**
 * ルート遷移時のローディングUI
 * - Next.js App Router は、遷移先のRSC/データ取得中に loading.tsx を表示できる
 * - 体感速度（“押したのに何も起きない”）を改善するための最小実装
 */

export default function Loading() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <div className="space-y-6">
          <div className="h-6 w-40 rounded-full bg-white/70 animate-pulse" />
          <div className="h-10 w-80 rounded-2xl bg-white/70 animate-pulse" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-3xl border border-slate-200/70 bg-white/80 shadow-soft-card animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
