// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getNewsById,
  getLatestNews,
  type NewsItem,
} from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const item = await getNewsById(params.id);

  if (!item) {
    return {
      title: "記事が見つかりません | CAR BOUTIQUE",
      description: "指定されたニュース記事は見つかりませんでした。",
    };
  }

  const title = item.titleJa ?? item.title;
  const description =
    item.excerpt ??
    "クルマのニュースを、要約とCAR BOUTIQUE目線のコメント付きでお届けします。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const item = await getNewsById(params.id);

  if (!item) {
    notFound();
  }

  const latest = await getLatestNews(24);
  const related = buildRelatedNews(item, latest);

  const title = item.titleJa ?? item.title;
  const published = item.publishedAtJa ?? "";
  const maker = item.maker ?? "";
  const category = item.category ?? "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-slate-800">
            NEWS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400 line-clamp-1">{title}</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8 space-y-4">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {maker && (
                <span className="rounded-full bg-white/80 px-3 py-1 tracking-[0.08em] text-slate-700">
                  {maker}
                </span>
              )}
              {category && (
                <span className="rounded-full bg-white/70 px-3 py-1 tracking-[0.08em] text-slate-600">
                  {category}
                </span>
              )}
              {item.tags &&
                item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/60 px-2 py-1 text-[10px] text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                CAR BOUTIQUE NEWS DETAIL
              </p>
              <h1 className="text-xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-2xl">
                {title}
              </h1>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {published && (
                <span className="rounded-full bg-white/80 px-3 py-1 tracking-[0.16em] text-slate-700">
                  {published}
                </span>
              )}
              {item.sourceName && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  出典 {item.sourceName}
                </span>
              )}
            </div>
          </Reveal>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
          {/* 左カラム: 本文・コメント */}
          <div className="space-y-6">
            <Reveal delay={200}>
              <GlassCard padding="lg" className="bg-white/95">
                <article className="space-y-4 text-[13px] leading-relaxed text-slate-800">
                  {item.excerpt && (
                    <p className="text-sm leading-relaxed text-slate-800">
                      {item.excerpt}
                    </p>
                  )}

                  {item.commentJa && (
                    <section className="mt-4 space-y-2">
                      <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
                        CAR BOUTIQUE COMMENT
                      </p>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">
                        {item.commentJa}
                      </p>
                    </section>
                  )}

                  {!item.commentJa && (
                    <p className="mt-4 text-[11px] text-slate-500">
                      このニュースに対するCAR BOUTIQUEとしてのコメントは、順次追加していきます。
                    </p>
                  )}
                </article>
              </GlassCard>
            </Reveal>

            {item.link && (
              <Reveal delay={260}>
                <GlassCard padding="md" className="bg-slate-950 text-slate-50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-200/90">
                        ORIGINAL ARTICLE
                      </p>
                      <p className="text-[11px] text-slate-100/90">
                        詳細な内容は、元記事で必ずご確認ください。
                      </p>
                    </div>
                    <Link
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-slate-900 transition hover:bg-white"
                    >
                      元記事を開く
                      <span className="ml-1 text-[10px]">↗</span>
                    </Link>
                  </div>
                </GlassCard>
              </Reveal>
            )}
          </div>

          {/* 右カラム: 関連ニュース・回遊 */}
          <div className="space-y-6">
            <Reveal delay={260}>
              <GlassCard padding="md" className="bg-white/95">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                    RELATED NEWS
                  </p>
                  <span className="text-[10px] text-slate-400">
                    近いトピックのニュース
                  </span>
                </div>

                {related.length === 0 && (
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    関連ニュースはまだ多くありません。
                    NEWS一覧から、同じメーカーやカテゴリのニュースも探してみてください。
                  </p>
                )}

                {related.length > 0 && (
                  <ul className="space-y-2">
                    {related.map((news) => (
                      <li key={news.id}>
                        <Link
                          href={`/news/${encodeURIComponent(news.id)}`}
                          className="group flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-900 hover:text-slate-50"
                        >
                          <p className="text-[11px] font-semibold leading-relaxed">
                            {news.titleJa ?? news.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            {news.maker && (
                              <span className="rounded-full bg-white/70 px-2 py-1 group-hover:bg-slate-800/80">
                                {news.maker}
                              </span>
                            )}
                            {news.publishedAtJa && (
                              <span className="rounded-full bg-white/60 px-2 py-1 group-hover:bg-slate-800/60">
                                {news.publishedAtJa}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </Reveal>

            <Reveal delay={300}>
              <GlassCard padding="md" className="bg-white/95">
                <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                  NEXT STEP
                </p>
                <div className="mt-3 space-y-3 text-[11px] leading-relaxed text-slate-700">
                  <p>
                    このニュースで気になったクルマがあれば、CARSページで
                    スペックや「性格」、維持していくイメージも合わせて確認できます。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/cars"
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-3 py-2 text-[11px] font-semibold tracking-[0.2em] text-slate-50 transition hover:bg-slate-700"
                    >
                      CARSページを見る
                    </Link>
                    <Link
                      href="/column"
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-900/15 bg-white px-3 py-2 text-[11px] font-medium tracking-[0.18em] text-slate-900 transition hover:border-slate-900/30 hover:bg-white"
                    >
                      コラムを読む
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}

/* 関連ニュース抽出ロジック */

function buildRelatedNews(
  current: NewsItem,
  items: NewsItem[],
): NewsItem[] {
  const maker = current.maker ?? "";
  const category = current.category ?? "";
  const id = current.id;

  return items
    .filter((item) => item.id !== id)
    .filter((item) => {
      if (maker && item.maker === maker) return true;
      if (category && item.category === category) return true;
      if (current.tags && current.tags.length > 0) {
        const set = new Set(current.tags);
        const tags = item.tags ?? [];
        if (tags.some((t) => set.has(t))) return true;
      }
      return false;
    })
    .slice(0, 5);
}
