import { getArticle, getArticles } from "@/content/articles";
import { getCategory } from "@/lib/categories";
import { OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = "クルマのいろは の記事";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  const title = article?.shareTitle ?? "クルマのいろは";
  const label = (article && getCategory(article.category)?.name) ?? "クルマのいろは";
  return renderOgCard({ title, label });
}
