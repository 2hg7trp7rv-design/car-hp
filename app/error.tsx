// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-100">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg backdrop-blur">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-300">
          Error
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
          予期しないエラーが発生しました
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          一時的な不具合の可能性があります。ページを再読み込みしても解消しない場合は、
          お手数ですが時間をおいて再度アクセスしてください。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-teal-400 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-300"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-sm font-medium text-slate-100 hover:border-teal-300 hover:text-teal-200"
          >
            トップに戻る
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-4 text-xs text-slate-500">
            エラーID: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  );
}
