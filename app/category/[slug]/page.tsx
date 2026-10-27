import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Talk } from "@/components/Talk";
import { getArticlesByCategory } from "@/content/articles";
import { CATEGORIES, getCategory } from "@/lib/categories";
import styles from "../../simple.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    // 記事が1本もない間は、中身のないページとして検索エンジンに載せない
    robots: getArticlesByCategory(category.slug).length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const articles = getArticlesByCategory(category.slug);

  return (
    <div className={`wrap ${styles.page}`}>
      <header className={`sticker ${styles.header}`} data-c={category.color}>
        <p className={styles.kicker}>カテゴリ</p>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </header>
      {articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Talk who="shuna" text="このカテゴリの記事は、いま準備中なんだって！" />
          <Talk who="rina" text="できたらここに並べるね。ほかのカテゴリも見てみて。" />
        </div>
      )}
    </div>
  );
}
