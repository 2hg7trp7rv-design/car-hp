// components/layout/SiteFooter.tsx
import Link from "next/link";
import { ConsentManageButton } from "@/components/analytics/ConsentManageButton";

const ARCHIVES = [
  { href: "/", label: "HOME" },
  { href: "/cars", label: "CARS" },
  { href: "/heritage", label: "HERITAGE" },
  { href: "/guide", label: "GUIDE" },
  { href: "/column", label: "COLUMN" },
] as const;

const TOOLS = [
  { href: "/news", label: "NEWS" },
  { href: "/site-map", label: "SITE MAP" },
] as const;

const CATALOG = [
  { href: "/cars/makers", label: "メーカー別 車種一覧" },
  { href: "/cars/body-types", label: "ボディタイプ別 車種一覧" },
  { href: "/cars/segments", label: "セグメント別 車種一覧" },
] as const;

const LEGAL = [
  { href: "/legal/about", label: "運営者情報" },
  { href: "/legal/editorial-policy", label: "編集方針" },
  { href: "/legal/sources-factcheck", label: "出典・ファクトチェック" },
  { href: "/legal/ads-affiliate-policy", label: "広告・アフィリエイト" },
  { href: "/legal/privacy", label: "プライバシー" },
  { href: "/legal/disclaimer", label: "免責事項" },
  { href: "/legal/copyright", label: "著作権・引用" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#07080a] text-white">
      {/* subtle glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06),_transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0)_55%)]" />
      </div>

      <div className="page-shell relative z-10 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="inline-block">
              <div className="leading-none">
                <div className="cb-font-display text-[18px] tracking-[0.14em]">
                  CAR BOUTIQUE JOURNAL
                </div>
                <div className="cb-font-sans mt-3 text-[10px] tracking-[0.26em] text-white/60">
                  An archive you enter, not browse.
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-[13px] leading-relaxed text-white/70">
              Cars, Guides, Columns, and Heritage—one exhibition.
              Search and compare in the same language.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <nav aria-label="Archives">
              <p className="text-[10px] tracking-[0.34em] text-white/55">ARCHIVES</p>
              <ul className="mt-4 space-y-3 text-[12px]">
                {ARCHIVES.map((l) => (
                  <li key={l.href}>
                    <Link className="text-white/70 hover:text-[#0ABAB5]" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Tools">
              <p className="text-[10px] tracking-[0.34em] text-white/55">TOOLS</p>
              <ul className="mt-4 space-y-3 text-[12px]">
                {TOOLS.map((l) => (
                  <li key={l.href}>
                    <Link className="text-white/70 hover:text-[#0ABAB5]" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <p className="text-[10px] tracking-[0.34em] text-white/55">CATALOG</p>
                <ul className="mt-4 space-y-3 text-[12px]">
                  {CATALOG.map((l) => (
                    <li key={l.href}>
                      <Link className="text-white/70 hover:text-[#0ABAB5]" href={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <nav aria-label="Legal">
              <p className="text-[10px] tracking-[0.34em] text-white/55">LEGAL</p>
              <ul className="mt-4 space-y-3 text-[12px]">
                {LEGAL.slice(0, 6).map((l) => (
                  <li key={l.href}>
                    <Link className="text-white/70 hover:text-[#0ABAB5]" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link href="/contact" className="text-[12px] text-white/70 hover:text-[#0ABAB5]">
                  お問い合わせ
                </Link>
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <div>© {year} CAR BOUTIQUE JOURNAL</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {/* NOTE: robots/sitemap は Next の RSC prefetch が走ると
                 tools 側で XHR error 扱いになることがあるため、通常の <a> にする */}
              <a href="/sitemap.xml" className="hover:text-white hover:underline underline-offset-4">
                XML Sitemap
              </a>
              <a href="/robots.txt" className="hover:text-white hover:underline underline-offset-4">
                Robots
              </a>
              <ConsentManageButton />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
