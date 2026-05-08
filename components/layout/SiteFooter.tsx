// components/layout/SiteFooter.tsx
import Link from "next/link";

import { ConsentManageButton } from "@/components/analytics/ConsentManageButton";

type SiteFooterProps = { variant?: "default" | "carArticle" };

const MAIN_NAV = [
  { href: "/cars", label: "車種 / CARS", description: "" },
  { href: "/guide", label: "実用 / GUIDE", description: "" },
  { href: "/column", label: "考察 / COLUMN", description: "" },
  { href: "/heritage", label: "系譜 / HERITAGE", description: "" },
] as const;

const DIRECTORY = [
  { href: "/cars/makers", label: "メーカー別" },
  { href: "/cars/body-types", label: "ボディタイプ別" },
  { href: "/cars/segments", label: "価格帯別" },
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

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5 10h10m-4-4 4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function SiteFooter({ variant = "default" }: SiteFooterProps) {
  const year = new Date().getFullYear();

  if (variant === "carArticle") {
    return (
      <footer className="car-article-footer">
        <div className="car-article-footer-inner">
          <h2>CAR BOUTIQUE<br />JOURNAL</h2>
          <p className="car-article-footer-lead">自動車という芸術を、もっと深く。エディトリアルの視点で車文化を読み解くメディア。</p>
          <form className="car-article-footer-form" action="/" aria-label="メール登録">
            <input type="email" placeholder="Enter your email" aria-label="メールアドレス" />
            <button type="submit" aria-label="登録">↗</button>
          </form>
          <div className="car-article-footer-columns">
            <div><p>コンテンツ</p><Link href="/cars">車種一覧</Link><Link href="/guide">実用ガイド</Link><Link href="/column">考察コラム</Link></div>
            <div><p>系譜特集</p><Link href="/heritage">系譜一覧</Link></div>
            <div><p>サイト</p><Link href="/legal/about">About</Link><Link href="/contact">Contact</Link><Link href="/legal/privacy">Privacy</Link></div>
            <div><p>ソーシャル</p><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a><a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a></div>
          </div>
          <div className="car-article-footer-bottom">
            <p>© {year} CAR BOUTIQUE JOURNAL. All rights reserved.</p>
            <div><Link href="/legal">Terms</Link><Link href="/legal/privacy">Privacy Policy</Link><ConsentManageButton className="text-[11px] leading-[1.8] text-white/35 transition-colors duration-150 hover:text-white/70" /></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-20 border-t border-[var(--border-default)] bg-[linear-gradient(180deg,rgba(238,231,222,0.48)_0%,rgba(246,242,235,0.92)_16%,rgba(251,248,243,0.98)_100%)] text-[var(--text-primary)]">
      <div className="page-shell py-16 sm:py-20">
        <div className="grid gap-14 border-b border-[var(--border-default)] pb-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <h2 className="max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[44px] lg:text-[54px]">
              CAR BOUTIQUE JOURNAL
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.82)] px-5 py-5 transition-colors duration-150 hover:border-[rgba(122,135,108,0.28)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[18px] font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                    {item.label}
                  </div>
                  <div className="text-[var(--text-tertiary)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--accent-strong)]">
                    <Arrow />
                  </div>
                </div>
                {item.description ? (
                  <p className="mt-3 text-[13px] leading-[1.8] text-[var(--text-secondary)]">{item.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-14 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.26em] text-[var(--text-tertiary)] uppercase">
              BROWSE
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {DIRECTORY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.74)] px-4 py-3 text-[13px] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[rgba(122,135,108,0.28)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.26em] text-[var(--text-tertiary)] uppercase">
                LEGAL
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                {LEGAL.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] leading-[1.8] text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--accent-strong)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] leading-[1.8] text-[var(--text-secondary)]">
              <ConsentManageButton className="text-[13px] leading-[1.8] text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--accent-strong)]" />
              <Link
                href="/legal/privacy"
                className="text-[13px] leading-[1.8] text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--accent-strong)]"
              >
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-default)] pt-5 text-[12px] leading-[1.8] text-[var(--text-tertiary)]">
          <p>© {year} CAR BOUTIQUE JOURNAL</p>
        </div>
      </div>
    </footer>
  );
}
