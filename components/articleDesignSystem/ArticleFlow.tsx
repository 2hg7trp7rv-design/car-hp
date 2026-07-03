"use client";

import { ArticleIcon } from "@/components/articleDesignSystem/icons";
import styles from "@/components/articleDesignSystem/article-design-system.module.css";

export type ArticleFlowItem = {
  id: string;
  number: string;
  title: string;
  color: string;
};

export function ArticleFlow({ items }: { items: ArticleFlowItem[] }) {
  if (!items.length) return null;

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const offset = 74;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav className={styles.articleFlow} aria-label="この記事の流れ">
      <div className={styles.articleFlowTitle}>
        <ArticleIcon name="book" />
        <h2>この記事の流れ</h2>
      </div>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(item.id);
              }}
            >
              <span className={styles.flowNumber} style={{ backgroundColor: item.color }}>{item.number}</span>
              <span>{item.title}</span>
              <ArticleIcon name="chevronRight" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
