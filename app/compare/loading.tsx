import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * /compare は localStorage 同期などがあり、遷移直後に一瞬ローディングが出やすい。
 * ここでは “壊れて見えない” 最低限の文脈と導線を先に出す。
 */
export default function Loading() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-compare.webp" noUpscale />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-soft-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "車種比較" }]} />
          </div>

          <header className="mt-10 space-y-4">
            <p className="cb-eyebrow text-[var(--accent-base)] opacity-100">車種比較</p>
            <h1 className="cb-sans-heading mt-4 text-[34px] tracking-[0.08em] text-[var(--text-primary)] sm:text-[40px]">
              車種比較を準備中
            </h1>
            <p className="cb-lead mt-3 max-w-2xl text-[rgba(76,69,61,0.88)]">
              画面を整えています。
              <br />
              迷ったときは <Link className="underline" href="/cars/segments">用途から絞る</Link> ページで候補を絞ると見やすくなります。
            </p>
          </header>

          <div className="mt-10 rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] p-6">
            <p className="text-[11px] tracking-[0.22em] text-[rgba(107,101,93,0.88)]">読み込み中</p>
            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[rgba(14,12,10,0.12)] to-transparent" />
            <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(228,219,207,0.42)]/55 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(228,219,207,0.42)]/35 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(228,219,207,0.42)]/25 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
