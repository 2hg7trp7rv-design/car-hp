// app/cars/[slug]/not-found.tsx
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { StatusPanel } from "@/components/system/StatusPanel";

export default function NotFound() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <StatusPanel
          kicker="404 / CARS"
          title="この車種ページは見つかりませんでした"
          lead="まだ準備中か、URLが間違っている可能性があります。CARS一覧に戻って探し直してください。"
          variant="car"
          seedKey="not-found:car"
          note="迷ったら、検索（SEARCH）か、全体像（EXHIBITION）から入口に戻すのが速いです。"
        >
          <Link
            href="/cars"
            className="cb-tap inline-flex items-center justify-center rounded-full bg-[#222222] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
          >
            CARS一覧へ
          </Link>

          <Link
            href="/exhibition"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/15 bg-white px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/35"
          >
            EXHIBITION
          </Link>

          <Link
            href="/canvas"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/85 transition hover:border-[#222222]/20"
          >
            CANVAS
          </Link>

          <Link
            href="/"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/85 transition hover:border-[#222222]/20"
          >
            HOME
          </Link>

          <div className="w-full pt-4">
            <div className="rounded-2xl border border-[#222222]/10 bg-white/70 p-4">
              <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="q">
                  サイト内検索
                </label>
                <input
                  id="q"
                  name="q"
                  placeholder="キーワードで探す（例: Civic / 事故 / 輸入車）"
                  className="w-full rounded-xl border border-[#222222]/15 bg-white px-4 py-3 text-[13px] tracking-[0.06em] text-[#222222] placeholder:text-[#222222]/45 shadow-soft focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/35"
                />
                <button
                  type="submit"
                  className="cb-tap inline-flex items-center justify-center rounded-full bg-[#0ABAB5] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#042624] shadow-soft transition hover:opacity-90"
                >
                  SEARCH
                </button>
              </form>
            </div>
          </div>
        </StatusPanel>
      </div>
    </main>
  );
}
