import type { ReactNode } from "react";

import { LegalSidebarNav } from "@/components/legal/LegalSidebarNav";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--paper)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(14,124,123,0.1),transparent_30%),linear-gradient(180deg,var(--paper)_0%,var(--paper)_56%,var(--paper)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-[linear-gradient(180deg,rgba(3,4,4,0.06),rgba(3,4,4,0))]" />

      <div className="mx-auto w-full max-w-[1180px] px-[clamp(18px,4.8vw,56px)] pb-[clamp(76px,11vw,128px)] pt-[clamp(58px,9vw,112px)]">
        <div className="grid gap-[clamp(22px,4vw,40px)] lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <LegalSidebarNav />
          </aside>

          <div>
            <div className="rounded-[clamp(24px,4vw,40px)] border border-black/10 bg-white/[0.76] p-[clamp(18px,4vw,44px)] shadow-[0_28px_90px_-64px_rgba(3,4,4,0.42)] backdrop-blur-sm">
              {children}
            </div>

            <div className="mt-8 lg:hidden">
              <LegalSidebarNav compact />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
