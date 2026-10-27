import type { Article } from "@/content/types";
import { selfGasStation } from "@/content/articles/self-gas-station";

/** 新しい記事をここに追加する。並び順は公開日の新しい順に揃える。 */
const ARTICLES: Article[] = [selfGasStation].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getArticles(): Article[] {
  return ARTICLES;
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}
