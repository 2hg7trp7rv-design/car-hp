// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getNewsById,
  getLatestNews,
  getAllNews,
  type NewsItem,
} from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: {
    id: string;
  };
};

// NewsItemをローカルで少しだけ拡張して扱う
type NewsWithMeta = NewsItem & {
  tags?: string[] | null;
  maker?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
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

// SSG用:全ニュースのidから動的パスを生成
export async function generateStaticParams() {
  const all = await getAllNews();
  return all.map((item) => ({
    id: item.id,
  }));
}

// SEOメタ
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const news = (await getNewsById(params.id)) as NewsWithMeta | null;

  if (!news) {
    return {
      title: "ニュースが見つかりません | CAR BOUTIQUE",
      description: "指定されたニュース記事は見つかりませんでした。",
    };
  }

  const titleJa = news.titleJa ?? news.title;
  const description =
    news.excerpt ??
    news.comment ??
    "CAR BOUTIQUE編集部によるニュース記事です。";

  return {
    title: `${titleJa} | NEWS | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${titleJa} | NEWS | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/news/${encodeURIComponent(news.id)}`,
    },
  };
}

// 関連ニュースをざっくり拾うロジック
async function getRelatedNews(
  current: NewsWithMeta,
): Promise<NewsWithMeta[]> {
  const latest = (await getLatestNews(40)) as NewsWithMeta[];

  const currentTags: string[] = Array.isArray(current.tags)
    ? current.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const currentId = current.id;

  const withScore = latest
    .filter((item) => item.id !== currentId)
    .map((item) => {
      const itemTags: string[] = Array.isArray(item.tags)
        ? item.tags.filter((tag): tag is string => typeof tag === "string")
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
  const news = (await getNewsById(params.id)) as NewsWithMeta | null;

  if (!news) {
    notFound();
  }

  const titleJa = news.titleJa ?? news.title;
  const dateLabel = formatDate(news.publishedAt);
  const tags: string[] = Array.isArray(news.tags)
    ? news.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const related = await getRelatedNews(news);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* 上部ヒーロー＋パンくず */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
          <Reveal>
            <nav className="flex items-center text-xs text-slate-500">
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
            <GlassCard className="bg-white/80">
              <div className="space-y-5 p-4 md:p-6">
                {news.imageUrl && (
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100" />
                  // 画像は後でnext/imageに差し替え予定
                )}
                {news.comment && (
                  <div className="space-y-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {news.comment}
                  </div>
                )}
                {!news.comment && news.excerpt && (
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {news.excerpt}
                  </p>
                )}

                {news.url && (
                  <div className="pt-3">
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-medium text-tiffany-700 underline-offset-4 hover:underline"
                    >
                      元記事を開く
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="pt-4">
                    <p className="mb-1 text-[11px] font-medium tracking-[0.16em] text-slate-500">
                      TAGS
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
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

          {/* サイド:関連ニュース */}
          <aside className="space-y-4">
            <GlassCard className="bg-white/80">
              <div className="space-y-3 p-4 md:p-5">
                <h2 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  RELATED NEWS
                </h2>
                <p className="text-[11px] text-slate-500">
                  同じメーカーやカテゴリー、タグが近いニュースをピックアップしています。
                </p>
                <div className="mt-3 space-y-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${encodeURIComponent(item.id)}`}
                      className="block rounded-lg border border-slate-200/80 bg-white/60 p-3 text-xs text-slate-800 transition hover:border-tiffany-300 hover:bg-white"
                    >
                      <p className="mb-1 line-clamp-2 font-medium">
                        {item.titleJa ?? item.title}
                      </p>
                      {item.maker && (
                        <p className="text-[11px] text-slate-500">
                          {item.maker}
                        </p>
                      )}
                      {item.publishedAt && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDate(item.publishedAt)}
                        </p>
                      )}
                    </Link>
                  ))}

                  {related.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      関連ニュースはまだ登録されていません。
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
