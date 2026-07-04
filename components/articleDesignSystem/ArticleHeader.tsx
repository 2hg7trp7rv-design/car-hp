"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ArticleIcon } from "@/components/articleDesignSystem/icons";
import styles from "@/components/articleDesignSystem/article-design-system.module.css";

const links = [
  { href: "/", label: "ホーム", icon: "home" as const, tone: "pink" },
  { href: "/column", label: "コラム", icon: "column" as const, tone: "teal" },
  { href: "/guide", label: "ガイド", icon: "guide" as const, tone: "orange" },
  { href: "/legal/about", label: "CBJについて", icon: "about" as const, tone: "blue" },
];

export function ArticleHeader() {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={styles.articleHeader}>
      <div className={styles.articleHeaderInner}>
        <Link href="/" className={styles.articleBrand} aria-label="CAR BOUTIQUE JOURNAL ホーム">
          <strong>CBJ</strong>
          <span>CAR BOUTIQUE JOURNAL</span>
        </Link>
        <button
          type="button"
          className={styles.articleMenuButton}
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((value) => !value)}
        >
          <ArticleIcon name={open ? "close" : "menu"} />
        </button>
      </div>
      <nav id={navId} className={`${styles.articleMenu} ${open ? styles.articleMenuOpen : ""}`} aria-hidden={!open}>
        <div className={styles.articleMenuInner}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
              <span className={`${styles.menuIcon} ${styles[`menuIcon${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]}`}>
                <ArticleIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
              <ArticleIcon name="chevronRight" className={styles.menuChevron} />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
