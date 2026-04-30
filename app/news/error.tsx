// app/news/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { StatusPanel } from "@/components/system/StatusPanel";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NewsError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("NEWS error:", error);
  }, [error]);

  const note = error?.digest ? `エラーID: ${error.digest}` : undefined;

  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <StatusPanel
          kicker="ニュース"
          title="ニュースでエラーが発生しました"
          lead="一時的な不具合の可能性があります。もう一度試しても解消しない場合は、時間をおいて再度アクセスしてください。"
          variant="generic"
          seedKey={error?.digest ? `error:news:${error.digest}` : "error:news"}
          note={note}
        >
          <button
            type="button"
            onClick={reset}
            className="cb-tap inline-flex items-center justify-center rounded-[14px] bg-[var(--surface-2)] border border-[var(--border-default)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[var(--text-primary)] shadow-soft transition hover:opacity-90"
          >
            もう一度試す
          </button>

          <Link
            href="/news"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[var(--text-primary)] shadow-soft transition hover:border-[rgba(122,135,108,0.3)]"
          >
            ニュース一覧へ
          </Link>

          <Link
            href="/"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[rgba(31,28,25,0.86)] transition hover:border-[rgba(31,28,25,0.12)]"
          >
            ホームへ戻る
          </Link>

          <Link
            href="/contact"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[rgba(31,28,25,0.86)] transition hover:border-[rgba(31,28,25,0.12)]"
          >
            お問い合わせ
          </Link>
        </StatusPanel>
      </div>
    </main>
  );
}
