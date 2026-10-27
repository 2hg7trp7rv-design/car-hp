import type { MetadataRoute } from "next";
import { getArticles, getArticlesByCategory } from "@/content/articles";
import { CATEGORIES } from "@/lib/categories";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  return [
    { url: absoluteUrl("/"), lastModified: articles[0]?.updatedAt },
    ...CATEGORIES.filter((c) => getArticlesByCategory(c.slug).length > 0).map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
    })),
    ...articles.map((a) => ({ url: absoluteUrl(`/articles/${a.slug}`), lastModified: a.updatedAt })),
    { url: absoluteUrl("/about") },
    { url: absoluteUrl("/privacy") },
  ];
}
