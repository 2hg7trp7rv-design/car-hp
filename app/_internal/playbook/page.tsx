// app/_internal/playbook/page.tsx

import type { Metadata } from "next";

import { CBJ_PLAYBOOK, CBJ_PLAYBOOK_VERSION } from "@/docs/CBJ_PLAYBOOK";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export const metadata: Metadata = {
  title: `Playbook (Internal) v${CBJ_PLAYBOOK_VERSION}`,
  description: "CAR BOUTIQUE JOURNAL Growth Playbook (Internal)",
  robots: NOINDEX_ROBOTS,
};

export default function InternalPlaybookPage() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="mx-auto max-w-4xl px-5 py-10">
                  <div className="mb-6">
                    <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">
                      INTERNAL / PLAYBOOK
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#222222]">
                      Growth Playbook
                    </h1>
                    <p className="mt-1 text-sm text-[#222222]/70">
                      v{CBJ_PLAYBOOK_VERSION}（noindex）
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#222222]/10 bg-white p-5 shadow-sm">
                    <pre className="whitespace-pre-wrap break-words text-[12px] leading-[1.9] text-[#222222]/85">
                      {CBJ_PLAYBOOK}
                    </pre>
                  </div>
          </div>
        </div>
      </div>
    </main>
  );}
