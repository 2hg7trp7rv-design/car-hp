// app/not-found.tsx
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { StatusPanel } from "@/components/system/StatusPanel";

export default function NotFound() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <StatusPanel
          kicker="404"
          title="お探しのページが見つかりませんでした"
          lead="URLが間違っているか、展示が移動または削除された可能性があります。迷ったら、入口（Archive Gate）から入り直すのが最短です。"
          variant="generic"
          seedKey="not-found"
          note="検索と比較は工具（TOOLS）です。目的が決まっているなら CANVAS、まず全体像なら EXHIBITION から辿るのが速いです。"
        >
          <Link
            href="/"
            className="cb-tap inline-flex items-center justify-center rounded-full bg-[#222222] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
          >
            HOMEへ戻る
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
            href="/cars"
            className="cb-tap inline-flex items-center justify-center rounded-full border border-[#222222]/10 bg-white/60 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#222222]/85 transition hover:border-[#222222]/20"
          >
            CARS
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
                  placeholder="例: Civic / ロードサービス / 輸入車の諸費用"
                  className="w-full rounded-xl border border-[#222222]/15 bg-white px-4 py-3 text-[13px] tracking-[0.06em] text-[#222222] placeholder:text-[#222222]/45 shadow-soft focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/35"
                />
                <button
                  type="submit"
                  className="cb-tap inline-flex items-center justify-center rounded-full bg-[#0ABAB5] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#042624] shadow-soft transition hover:opacity-90"
                >
                  SEARCH
                </button>
              </form>
              <p className="mt-3 text-[11px] tracking-[0.18em] text-[#222222]/55">
                404でも止まらないように、ここから直接検索できます。
              </p>
            </div>
          </div>
        </StatusPanel>
      </div>
    </main>
  );
}
