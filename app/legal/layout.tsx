import type { ReactNode } from "react";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
