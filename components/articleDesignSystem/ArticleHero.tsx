import type { CSSProperties } from "react";

import { ArticleIcon } from "@/components/articleDesignSystem/icons";
import type { ArticleViewModel } from "@/types/article-design-system";

import styles from "@/components/articleDesignSystem/article-design-system.module.css";

const JUNA_IMAGE = "/images/cbj/article-system/juna-avatar.webp";
const RINA_IMAGE = "/images/cbj/article-system/rina-avatar.webp";
const CAR_IMAGE = "/images/cbj/article-system/car-illustration-transparent-v2.png";
const DEFAULT_GRADIENT = ["#006E6B", "#004F4D"] as const;
const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");

export function ArticleHero({ article, kind }: { article: ArticleViewModel; kind: "COLUMN" | "GUIDE" }) {
  const design = article.articleDesign;
  const [from, to] = design?.heroGradient?.length === 2 ? design.heroGradient : DEFAULT_GRADIENT;
  const lesson = design?.lessonNumber ? `Lesson ${String(design.lessonNumber).padStart(2, "0")}` : kind === "COLUMN" ? "COLUMN" : "GUIDE";
  const difficulty = design?.difficulty || (kind === "COLUMN" ? "初級〜中級" : "実用ガイド");
  const heroStyle = { "--hero-from": from, "--hero-to": to } as CSSProperties;
  const heroLead = design?.heroLead?.trim() || null;

  return (
    <section className={styles.hero} style={heroStyle}>
      <div className={styles.plusPattern} />
      <span className={cx(styles.heroCircle, styles.heroCircleOne)} />
      <span className={cx(styles.heroCircle, styles.heroCircleTwo)} />
      <span className={cx(styles.heroCircle, styles.heroCircleThree)} />
      <span className={cx(styles.heroCircle, styles.heroCircleFour)} />
      <div className={styles.heroInner}>
        <div className={styles.heroCharacters} aria-hidden="true">
          <div className={cx(styles.heroAvatar, styles.heroFloat)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={JUNA_IMAGE} alt="" width={192} height={192} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={cx(styles.heroCar, styles.heroFloatSlow)} src={design?.heroCenterImage || CAR_IMAGE} alt="" width={160} height={120} />
          <div className={cx(styles.heroAvatar, styles.heroFloat, styles.heroAvatarDelay)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={RINA_IMAGE} alt="" width={192} height={192} />
          </div>
        </div>
        <p className={styles.lessonLabel}>{lesson}</p>
        <h1>{design?.heroTitle || article.title}</h1>
        {heroLead ? <p className={styles.heroLead}>{heroLead}</p> : null}
        {design?.heroPromise ? (
          <p className={styles.heroPromise}>
            <strong>この記事で判断できること：</strong>
            <span>{design.heroPromise}</span>
          </p>
        ) : null}
        <div className={styles.heroMeta}>
          <span><ArticleIcon name="clock" />{article.readMinutes ? `${article.readMinutes} min read` : "読みもの"}</span>
          <i />
          <span>{difficulty}</span>
          <i />
          <span>{kind}</span>
        </div>
      </div>
      <div className={styles.scrollGuide} aria-hidden="true">
        <span>スクロールして読む</span>
        <div><i /></div>
      </div>
    </section>
  );
}
