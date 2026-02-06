// components/layout/SiteFooter.tsx
import Link from "next/link";

const footerLinks = [
  { href: "/news", label: "メーカー公式NEWS" },
  { href: "/cars", label: "車種DB（CARS）" },
  { href: "/cars/makers", label: "メーカー別 車種一覧" },
  { href: "/cars/body-types", label: "ボディタイプ別 車種一覧" },
  { href: "/cars/segments", label: "セグメント別 車種一覧" },
  { href: "/site-map", label: "サイトマップ" },
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
    <footer className="relative overflow-hidden bg-[#0b0b0b] text-white">
      {/* subtle glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.22),_transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_70%)] blur-3xl" />
      </div>

      <div className="page-shell relative z-10 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0ABAB5_0%,_#058e8a_100%)] shadow-[0_12px_32px_rgba(10,186,181,0.24)]">
                  <span className="cb-font-display text-[18px] font-semibold tracking-[0.08em] text-white">
                    C
                  </span>
                </span>
                <div className="leading-none">
                  <div className="cb-font-display text-[18px] tracking-[0.14em]">
                    CAR BOUTIQUE
                  </div>
                  <div className="cb-font-sans mt-2 text-[10px] tracking-[0.26em] text-white/60">
                    Journal / Database / Guide
                  </div>
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-[13px] leading-relaxed text-white/70">
              買ってからの現実（維持費・故障・保険・税金・売却）を先に並べ、判断の順番を作る。
              CAR BOUTIQUEは“迷いを減らす”ための棚です。
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-[12px] leading-relaxed sm:grid-cols-3">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/70 hover:text-[#0ABAB5] hover:underline underline-offset-4"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <div>© {year} CAR BOUTIQUE</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {/* NOTE: robots/sitemap は Next の RSC prefetch が走ると
                 tools 側で XHR error 扱いになることがあるため、通常の <a> にする */}
              <a
                href="/sitemap.xml"
                className="hover:text-white hover:underline underline-offset-4"
              >
                XML Sitemap
              </a>
              <a
                href="/robots.txt"
                className="hover:text-white hover:underline underline-offset-4"
              >
                Robots
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
