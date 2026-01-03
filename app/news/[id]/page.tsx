// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site";

import {
  getNewsById,
  getLatestNews,
  type NewsItem,
} from "@/lib/news";
import { getAllCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { recommendContentForNews } from "@/lib/recommendations/newsToContent";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ShelfImpression } from "@/components/analytics/ShelfImpression";

// RSSなど外部取得はビルド時に依存させず、実行時 + キャッシュで安定させる
export const dynamic = "force-dynamic";
export const revalidate = 60 * 60; // 1h

type PageProps = {
  params: {
    id: string;
  };
};

// Domain層のNewsItemをベースに、画面用の追加フィールドだけ拡張
type NewsWithMeta = NewsItem & {
  imageUrl?: string | null;
  sourceName?: string | null;
};

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
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


// SEOメタ
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  let news: NewsWithMeta | null = null;
  try {
    news = (await getNewsById(params.id)) as NewsWithMeta | null;
  } catch {
    news = null;
  }

  if (!news) {
    return {
      title: "ニュースが見つかりません | CAR BOUTIQUE",
      description: "指定されたニュース記事は見つかりませんでした。",
    };
  }

  const titleJa = news.titleJa ?? news.title;
  const description =
    news.seoDescription ??
    news.excerpt ??
    news.commentJa ??
    "CAR BOUTIQUE編集部によるニュース記事です。";

  const url = `${getSiteUrl()}/news/${encodeURIComponent(news.id)}`;

  const rawImage = (news.imageUrl ?? (news as any).heroImage ?? null) as string | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  return {
    title: `${titleJa} | NEWS | CAR BOUTIQUE`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${titleJa} | NEWS | CAR BOUTIQUE`,
      description,
      type: "article",
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleJa} | NEWS | CAR BOUTIQUE`,
      description,
      images: [image],
    },
  };
}

// 関連ニュースをざっくり拾うロジック
async function getRelatedNews(
  current: NewsWithMeta,
): Promise<NewsWithMeta[]> {
  const latest = (await getLatestNews(40)) as NewsWithMeta[];

  const currentTags: string[] = Array.isArray(current.tags)
    ? current.tags.filter(
        (tag: unknown): tag is string => typeof tag === "string",
      )
    : [];

  const currentId = current.id;

  const withScore = latest
    .filter((item) => item.id !== currentId)
    .map((item) => {
      const itemTags: string[] = Array.isArray(item.tags)
        ? item.tags.filter(
            (tag: unknown): tag is string => typeof tag === "string",
          )
        : [];

      let score = 0;

      // メーカー一致
      if (current.maker && item.maker && current.maker === item.maker) {
        score += 3;
      }

      // カテゴリー一致
      if (
        current.category &&
        item.category &&
        current.category === item.category
      ) {
        score += 2;
      }

      // タグの重なり数
      if (currentTags.length && itemTags.length) {
        const set = new Set(currentTags);
        const overlapCount = itemTags.filter((t: string) => set.has(t)).length;
        score += overlapCount;
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => item);

  return withScore;
}

// Pageコンポーネント本体
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
  const dateLabel = formatDate(news.publishedAt);
  const sourceLabel = getSourceLabel(news);

  const tags: string[] = Array.isArray(news.tags)
    ? news.tags.filter(
        (tag: unknown): tag is string => typeof tag === "string",
      )
    : [];

  const related = await getRelatedNews(news);

  const [allCars, allGuides] = await Promise.all([getAllCars(), getAllGuides()]);
  const recommended = recommendContentForNews(news, allCars, allGuides, {
    carsLimit: 3,
    guidesLimit: 3,
  });

  const pageUrl = `${getSiteUrl()}/news/${encodeURIComponent(news.id)}`;
  const description =
    news.seoDescription ??
    news.excerpt ??
    news.commentJa ??
    "CAR BOUTIQUE編集部によるニュース記事です。";

  const published = news.publishedAt ?? news.createdAt ?? null;
  const modified = news.updatedAt ?? published ?? null;

  const rawImage = (news.imageUrl ?? (news as any).heroImage ?? null) as string | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "NEWS",
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
      name: "CAR BOUTIQUE",
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE",
    },
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <JsonLd id="jsonld-news-detail-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-news-detail-article" data={newsArticleJsonLd} />
      {/* 上部ヒーロー＋パンくず */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
          <Reveal>
            <nav
              className="flex items-center text-xs text-slate-500"
              aria-label="パンくずリスト"
            >
              <Link href="/" className="hover:text-slate-800">
                HOME
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <Link href="/news" className="hover:text-slate-800">
                NEWS
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="line-clamp-1 text-slate-400">DETAIL</span>
            </nav>
          </Reveal>

          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  EDITOR&apos;S PICK NEWS
                </p>
                <h1 className="text-xl font-semibold tracking-wide text-slate-900 md:text-2xl">
                  {titleJa}
                </h1>
                {news.excerpt && (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {news.excerpt}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 text-xs text-slate-500 md:items-end">
                {dateLabel && (
                  <p className="font-medium text-slate-600">{dateLabel}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {news.maker && (
                    <span className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-slate-700">
                      {news.maker}
                    </span>
                  )}
                  {news.category && (
                    <span className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] tracking-[0.08em] text-slate-700">
                      {news.category}
                    </span>
                  )}
                  {sourceLabel && (
                    <span className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] tracking-[0.08em] text-slate-600">
                      SOURCE {sourceLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文＋サイド */}
      <section className="border-b border-slate-200 bg-slate-100/80">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:py-10">
          {/* 本文 */}
          <div className="space-y-6">
            <GlassCard className="bg-white/90">
              <div className="space-y-6 p-4 md:p-6">
                {news.imageUrl && (
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
                    {/* 画像は後でnext/imageに差し替え予定 */}
                  </div>
                )}

                {/* ニュース概要ブロック（excerpt優先） */}
                {news.excerpt && (
                  <section className="space-y-2">
                    <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-500">
                      ニュース概要
                    </h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {news.excerpt}
                    </p>
                  </section>
                )}

                {/* 編集部コメント（commentJa） */}
                {news.commentJa && (
                  <section className="space-y-2 border-t border-slate-100 pt-4">
                    <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-500">
                      CAR BOUTIQUE編集部コメント
                    </h2>
                    <div className="space-y-3 whitespace-pre-line text-[13px] leading-relaxed text-slate-700 md:text-sm">
                      {news.commentJa}
                    </div>
                  </section>
                )}

                {/* 元記事リンク＋出典 */}
                {news.url && (
                  <section className="border-t border-slate-100 pt-4 text-xs">
                    <p className="mb-1 text-[11px] font-medium tracking-[0.12em] text-slate-500">
                      元記事・出典
                    </p>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-50 underline-offset-4 hover:bg-slate-800"
                    >
                      元記事を開く
                      <span className="text-[10px]">↗</span>
                    </a>
                    {sourceLabel && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        出典:{sourceLabel}
                      </p>
                    )}
                  </section>
                )}

                {/* タグ */}
                {tags.length > 0 && (
                  <section className="border-t border-slate-100 pt-4">
                    <p className="mb-1 text-[11px] font-medium tracking-[0.16em] text-slate-500">
                      TAGS
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/news?tag=${encodeURIComponent(tag)}`}
                          className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-700 hover:border-tiffany-400 hover:bg-white"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </GlassCard>

            <div className="flex justify-start pt-2">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[11px]">
                  ←
                </span>
                NEWS一覧に戻る
              </Link>
            </div>
          </div>

          {/* サイド: 関連ニュース */}
          <aside className="space-y-4" aria-label="関連ニュース">
            {(recommended.cars.length > 0 || recommended.guides.length > 0) && (
              <ShelfImpression
                shelfId="news_recommendations"
                variant="recommendations"
              >
                <GlassCard className="bg-white/90">
                  <div className="space-y-3 p-4 md:p-5">
                    <h2 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                      CAR BOUTIQUE LINKS
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      ニュース内容に近いCARS / GUIDEをピックアップしています。
                    </p>

                    {recommended.cars.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium tracking-[0.14em] text-slate-500">
                          CARS
                        </p>
                        <div className="space-y-2">
                          {recommended.cars.map((car) => (
                            <TrackedLink
                              key={car.id}
                              href={`/cars/${encodeURIComponent(car.slug)}`}
                              toType="cars"
                              toId={car.slug}
                              shelfId="news_recommendations"
                              className="block rounded-lg border border-slate-200/80 bg-white/70 p-3 text-xs text-slate-800 transition hover:border-tiffany-300 hover:bg-white"
                            >
                              <p className="mb-1 line-clamp-2 font-medium">
                                {car.titleJa ?? car.name}
                              </p>
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                {car.maker && (
                                  <p className="text-[11px] text-slate-500">
                                    {car.maker}
                                  </p>
                                )}
                                {car.publishedAt && (
                                  <p className="text-[11px] text-slate-400">
                                    {formatDate(car.publishedAt)}
                                  </p>
                                )}
                              </div>
                            </TrackedLink>
                          ))}
                        </div>
                      </div>
                    )}

                    {recommended.guides.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium tracking-[0.14em] text-slate-500">
                          GUIDE
                        </p>
                        <div className="space-y-2">
                          {recommended.guides.map((g) => (
                            <TrackedLink
                              key={g.id}
                              href={`/guide/${encodeURIComponent(g.slug)}`}
                              toType="guide"
                              toId={g.slug}
                              shelfId="news_recommendations"
                              className="block rounded-lg border border-slate-200/80 bg-white/70 p-3 text-xs text-slate-800 transition hover:border-tiffany-300 hover:bg-white"
                            >
                              <p className="mb-1 line-clamp-2 font-medium">
                                {g.titleJa ?? g.title}
                              </p>
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                {g.category && (
                                  <p className="text-[11px] text-slate-500">
                                    {g.category}
                                  </p>
                                )}
                                {g.publishedAt && (
                                  <p className="text-[11px] text-slate-400">
                                    {formatDate(g.publishedAt)}
                                  </p>
                                )}
                              </div>
                            </TrackedLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </ShelfImpression>
            )}

            <ShelfImpression shelfId="news_related_news" variant="related_news">
              <GlassCard className="bg-white/90">
                <div className="space-y-3 p-4 md:p-5">
                  <h2 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                    RELATED NEWS
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    同じメーカーやカテゴリー タグが近いニュースをピックアップしています。
                  </p>
                  <div className="mt-3 space-y-3">
                    {related.map((item) => (
                      <TrackedLink
                        key={item.id}
                        href={`/news/${encodeURIComponent(item.id)}`}
                        toType="news"
                        toId={item.id}
                        shelfId="news_related_news"
                        className="block rounded-lg border border-slate-200/80 bg-white/70 p-3 text-xs text-slate-800 transition hover:border-tiffany-300 hover:bg-white"
                      >
                        <p className="mb-1 line-clamp-2 font-medium">
                          {item.titleJa ?? item.title}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          {item.maker && (
                            <p className="text-[11px] text-slate-500">
                              {item.maker}
                            </p>
                          )}
                          {item.publishedAt && (
                            <p className="text-[11px] text-slate-400">
                              {formatDate(item.publishedAt)}
                            </p>
                          )}
                        </div>
                      </TrackedLink>
                    ))}

                    {related.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        関連ニュースはまだ登録されていません。
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </ShelfImpression>
          </aside>
        </div>
      </section>
    </main>
  );
}
