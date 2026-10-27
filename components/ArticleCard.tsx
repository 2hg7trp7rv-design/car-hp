import Link from "next/link";
import type { Article } from "@/content/types";
import { getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { Phrases } from "./Phrases";
import styles from "./cards.module.css";

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const category = getCategory(article.category);
  return (
    <Link href={`/articles/${article.slug}`} className={`sticker ${styles.card} ${featured ? styles.featured : ""}`}>
      {category && (
        <span className={styles.pill} data-c={category.color}>
          {category.name}
        </span>
      )}
      <h3 className={styles.cardTitle}>
        <Phrases>{article.title}</Phrases>
      </h3>
      <p className={styles.cardText}>
        <Phrases>{article.description}</Phrases>
      </p>
      <span className={styles.cardMeta}>
        <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
        <span aria-hidden="true" className={styles.arrow}>
          読む →
        </span>
      </span>
    </Link>
  );
}
