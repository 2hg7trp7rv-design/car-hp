import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticles, getArticlesByCategory } from "@/content/articles";
import { CATEGORIES } from "@/lib/categories";
import { CHARACTERS } from "@/lib/characters";
import { SITE } from "@/lib/site";
import styles from "./page.module.css";

export default function HomePage() {
  const articles = getArticles();
  const [latest, ...rest] = articles;

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>{SITE.tagline}</p>
            <h1 className={styles.heroTitle}>
              クルマのこと、
              <br />
              <span>いろは</span>から。
            </h1>
            <p className={styles.lead}>
              給油のしかた、メーターの見方、維持費のこと。シュナと莉奈が、会話と図でやさしく説明します。
            </p>
            <div className={styles.heroActions}>
              {latest && (
                <Link href={`/articles/${latest.slug}`} className="button">
                  まずはこの記事から →
                </Link>
              )}
              <a href="#hosts" className={styles.textLink}>
                ふたりを知る
              </a>
            </div>
          </div>
          <div className={styles.heroArt}>
            <div className={`sticker ${styles.heroFrame}`}>
              <Image
                src="/images/characters/hero.webp"
                alt="クルマの前で話すシュナと莉奈"
                width={1536}
                height={1024}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 860px) 100vw, 560px"
              />
            </div>
            <span className={styles.badge} aria-hidden="true">
              はじめてでも
              <br />
              だいじょうぶ！
            </span>
          </div>
        </div>
      </section>

      <section id="hosts" className={`wrap ${styles.block}`} aria-labelledby="hosts-title">
        <h2 id="hosts-title" className={styles.blockTitle}>
          <span>教えてくれるのは、このふたり</span>
        </h2>
        <div className={styles.hosts}>
          {(["shuna", "rina"] as const).map((key) => {
            const c = CHARACTERS[key];
            return (
              <div key={key} className={`sticker ${styles.host}`} data-c={c.color}>
                <div className={styles.hostAvatar}>
                  <Image src={c.image} alt="" width={160} height={160} sizes="96px" />
                </div>
                <div>
                  <p className={styles.hostRole}>{c.role}</p>
                  <h3 className={styles.hostName}>{c.name}</h3>
                  <p className={styles.hostIntro}>{c.intro}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {latest && (
        <section className={`wrap ${styles.block}`} aria-labelledby="latest-title">
          <h2 id="latest-title" className={styles.blockTitle}>
          <span>新しい記事</span>
        </h2>
          <div className={styles.latest}>
            <ArticleCard article={latest} featured />
            {rest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className={`wrap ${styles.block}`} aria-labelledby="categories-title">
        <h2 id="categories-title" className={styles.blockTitle}>
          <span>知りたいことから探す</span>
        </h2>
        <div className={styles.categories}>
          {CATEGORIES.map((c) => {
            const count = getArticlesByCategory(c.slug).length;
            return (
              <Link key={c.slug} href={`/category/${c.slug}`} className={`sticker ${styles.category}`} data-c={c.color}>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <span className={styles.count}>{count > 0 ? `${count}本の記事` : "準備中"}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
