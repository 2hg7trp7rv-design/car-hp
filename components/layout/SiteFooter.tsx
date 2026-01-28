// components/layout/SiteFooter.tsx
import Link from "next/link";

const footerLinks = [
  { href: "/search", label: "サイト内検索" },
  { href: "/compare", label: "車種比較（COMPARE）" },
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
    <footer className="border-t border-black/10 bg-brand-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold tracking-wide text-text-main">
              CAR BOUTIQUE
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-sm">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-text-sub hover:text-text-main underline-offset-4 hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-black/10 pt-6 text-xs text-text-sub md:flex-row md:items-center md:justify-between">
          <div>© {year} CAR BOUTIQUE</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link
              href="/sitemap.xml"
              className="hover:text-text-main underline-offset-4 hover:underline"
            >
              XML Sitemap
            </Link>
            <Link
              href="/robots.txt"
              className="hover:text-text-main underline-offset-4 hover:underline"
            >
              Robots
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
