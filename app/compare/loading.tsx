import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * /compare は localStorage 同期などがあり、遷移直後に一瞬ローディングが出やすい。
 * ここでは “壊れて見えない” 最低限の文脈と導線を先に出す。
 */
export default function Loading() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-compare.webp" noUpscale />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "COMPARE" }]} />
          </div>

          <header className="mt-10 space-y-4">
            <p className="cb-eyebrow text-[#0ABAB5] opacity-100">COMPARE</p>
            <h1 className="serif-heading mt-4 text-[34px] tracking-[0.08em] text-[#222222] sm:text-[40px]">
              車種比較を準備中
            </h1>
            <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">
              画面を整えています。
              <br />
              迷ったら <Link className="underline" href="/canvas">Decision Canvas</Link> → Compare の順に進むと早いです。
            </p>
          </header>

          <div className="mt-10 rounded-2xl border border-[#222222]/10 bg-white p-6">
            <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">LOADING</p>
            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#222222]/15 to-transparent" />
            <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-[#222222]/55 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#222222]/35 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#222222]/25 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
