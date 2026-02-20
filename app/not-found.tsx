// app/not-found.tsx
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export default function NotFound() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel mx-auto max-w-xl rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
          <p className="cb-eyebrow text-[#0ABAB5] opacity-100">404</p>

          <h1 className="serif-heading mt-4 text-[22px] tracking-[0.08em] text-[#222222] sm:text-[28px]">
            お探しのページが見つかりませんでした
          </h1>

          <p className="cb-lead mt-3 text-[#222222]/70">
            URLが間違っているか、ページが移動または削除された可能性があります。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#222222] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
            >
              HOMEへ戻る
            </Link>

            <Link
              href="/cars"
              className="inline-flex items-center justify-center rounded-full border border-[#222222]/15 bg-white px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/35"
            >
              CARSを開く
            </Link>

            <Link
              href="/heritage"
              className="inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/80 transition hover:border-[#222222]/20"
            >
              HERITAGE
            </Link>
          </div>

          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-[#222222]/15 to-transparent" />
          <p className="mt-6 text-[11px] tracking-[0.18em] text-[#222222]/55">
            必要なら、トップページから入口（Archive Gate）へ戻って探すのが最短です。
          </p>
        </div>
      </div>
    </main>
  );
}
