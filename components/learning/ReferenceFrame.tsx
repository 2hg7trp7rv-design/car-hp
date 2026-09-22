import Link from "next/link";
import type { ReactNode } from "react";
import { refbookRounded, refbookSans } from "@/app/refbook-fonts";
import { CookieSettingsButton } from "@/components/analytics/CookieSettingsButton";
import styles from "./reference.module.css";

export function ReferenceFrame({ children }: { children: ReactNode }) {
  return <div className={`${styles.frame} ${refbookSans.variable} ${refbookRounded.variable}`} data-cbj-reference>
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="CAR BOUTIQUE JOURNAL ホーム">
        <svg viewBox="0 0 180 28" aria-hidden="true"><path d="M5 25c10-14 23-15 37-15C64-2 91 0 112 7l40 7 17 10" /></svg>
        <strong>CAR BOUTIQUE JOURNAL</strong><span>クルマが、もっと好きになる。</span>
      </Link>
      <nav aria-label="メインナビゲーション" className={styles.nav}>
        <Link href="/learn">学ぶ</Link><Link href="/choose">選ぶ</Link><Link href="/glossary">用語を調べる</Link>
      </nav>
      <form role="search" action="/search" className={styles.search}>
        <label htmlFor="reference-search" className={styles.srOnly}>キーワードで探す</label>
        <input id="reference-search" type="search" name="q" placeholder="キーワードで探す" maxLength={200} />
        <button type="submit" aria-label="検索"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg></button>
      </form>
    </header>
    <div id="cb-main" tabIndex={-1}>{children}</div>
    <footer className={styles.footer}>
      <p><strong>CAR BOUTIQUE JOURNAL</strong><span>好きが、日常を少し豊かにする。</span></p>
      <nav aria-label="関連コンテンツ"><Link href="/cars">車種から探す</Link><Link href="/guide">ガイド</Link><Link href="/column">コラム</Link><Link href="/heritage">クルマの系譜</Link></nav>
      <nav aria-label="運営情報"><Link href="/legal/about">運営情報</Link><Link href="/legal/editorial-policy">編集方針</Link><Link href="/legal/ads-affiliate-policy">広告について</Link><Link href="/legal/privacy">プライバシー</Link><Link href="/contact">お問い合わせ</Link><CookieSettingsButton /></nav>
    </footer>
  </div>;
}
