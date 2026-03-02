// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { StatusPanel } from "@/components/system/StatusPanel";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Keep logging for debugging in production.
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <StatusPanel
          kicker="ERROR"
          title="予期しないエラーが発生しました"
          lead="一時的な不具合の可能性があります。もう一度試しても解消しない場合は、時間をおいて再度アクセスしてください。"
          variant="generic"
          seedKey={error?.digest ? `error:${error.digest}` : "error"}
          note={
            error?.digest
              ? `ERROR ID: ${error.digest}`
              : "同じ操作で繰り返し発生する場合は、再現手順をメモしてお問い合わせください。"
          }
        >
          <button
            type="button"
            onClick={reset}
            className="cb-tap inline-flex items-center justify-center rounded-full bg-[#222222] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
          >
            もう一度試す
          </button>

          <Link
            href="/"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/15 bg-white px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/35"
          >
            HOMEへ戻る
          </Link>

          <Link
            href="/site-map"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/85 transition hover:border-[#222222]/20"
          >
            SITE MAP
          </Link>

          <Link
            href="/contact"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/85 transition hover:border-[#222222]/20"
          >
            お問い合わせ
          </Link>
        </StatusPanel>
      </div>
    </main>
  );
}
