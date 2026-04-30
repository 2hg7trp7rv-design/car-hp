"use client";

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("GlobalError (root layout):", error);
  }, [error]);

  const digest = (error?.digest ?? "").trim();

  return (
    <html lang="ja">
      <body className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20">
          <div className="rounded-[32px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.94)] p-8 shadow-[0_18px_44px_rgba(14,12,10,0.08)] sm:p-10">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-[var(--text-tertiary)]">
              システムエラー
            </p>

            <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              ページの読み込み中にエラーが発生しました
            </h1>

            <p className="mt-4 text-[15px] leading-[1.9] text-[var(--text-secondary)]">
              レイアウトの初期化段階で例外が起きています。再読み込みで直る場合があります。
            </p>

            {digest ? (
              <p className="mt-6 text-[11px] tracking-[0.18em] text-[var(--text-tertiary)]">
                エラーID: {digest}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[rgba(27,63,229,0.24)] bg-[rgba(27,63,229,0.12)] px-5 text-[12px] font-semibold tracking-[0.18em] text-[var(--accent-strong)] transition hover:border-[rgba(27,63,229,0.34)] hover:bg-[rgba(27,63,229,0.18)]"
              >
                再読み込み
              </button>

              <Link
                href="/"
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] px-5 text-[12px] font-semibold tracking-[0.18em] text-[var(--text-primary)] transition hover:border-[rgba(27,63,229,0.28)] hover:text-[var(--accent-strong)]"
              >
                ホームへ戻る
              </Link>
            </div>

            <p className="mt-8 text-[13px] leading-[1.9] text-[var(--text-tertiary)]">
              直らない場合は、少し時間を置いて再度アクセスしてください。
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
