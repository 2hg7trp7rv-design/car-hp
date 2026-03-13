// app/not-found.tsx
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

const NAV_LINKS = [
  { href: "/", label: "HOME", desc: "アーカイブの入口" },
  { href: "/cars", label: "CARS", desc: "車種から選ぶ" },
  { href: "/guide", label: "GUIDE", desc: "手順を進める" },
  { href: "/column", label: "COLUMN", desc: "視点を切る" },
  { href: "/heritage", label: "HERITAGE", desc: "歴史に浸る" },
  { href: "/search", label: "SEARCH", desc: "キーワードで探す" },
] as const;

export default function NotFound() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-32 pt-24">
        <div className="mx-auto max-w-2xl">

          {/* Status header */}
          <div className="mb-10">
            <p className="text-[11px] font-medium tracking-[0.34em] text-[#0ABAB5]">
              404
            </p>
            <h1 className="mt-3 text-[clamp(22px,3vw,32px)] font-medium tracking-[0.04em] text-white">
              ページが見つかりませんでした
            </h1>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/60">
              URLが変わったか、展示が移動・削除された可能性があります。
              下の入口から入り直してください。
            </p>
          </div>

          {/* Navigation grid */}
          <nav aria-label="Recovery navigation">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex flex-col gap-1 rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur transition-all duration-300 hover:border-[#0ABAB5]/50 hover:bg-white/10"
                  >
                    <span className="text-[11px] font-semibold tracking-[0.22em] text-white/90 transition-colors duration-300 group-hover:text-[#0ABAB5]">
                      {link.label}
                    </span>
                    <span className="text-[11px] text-white/45">
                      {link.desc}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Inline search */}
          <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
            <p className="mb-3 text-[11px] font-medium tracking-[0.22em] text-white/55">
              SEARCH
            </p>
            <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="q-404">
                サイト内検索
              </label>
              <input
                id="q-404"
                name="q"
                placeholder="例: Civic / ロードサービス / 輸入車の諸費用"
                className="w-full rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-[13px] tracking-[0.06em] text-white placeholder:text-white/35 backdrop-blur focus:border-[#0ABAB5]/50 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/25"
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
