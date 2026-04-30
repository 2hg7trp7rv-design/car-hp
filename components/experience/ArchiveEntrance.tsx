import Link from "next/link";

import styles from "./archive-entrance.module.css";

export function ArchiveEntrance(props: {
  n: string;
  title: string;
  subtitle: string;
  lead?: string;
  active: "cars" | "heritage" | "guide" | "column";
}) {
  const items = [
    { key: "cars" as const, n: "01", label: "車種", href: "/cars" },
    { key: "heritage" as const, n: "02", label: "系譜", href: "/heritage" },
    { key: "guide" as const, n: "03", label: "ガイド", href: "/guide" },
    { key: "column" as const, n: "04", label: "視点", href: "/column" },
  ];

  return (
    <section className={styles.wrap} aria-label="アーカイブ導線">
      <div className={styles.panel}>
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.top}>
          <div className={styles.no}>ARCHIVE {props.n}</div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{props.title}</h1>
            <div className={styles.subtitle}>{props.subtitle}</div>
          </div>
          {props.lead ? <p className={styles.lead}>{props.lead}</p> : null}
        </div>

        <nav className={styles.nav} aria-label="アーカイブ導線ナビゲーション">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className={it.key === props.active ? styles.navItemActive : styles.navItem}
            >
              <span className={styles.navNo}>{it.n}</span>
              <span className={styles.navLabel}>{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
