import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";
import styles from "./layout.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.footerInner}`}>
        <div className={styles.footerBrand}>
          <Logo />
          <p>{SITE.tagline}</p>
        </div>
        <nav aria-label="カテゴリ" className={styles.footerNav}>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="サイトの案内" className={styles.footerNav}>
          <Link href="/about">サイトについて</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </nav>
      </div>
      <p className={styles.copyright}>© {new Date().getFullYear()} {SITE.name}</p>
    </footer>
  );
}
