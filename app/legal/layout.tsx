import type { ReactNode } from "react";

import { LegalSidebarNav } from "@/components/legal/LegalSidebarNav";
import { CBJ_BRAND_COPY } from "@/lib/brand/cbj-copy";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f6f1e9]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(0,112,141,0.12),transparent_32%),linear-gradient(180deg,#f9f5ee_0%,#f4eee5_58%,#eee7dc_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[linear-gradient(180deg,rgba(3,4,4,0.08),rgba(3,4,4,0))]" />

      <div className="mx-auto w-full max-w-[1180px] px-[clamp(20px,5vw,56px)] pb-[clamp(80px,12vw,132px)] pt-[clamp(84px,12vw,132px)]">
        <header className="mb-[clamp(34px,6vw,70px)] border-b border-black/10 pb-[clamp(30px,5vw,54px)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#00708d]">
            CBJ TRUST DOCUMENTS
          </p>
          <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <h1 className="max-w-[12ch] text-[clamp(42px,8vw,92px)] font-semibold leading-[0.96] tracking-[-0.08em] text-[#080b0d]">
              運営と信頼
            </h1>
            <div className="max-w-[620px] lg:justify-self-end">
              <p className="text-[clamp(15px,2vw,18px)] leading-[2.05] tracking-[0.02em] text-[#273139]">
                {CBJ_BRAND_COPY}
              </p>
              <p className="mt-4 text-[13px] leading-[1.95] tracking-[0.03em] text-[#626b72]">
                記事の作り方、広告との距離感、出典の扱い、個人情報、著作権まで、CBJを読む前に確認できる基準をまとめています
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-[clamp(22px,4vw,40px)] lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <LegalSidebarNav />
          </aside>

          <div className="rounded-[clamp(26px,4vw,42px)] border border-black/10 bg-white/[0.72] p-[clamp(20px,4vw,48px)] shadow-[0_28px_90px_-60px_rgba(3,4,4,0.45)] backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
