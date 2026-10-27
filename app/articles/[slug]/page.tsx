import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBlocks } from "@/components/ArticleBlocks";
import { ArticleCard } from "@/components/ArticleCard";
import { Phrases } from "@/components/Phrases";
import { ShareButtons } from "@/components/ShareButtons";
import { Talk } from "@/components/Talk";
import { getArticle, getArticles } from "@/content/articles";
import { getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { absoluteUrl, SITE } from "@/lib/site";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const path = `/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      locale: "ja_JP",
      url: path,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const category = getCategory(article.category);
  const url = absoluteUrl(`/articles/${article.slug}`);
  const others = getArticles().filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      mainEntityOfPage: url,
      image: absoluteUrl(`/articles/${article.slug}/opengraph-image`),
      author: { "@type": "Organization", name: `${SITE.name} 編集部`, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: SITE.url },
        ...(category
          ? [{ "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(`/category/${category.slug}`) }]
          : []),
        { "@type": "ListItem", position: category ? 3 : 2, name: article.title, item: url },
      ],
    },
  ];

  return (
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className={styles.hero}>
        <div className="narrow">
          <nav aria-label="現在地" className={styles.crumbs}>
            <Link href="/">トップ</Link>
            {category && (
              <>
                <span aria-hidden="true">›</span>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </>
            )}
          </nav>
          {category && (
            <span className={styles.pill} data-c={category.color}>
              {category.name}
            </span>
          )}
          <h1 className={styles.title}>
            <Phrases>{article.title}</Phrases>
          </h1>
          <p className={styles.meta}>
            <span>{SITE.name} 編集部</span>
            <span>
              更新 <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
            </span>
          </p>
        </div>
      </header>

      <div className={`narrow ${styles.body}`}>
        <Talk who="shuna" text={article.question} large />

        <section className={`sticker ${styles.learn}`} aria-labelledby="learn-title">
          <h2 id="learn-title">この記事でわかること</h2>
          <ul>
            {article.learn.map((item) => (
              <li key={item}>
                <Phrases>{item}</Phrases>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="目次" className={styles.toc}>
          <p>目次</p>
          <ol>
            {article.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span aria-hidden="true" className={styles.tocNo}>
                    {i + 1}
                  </span>
                  <Phrases>{s.title}</Phrases>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {article.sections.map((s, i) => (
          <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className={styles.h2}>
              <span aria-hidden="true" className={styles.sectionNo}>
                {i + 1}
              </span>
              <Phrases>{s.title}</Phrases>
            </h2>
            <ArticleBlocks blocks={s.blocks} />
          </section>
        ))}

        <section className={`sticker ${styles.summary}`} aria-labelledby="summary-title">
          <h2 id="summary-title">まとめ</h2>
          <ul>
            {article.summary.map((item) => (
              <li key={item}>
                <Phrases>{item}</Phrases>
              </li>
            ))}
          </ul>
        </section>

        <ShareButtons url={url} text={`${article.shareTitle.replace(/\n/g, "")}｜${SITE.name}`} />

        <section className={styles.sources} aria-labelledby="sources-title">
          <h2 id="sources-title">確認した資料</h2>
          <ul>
            {article.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <Phrases>{s.title}</Phrases>
                </a>
                <span className={styles.publisher}>
                  {s.publisher}
                  {s.date ? `（${s.date}）` : ""}
                </span>
              </li>
            ))}
          </ul>
          <p>
            <Phrases>
              クルマや燃料の指定は車種ごとに違います。最後は、自分のクルマの取扱説明書と、お店の表示で確かめてください。
            </Phrases>
          </p>
        </section>

        {others.length > 0 && (
          <section aria-labelledby="next-title">
            <h2 id="next-title" className={styles.nextTitle}>
              次に読むなら
            </h2>
            <div className={styles.next}>
              {others.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
