// app/heritage/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function HeritageError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("HERITAGE error:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel mx-auto max-w-xl rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
          <p className="cb-eyebrow text-[#0ABAB5] opacity-100">ERROR / HERITAGE</p>

          <h1 className="serif-heading mt-4 text-[22px] tracking-[0.08em] text-[#222222] sm:text-[28px]">
            HERITAGEでエラーが発生しました
          </h1>

          <p className="cb-lead mt-3 text-[#222222]/70">
            一時的な不具合の可能性があります。もう一度試しても解消しない場合は、時間をおいて再度アクセスしてください。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="cb-tap inline-flex items-center justify-center rounded-full bg-[#222222] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
            >
              もう一度試す
            </button>

            <Link
              href="/heritage"
              className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/15 bg-white px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/35"
            >
              HERITAGEを開く
            </Link>

            <Link
              href="/"
              className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/80 transition hover:border-[#222222]/20"
            >
              HOME
            </Link>
          </div>

          {error?.digest ? (
            <p className="mt-6 text-[11px] tracking-[0.18em] text-[#222222]/55">
              ERROR ID: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
