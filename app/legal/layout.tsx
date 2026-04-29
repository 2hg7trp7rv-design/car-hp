import type { ReactNode } from "react";
import Link from "next/link";

import { LegalSidebarNav } from "@/components/legal/LegalSidebarNav";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen">
      <DetailFixedBackground imageSrc="/images/hero-top-desktop.jpeg" />

      <div className="page-shell pb-24 pt-24">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-4">
            <section className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">運営と信頼</p>
              <h1 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
                運営と信頼の基準
              </h1>
              <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
                CAR BOUTIQUE JOURNAL が何を大切にし、どこまでを約束するのか。
                記事、広告、出典、個人情報、著作権まで、読者に先に開いておくためのページです。
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/legal" className="cb-chip">
                  一覧を見る
                </Link>
                <Link href="/contact" className="cb-chip">
                  問い合わせる
                </Link>
              </div>
            </section>

            <LegalSidebarNav />
          </aside>

          <div className="cb-panel p-6 sm:p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
