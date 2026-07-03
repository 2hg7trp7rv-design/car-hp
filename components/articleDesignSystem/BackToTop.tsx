"use client";

import { useEffect, useState } from "react";

import { ArticleIcon } from "@/components/articleDesignSystem/icons";
import styles from "@/components/articleDesignSystem/article-design-system.module.css";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 520);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.backToTop} ${visible ? styles.backToTopVisible : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="ページ上部へ戻る"
      tabIndex={visible ? 0 : -1}
    >
      <ArticleIcon name="chevronUp" />
    </button>
  );
}
