// components/layout/SiteFooter.tsx
import Link from "next/link";

import { ConsentManageButton } from "@/components/analytics/ConsentManageButton";

const MAIN_NAV = [
  { href: "/cars", label: "車種", description: "一台ごとの性格を見極める。" },
  { href: "/guide", label: "実用", description: "買う、乗る、直す、手放す。" },
  { href: "/column", label: "考察", description: "相場、違和感、選び方の裏側。" },
  { href: "/heritage", label: "系譜", description: "継承、断絶、分岐を追う。" },
] as const;

const DIRECTORY = [
  { href: "/cars/makers", label: "メーカー別" },
  { href: "/cars/body-types", label: "ボディタイプ別" },
  { href: "/cars/segments", label: "用途・価格帯別" },
  { href: "/site-map", label: "サイトマップ" },
  { href: "/news", label: "ニュース" },
] as const;

const LEGAL = [
  { href: "/legal/about", label: "このサイトについて" },
  { href: "/legal", label: "法務・運営情報" },
  { href: "/legal/editorial-policy", label: "編集方針" },
  { href: "/legal/sources-factcheck", label: "出典・ファクトチェック" },
  { href: "/legal/ads-affiliate-policy", label: "広告・アフィリエイト" },
  { href: "/legal/privacy", label: "プライバシー" },
  { href: "/legal/disclaimer", label: "免責事項" },
  { href: "/legal/copyright", label: "著作権・引用" },
] as const;

function FooterArrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5 10h10m-4-4 4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--ink)] text-[var(--paper-light)]">
      <div className="page-shell py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 border-b border-[rgba(251,248,243,0.14)] pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.32em] text-[var(--cobalt)]">
              DRIVING CINEMA
            </p>
            <h2 className="mt-5 max-w-[11ch] text-[44px] font-bold leading-[0.9] tracking-[-0.08em] sm:text-[64px] lg:text-[88px]">
              観る。知る。選ぶ。
            </h2>
            <p className="mt-7 max-w-[34rem] text-[14px] leading-[1.95] text-[rgba(251,248,243,0.68)] sm:text-[15px]">
              CAR BOUTIQUE JOURNAL は、車種・実用・考察・系譜をつなぎ、見た瞬間の引力から判断できる情報までを一つの体験として編む自動車メディアです。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group min-h-[160px] border border-[rgba(251,248,243,0.14)] bg-[rgba(251,248,243,0.03)] p-5 transition-colors duration-150 hover:border-[rgba(27,63,229,0.62)] hover:bg-[rgba(27,63,229,0.14)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[22px] font-semibold tracking-[-0.04em]">{item.label}</span>
                  <span className="text-[var(--cobalt)] transition-transform duration-150 group-hover:translate-x-1">
                    <FooterArrow />
                  </span>
                </div>
                <p className="mt-7 text-[13px] leading-[1.85] text-[rgba(251,248,243,0.62)]">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.28em] text-[rgba(251,248,243,0.42)]">
              FIND
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
              {DIRECTORY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[13px] leading-[1.8] text-[rgba(251,248,243,0.72)] transition-colors duration-150 hover:text-[var(--cobalt)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.28em] text-[rgba(251,248,243,0.42)]">
              LEGAL
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
              {LEGAL.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[13px] leading-[1.8] text-[rgba(251,248,243,0.72)] transition-colors duration-150 hover:text-[var(--cobalt)]"
                >
                  {item.label}
                </Link>
              ))}
              <ConsentManageButton className="text-[13px] leading-[1.8] text-[rgba(251,248,243,0.72)] transition-colors duration-150 hover:text-[var(--cobalt)]" />
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(251,248,243,0.14)] pt-5 font-mono text-[11px] leading-[1.8] text-[rgba(251,248,243,0.46)]">
          <p>© {year} CAR BOUTIQUE JOURNAL</p>
        </div>
      </div>
    </footer>
  );
}
