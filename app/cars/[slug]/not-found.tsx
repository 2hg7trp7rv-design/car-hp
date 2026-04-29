// app/cars/[slug]/not-found.tsx
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { StatusPanel } from "@/components/system/StatusPanel";

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <StatusPanel
          kicker="404 / 車種"
          title="この車種ページは見つかりませんでした"
          lead="まだ準備中か、URLが間違っている可能性があります。車種一覧に戻って探し直してください。"
          variant="car"
          seedKey="not-found:car"
          note="検索やサイトマップから探し直せます。"
        >
          <Link
            href="/cars"
            className="cb-tap inline-flex items-center justify-center rounded-[14px] bg-[var(--surface-2)] border border-[var(--border-default)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[var(--text-primary)] shadow-soft transition hover:opacity-90"
          >
            車種一覧へ
          </Link>

          <Link
            href="/site-map"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[var(--text-primary)] shadow-soft transition hover:border-[rgba(27,63,229,0.3)]"
          >
            サイトマップ
          </Link>

          <Link
            href="/canvas"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[rgba(14,12,10,0.86)] transition hover:border-[rgba(14,12,10,0.12)]"
          >
            比較前の整理
          </Link>

          <Link
            href="/"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[rgba(14,12,10,0.86)] transition hover:border-[rgba(14,12,10,0.12)]"
          >
            ホーム
          </Link>

          <div className="w-full pt-4">
            <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-2)] p-4">
              <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="q">
                  サイト内検索
                </label>
                <input
                  id="q"
                  name="q"
                  placeholder="キーワードで探す（例: Civic / 事故 / 輸入車）"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-3 text-[13px] tracking-[0.06em] text-[var(--text-primary)] placeholder:text-[rgba(107,101,93,0.7)] shadow-soft focus:outline-none focus:ring-2 focus:ring-[rgba(27,63,229,0.24)]"
                />
                <button
                  type="submit"
                  className="cb-tap inline-flex items-center justify-center rounded-full bg-[var(--accent-base)] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[var(--surface-1)] shadow-soft transition hover:opacity-90"
                >
                  検索
                </button>
              </form>
            </div>
          </div>
        </StatusPanel>
      </div>
    </main>
  );
}
