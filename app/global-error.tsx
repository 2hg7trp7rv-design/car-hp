// app/global-error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// This boundary catches errors thrown in the root layout/template.
// It must render <html> and <body>.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("GlobalError (root layout) :", error);
  }, [error]);

  const digest = (error?.digest ?? "").trim();

  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#070707] text-white">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20">
          <p className="text-[11px] tracking-[0.24em] text-white/55">FATAL / ROOT</p>

          <h1 className="mt-4 text-[22px] font-semibold tracking-[0.06em]">
            ルートでエラーが発生しました
          </h1>

          <p className="mt-3 text-[13px] leading-relaxed text-white/70">
            これはレイアウトの初期化段階で起きた例外です。再読み込みで直ることがあります。
          </p>

          {digest ? (
            <p className="mt-6 text-[11px] tracking-[0.18em] text-white/50">
              ERROR ID: {digest}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#111111] shadow-soft transition hover:opacity-90"
            >
              もう一度試す
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-white/90 transition hover:border-white/25"
            >
              HOMEへ戻る
            </Link>
          </div>

          <p className="mt-10 text-[11px] leading-relaxed text-white/55">
            直らない場合は、時間を置いて再度アクセスしてください。
          </p>
        </main>
      </body>
    </html>
  );
}
