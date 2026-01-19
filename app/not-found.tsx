// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-100">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg backdrop-blur">
        <p className="text-xs uppercase tracking-[0.25em] text-teal-300">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
          お探しのページが見つかりませんでした
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          URLが間違っているか、ページが移動または削除された可能性があります。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-teal-400 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-300"
          >
            トップに戻る
          </Link>
          <Link
            href="/cars"
            className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-sm font-medium text-slate-100 hover:border-teal-300 hover:text-teal-200"
          >
            車種一覧を見る
          </Link>
        </div>
      </div>
    </main>
  );
}
