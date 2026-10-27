import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { Logo } from "./Logo";
import styles from "./layout.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.headerInner}`}>
        <Link href="/" className={styles.homeLink} aria-label="クルマのいろは トップへ">
          <Logo />
        </Link>
        <nav aria-label="カテゴリ" className={styles.nav}>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} data-c={c.color}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
