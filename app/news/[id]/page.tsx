import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSiteUrl } from "@/lib/site";
import {
  pickExistingLocalPublicAssetPath,
  resolveOgImageUrl,
} from "@/lib/public-assets";
import {
  buildNewsDescription,
  buildNewsTitleBase,
  withBrand,
} from "@/lib/seo/serp";
import { getNewsById, getLatestNews, type NewsItem } from "@/lib/news";
import { getAllCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { getAllHeritage } from "@/lib/heritage";
import { recommendContentForNews } from "@/lib/recommendations/newsToContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ShelfImpression } from "@/components/analytics/ShelfImpression";
import { buildNewsLongform } from "@/lib/news-longform";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { isIndexableNews } from "@/lib/seo/indexability";
import { getEditorialSurfaceClass } from "@/lib/detail-theme";

// RSSなど外部取得はビルド時に依存させず、実行時 + キャッシュで安定させる
export const dynamic = "force-dynamic";
export const revalidate = 60 * 60; // 1h

type PageProps = {
  params: {
    id: string;
  };
};

type NewsWithMeta = NewsItem & {
  imageUrl?: string | null;
  sourceName?: string | null;
};

type ShelfLinkType = "cars" | "guide" | "column" | "heritage" | "news";

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatDateJa(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

function getSourceLabel(news: NewsWithMeta): string | null {
  if (news.sourceName && typeof news.sourceName === "string") {
    return news.sourceName;
  }
  if (!news.url) return null;
  try {
    const u = new URL(news.url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function toLeadText(text?: string | null, maxLen = 180): string | null {
  if (!text) return null;
  const t = String(text).replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function toShortMeta(text?: string | null, maxLen = 40): string | null {
  if (!text) return null;
  const t = String(text).replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function NewsShelfLinkCard({
  href,
  title,
  metaLeft,
  metaRight,
  toType,
  toId,
  shelfId,
}: {
  href: string;
  title: string;
  metaLeft?: string | null;
  metaRight?: string | null;
  toType: ShelfLinkType;
  toId: string;
  shelfId: string;
}) {
  return (
    <TrackedLink
      href={href}
      toType={toType}
      toId={toId}
      shelfId={shelfId}
      className="group block overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.9)] p-4 transition hover:-translate-y-[1px] hover:border-[rgba(27,63,229,0.28)] hover:bg-[rgba(251,248,243,0.98)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-semibold leading-[1.65] tracking-[-0.02em] text-[var(--text-primary)] transition group-hover:text-[var(--accent-strong)]">
            {title}
          </p>
          {(metaLeft || metaRight) ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-[1.7] text-[var(--text-tertiary)]">
              {metaLeft ? <span>{metaLeft}</span> : null}
              {metaRight ? <span>{metaRight}</span> : null}
            </div>
          ) : null}
        </div>
        <span
          aria-hidden
          className="mt-1 shrink-0 text-[var(--text-tertiary)] transition group-hover:text-[var(--accent-strong)]"
        >
          →
        </span>
      </div>
    </TrackedLink>
  );
}

// SEOメタ
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let news: NewsWithMeta | null = null;
  try {
    news = (await getNewsById(params.id)) as NewsWithMeta | null;
  } catch {
    news = null;
  }

  if (!news) {
    return {
      title: "ニュースが見つかりません",
      description: "指定されたニュース記事は見つかりませんでした。",
      robots: { index: false, follow: true },
    };
  }

  const titleBase = buildNewsTitleBase(news);
  const titleFull = withBrand(titleBase);
  const description = buildNewsDescription(news);

  const url = `${getSiteUrl()}/news/${encodeURIComponent(news.id)}`;
  const rawImage = (news.imageUrl ?? (news as any).heroImage ?? null) as string | null;
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

  return {
    title: titleBase,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: titleFull,
      description,
      type: "article",
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images: [image],
    },
    robots: isIndexableNews(news) ? undefined : NOINDEX_ROBOTS,
  };
}

async function getRelatedNews(current: NewsWithMeta): Promise<NewsWithMeta[]> {
  const latest = (await getLatestNews(40)) as NewsWithMeta[];

  const currentTags: string[] = Array.isArray(current.tags)
    ? current.tags.filter((tag: unknown): tag is string => typeof tag === "string")
    : [];

  const currentId = current.id;

  return latest
    .filter((item) => item.id !== currentId)
    .map((item) => {
      const itemTags: string[] = Array.isArray(item.tags)
        ? item.tags.filter((tag: unknown): tag is string => typeof tag === "string")
        : [];

      let score = 0;

      if (current.maker && item.maker && current.maker === item.maker) {
        score += 3;
      }

      if (current.category && item.category && current.category === item.category) {
        score += 2;
      }

      if (currentTags.length > 0 && itemTags.length > 0) {
        const tagSet = new Set(currentTags);
        const overlapCount = itemTags.filter((tag) => tagSet.has(tag)).length;
        score += overlapCount;
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => item);
}

export default async function NewsDetailPage({ params }: PageProps) {
  let news: NewsWithMeta | null = null;
  try {
    news = (await getNewsById(params.id)) as NewsWithMeta | null;
  } catch {
    news = null;
  }

  if (!news) {
    notFound();
  }

  const titleJa = news.titleJa ?? news.title;
  const leadExcerpt = toLeadText(news.excerpt, 170);
  const dateLabel = formatDate(news.publishedAt ?? news.createdAt ?? null);
  const dateLabelJa = formatDateJa(news.publishedAt ?? news.createdAt ?? null);
  const updatedLabel = formatDateJa(news.updatedAt ?? null);
  const sourceLabel = getSourceLabel(news);

  const tags: string[] = Array.isArray(news.tags)
    ? news.tags.filter((tag: unknown): tag is string => typeof tag === "string")
    : [];

  const longformSections = buildNewsLongform(news);
  const related = await getRelatedNews(news);

  const [allCars, allGuides, allColumns, allHeritage] = await Promise.all([
    getAllCars(),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
  ]);

  const recommended = recommendContentForNews(
    news,
    allCars,
    allGuides,
    allColumns,
    allHeritage,
    {
      carsLimit: 3,
      guidesLimit: 3,
      columnsLimit: 3,
      heritageLimit: 2,
    },
  );

  const pageUrl = `${getSiteUrl()}/news/${encodeURIComponent(news.id)}`;
  const description =
    news.seoDescription ??
    news.excerpt ??
    news.commentJa ??
    "CAR BOUTIQUE JOURNAL編集部によるニュース記事です。";

  const published = news.publishedAt ?? news.createdAt ?? null;
  const modified = news.updatedAt ?? published ?? null;
  const rawImage = (news.imageUrl ?? (news as any).heroImage ?? null) as string | null;
  const image = resolveOgImageUrl(rawImage, getSiteUrl());
  const safeHeroImage = pickExistingLocalPublicAssetPath(rawImage, null);

  const summaryPoints: string[] = [];
  summaryPoints.push(
    sourceLabel
      ? `一次情報は ${sourceLabel} の元記事を起点に確認。`
      : "一次情報リンクから対象範囲と条件を確認。",
  );
  summaryPoints.push(
    news.category
      ? `分類は「${news.category}」。対象範囲・時期・条件を切り分けると読みやすくなります。`
      : "対象範囲・時期・条件の順で読むと、ニュースの要点を取り違えにくくなります。",
  );
  summaryPoints.push(
    news.commentJa
      ? "編集部補足は断定を避け、確認観点を補足しています。"
      : "本文では断定を避けつつ、確認観点だけを置いています。",
  );

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ニュース",
        item: `${getSiteUrl()}/news`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: titleJa,
        item: pageUrl,
      },
    ],
  };

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: titleJa,
    description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    datePublished: published ?? undefined,
    dateModified: modified ?? undefined,
    image: image ? [image] : undefined,
    author: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
    },
  };

  return (
    <main className="detail-page">
      <DetailFixedBackground seed={news.id} imageSrc={safeHeroImage} />
      <JsonLd id="jsonld-news-detail-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-news-detail-article" data={newsArticleJsonLd} />

      <div id="top" />
      <div className="detail-shell pb-24 pt-24 sm:pt-28">
        <Breadcrumb
          tone="paper"
          items={[
            { label: "ホーム", href: "/" },
            { label: "ニュース", href: "/news" },
            { label: titleJa },
          ]}
        />

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
          <div>
            <div className="detail-photo-frame relative aspect-[16/10] w-full">
              {safeHeroImage ? (
                <Image
                  src={safeHeroImage}
                  alt={titleJa}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover saturate-[0.94]"
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(160deg,rgba(229,235,239,0.9),rgba(246,242,235,1))] p-7">
                  <div>
                    <p className="detail-kicker">ニュース</p>
                    <p className="mt-3 max-w-[15ch] text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
                      {titleJa}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="detail-chip detail-chip-accent">ニュース詳細</span>
              {news.maker ? <span className="detail-chip">{news.maker}</span> : null}
              {news.category ? <span className="detail-chip">{news.category}</span> : null}
              {dateLabelJa ? <span className="detail-chip">公開 {dateLabelJa}</span> : null}
              {updatedLabel ? <span className="detail-chip">更新 {updatedLabel}</span> : null}
            </div>

            <h1 className="page-title mt-5 max-w-[14ch]">{titleJa}</h1>

            {leadExcerpt ? (
              <p className="detail-lead mt-6 max-w-[42rem]">{leadExcerpt}</p>
            ) : null}

            <div className="mt-7 detail-inline-meta">
              {sourceLabel ? (
                <span>
                  <strong>出典</strong> {sourceLabel}
                </span>
              ) : null}
              {dateLabel ? (
                <span>
                  <strong>日付</strong> {dateLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {news.url ? (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-button"
                >
                  元記事を開く
                  <span aria-hidden>↗</span>
                </a>
              ) : null}
              <Link href="/news" className="detail-button-secondary">
                ニュース一覧へ
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_360px]">
          <section className="detail-card-wash p-6 sm:p-8" aria-label="この記事の見どころ">
            <p className="detail-kicker">要点</p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              押さえておきたい点
            </h2>
            <ul className="mt-5 space-y-5">
              {summaryPoints.map((point, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="mt-[0.55em] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(27,63,229,0.12)] text-[var(--accent-strong)] shadow-soft">
                    <span className="text-[14px] font-bold">+</span>
                  </span>
                  <p className="cb-stage-body cb-stage-body-strong flex-1">{point}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-card-muted p-6">
            <p className="detail-kicker">出典の見方</p>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
              細かな条件や適用範囲は、必ず出典ページで確認してください。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {news.url ? (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-button-secondary"
                >
                  出典を確認
                  <span aria-hidden>↗</span>
                </a>
              ) : null}
              <Link href="/news" className="detail-button-secondary">
                ニュース一覧へ
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_360px]">
          <article className="space-y-8">
            {(news.excerpt || news.commentJa || tags.length > 0) ? (
              <section className="detail-card p-6 sm:p-8">
                {news.excerpt ? (
                  <div>
                    <p className="detail-kicker">概要</p>
                    <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      ニュース概要
                    </h2>
                    <p className="mt-5 whitespace-pre-line cb-stage-body cb-stage-body-strong">
                      {news.excerpt}
                    </p>
                  </div>
                ) : null}

                {news.commentJa ? (
                  <div className={news.excerpt ? "mt-8 border-t border-[rgba(14,12,10,0.08)] pt-8" : ""}>
                    <p className="detail-kicker">補足</p>
                    <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      編集部補足
                    </h2>
                    <div className="mt-5 space-y-4 whitespace-pre-line cb-stage-body cb-stage-body-strong">
                      {news.commentJa}
                    </div>
                  </div>
                ) : null}

                {tags.length > 0 ? (
                  <div className={news.excerpt || news.commentJa ? "mt-8 border-t border-[rgba(14,12,10,0.08)] pt-8" : ""}>
                    <p className="detail-kicker">タグ</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/news?tag=${encodeURIComponent(tag)}`}
                          rel="nofollow"
                          className="detail-chip detail-chip-cobalt"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {longformSections.map((sec, idx) => (
              <section
                key={sec.id}
                id={sec.id}
                className={`${getEditorialSurfaceClass(idx)} scroll-mt-28 p-6 sm:p-8`}
              >
                <div className="cb-stage-chapterTop !p-0">
                  <p className="cb-stage-chapterLabel">
                    <span className="cb-stage-chapterNumber">{String(idx + 1).padStart(2, "0")}</span>.
                  </p>
                  <h2 className="cb-stage-chapterTitle max-w-[16ch]">{sec.title}</h2>
                </div>

                {(Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) ? (
                  <div className="mt-6 space-y-4 cb-prose">
                    {sec.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${sec.id}-p-${paragraphIndex}`}
                        className="cb-prose-block whitespace-pre-line cb-stage-body cb-stage-body-strong"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {(Array.isArray(sec.bullets) && sec.bullets.length > 0) ? (
                  <ul className="mt-6 space-y-4">
                    {sec.bullets.map((bullet, bulletIndex) => (
                      <li key={`${sec.id}-b-${bulletIndex}`} className="flex gap-3">
                        <span className="mt-[0.78em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                        <p className="cb-stage-body cb-stage-body-strong flex-1 whitespace-pre-line">
                          {bullet}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {news.url ? (
              <section className="detail-card-glow p-6 sm:p-8">
                <p className="detail-kicker">一次情報</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  一次情報へ戻る
                </h2>
                <p className="mt-4 text-[15px] leading-[1.9] text-[var(--text-secondary)]">
                  最終的な対象範囲や適用条件は、元記事側の案内を優先してください。
                  価格・時期・対象モデルの表記は途中で更新されることがあります。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-button"
                  >
                    元記事を開く
                    <span aria-hidden>↗</span>
                  </a>
                  <Link href="/news" className="detail-button-secondary">
                    ニュース一覧へ
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </section>
            ) : null}
          </article>

          <aside className="space-y-6" aria-label="関連導線">
            <section className="detail-card-muted p-6">
              <p className="detail-kicker">記事情報</p>
              <div className="mt-4 space-y-3 text-[13px] leading-[1.8] text-[var(--text-secondary)]">
                {sourceLabel ? (
                  <p>
                    <strong className="text-[var(--text-primary)]">出典</strong>
                    {" "}
                    {sourceLabel}
                  </p>
                ) : null}
                {dateLabelJa ? (
                  <p>
                    <strong className="text-[var(--text-primary)]">公開</strong>
                    {" "}
                    {dateLabelJa}
                  </p>
                ) : null}
                {updatedLabel ? (
                  <p>
                    <strong className="text-[var(--text-primary)]">更新</strong>
                    {" "}
                    {updatedLabel}
                  </p>
                ) : null}
                {news.maker ? (
                  <p>
                    <strong className="text-[var(--text-primary)]">メーカー</strong>
                    {" "}
                    {news.maker}
                  </p>
                ) : null}
                {news.category ? (
                  <p>
                    <strong className="text-[var(--text-primary)]">分類</strong>
                    {" "}
                    {news.category}
                  </p>
                ) : null}
              </div>
            </section>

            {(recommended.cars.length > 0 ||
              recommended.guides.length > 0 ||
              recommended.columns.length > 0 ||
              recommended.heritage.length > 0) ? (
              <ShelfImpression shelfId="news_recommendations" variant="recommendations">
                <section className="detail-card-fog p-6">
                  <p className="detail-kicker">関連コンテンツ</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                    このニュースの文脈に近い車種・ガイド・視点・歴史を拾っています。
                  </p>

                  {recommended.cars.length > 0 ? (
                    <div className="mt-6">
                      <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--text-primary)]">
                        車種
                      </h2>
                      <div className="mt-3 space-y-3">
                        {recommended.cars.map((car) => (
                          <NewsShelfLinkCard
                            key={car.id}
                            href={`/cars/${encodeURIComponent(car.slug)}`}
                            title={car.titleJa ?? car.name}
                            metaLeft={toShortMeta(car.maker)}
                            metaRight={formatDate(car.publishedAt)}
                            toType="cars"
                            toId={car.slug}
                            shelfId="news_recommendations"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {recommended.guides.length > 0 ? (
                    <div className="mt-6">
                      <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--text-primary)]">
                        ガイド
                      </h2>
                      <div className="mt-3 space-y-3">
                        {recommended.guides.map((guide) => (
                          <NewsShelfLinkCard
                            key={guide.id}
                            href={`/guide/${encodeURIComponent(guide.slug)}`}
                            title={guide.titleJa ?? guide.title}
                            metaLeft={toShortMeta(guide.category)}
                            metaRight={formatDate(guide.publishedAt)}
                            toType="guide"
                            toId={guide.slug}
                            shelfId="news_recommendations"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {recommended.columns.length > 0 ? (
                    <div className="mt-6">
                      <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--text-primary)]">
                        視点
                      </h2>
                      <div className="mt-3 space-y-3">
                        {recommended.columns.map((column) => (
                          <NewsShelfLinkCard
                            key={column.id}
                            href={`/column/${encodeURIComponent(column.slug)}`}
                            title={column.titleJa ?? column.title}
                            metaLeft={toShortMeta(column.category)}
                            metaRight={formatDate(column.publishedAt)}
                            toType="column"
                            toId={column.slug}
                            shelfId="news_recommendations"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {recommended.heritage.length > 0 ? (
                    <div className="mt-6">
                      <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--text-primary)]">
                        系譜
                      </h2>
                      <div className="mt-3 space-y-3">
                        {recommended.heritage.map((heritage) => (
                          <NewsShelfLinkCard
                            key={heritage.id}
                            href={`/heritage/${encodeURIComponent(heritage.slug)}`}
                            title={(heritage as any).heroTitle ?? heritage.titleJa ?? heritage.title}
                            metaLeft={toShortMeta((heritage as any).brandName ?? heritage.maker ?? null)}
                            metaRight={formatDate(heritage.publishedAt)}
                            toType="heritage"
                            toId={heritage.slug}
                            shelfId="news_recommendations"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              </ShelfImpression>
            ) : null}

            <ShelfImpression shelfId="news_related_news" variant="related_news">
              <section className="detail-card p-6">
                <p className="detail-kicker">関連ニュース</p>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                  同じメーカーやカテゴリー、タグが近いニュースを拾っています。
                </p>

                <div className="mt-5 space-y-3">
                  {related.length > 0 ? (
                    related.map((item) => (
                      <NewsShelfLinkCard
                        key={item.id}
                        href={`/news/${encodeURIComponent(item.id)}`}
                        title={item.titleJa ?? item.title}
                        metaLeft={toShortMeta(item.maker)}
                        metaRight={formatDate(item.publishedAt)}
                        toType="news"
                        toId={item.id}
                        shelfId="news_related_news"
                      />
                    ))
                  ) : (
                    <p className="text-[13px] leading-relaxed text-[var(--text-tertiary)]">
                      関連ニュースはまだ登録されていません。
                    </p>
                  )}
                </div>
              </section>
            </ShelfImpression>
          </aside>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="#top" className="detail-button-secondary">
            TOPへ戻る <span aria-hidden>↑</span>
          </Link>
          <Link href="/news" className="detail-button">
            ニュース一覧へ <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
