import Link from "next/link";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export default function NotFound() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-32 pt-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <p className="text-[11px] font-medium tracking-[0.34em] text-[#0ABAB5]">
              404 / COLUMN
            </p>
            <h1 className="mt-3 text-[clamp(20px,2.8vw,30px)] font-medium tracking-[0.04em] text-white">
              このページは見つかりませんでした
            </h1>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/60">
              URLが変わったか、コンテンツが移動・削除された可能性があります。
            </p>
          </div>
          <nav aria-label="Recovery navigation">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/column"
                className="cb-tap inline-flex items-center gap-2 rounded-full bg-[#0ABAB5] px-5 py-3 text-[12px] font-semibold tracking-[0.18em] text-[#042624] transition hover:opacity-90"
              >
                COLUMN一覧へ <span aria-hidden>→</span>
              </Link>
              <Link
                href="/"
                className="cb-tap inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-[12px] tracking-[0.18em] text-white/75 backdrop-blur transition hover:bg-white/10"
              >
                HOME
              </Link>
              <Link
                href="/search"
                className="cb-tap inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-[12px] tracking-[0.18em] text-white/75 backdrop-blur transition hover:bg-white/10"
              >
                SEARCH
              </Link>
            </div>
          </nav>
          <div className="mt-8 rounded-2xl border border-white/12 bg-white/[0.05] p-5 backdrop-blur">
            <p className="mb-3 text-[11px] font-medium tracking-[0.22em] text-white/45">SEARCH</p>
            <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="q-nf">サイト内検索</label>
              <input
                id="q-nf"
                name="q"
                placeholder="キーワードで探す（例: Civic / 事故 / 輸入車）"
                className="w-full rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-[13px] text-white placeholder:text-white/35 backdrop-blur focus:border-[#0ABAB5]/50 focus:outline-none"
              />
              <button
                type="submit"
                className="cb-tap inline-flex shrink-0 items-center justify-center rounded-full bg-[#0ABAB5] px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[#042624] transition hover:opacity-90"
              >
                SEARCH
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
