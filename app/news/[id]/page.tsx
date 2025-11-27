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
    };
  }

  const title = item.titleJa ?? item.title;
  const description =
    item.excerpt ??
    "クルマのニュースと、その先にある物語を届ける CAR BOUTIQUE のニュース詳細ページです。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: item.url,
    },
  };
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const item = await getNewsById(params.id);

  if (!item) {
    notFound();
  }

  const related = await getRelatedNews(item);

  const title = item.titleJa ?? item.title;
  const dateLabel =
    item.publishedAtJa ??
    formatDate(item.publishedAt ?? item.createdAt);

  const sourceDomain = item.url
    ? (() => {
        try {
          const u = new URL(item.url);
          return u.hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* パンくず */}
      <Reveal>
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-[10px] text-slate-400"
        >
          <Link
            href="/news"
            className="tracking-[0.22em] text-slate-400 transition hover:text-slate-700"
          >
            NEWS
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="tracking-[0.22em] text-slate-500">
            DETAIL
          </span>
        </nav>
      </Reveal>

      {/* 本文カード */}
      <Reveal>
        <GlassCard className="mb-8 border border-slate-200/70 bg-white/80 px-4 py-4 shadow-sm sm:px-6 sm:py-6">
          <header className="mb-5 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
              {item.sourceName && (
                <span className="tracking-[0.18em]">
                  {item.sourceName}
                </span>
              )}
              {item.maker && (
                <>
                  <span className="h-[1px] w-4 bg-slate-200" />
                  <span className="tracking-[0.18em]">
                    {item.maker}
                  </span>
                </>
              )}
              {item.category && (
                <>
                  <span className="h-[1px] w-4 bg-slate-200" />
                  <span className="tracking-[0.18em]">
                    {item.category}
                  </span>
                </>
              )}
              {dateLabel && (
                <>
                  <span className="h-[1px] w-4 bg-slate-200" />
                  <span className="tracking-[0.18em]">
                    {dateLabel}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-serif text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h1>
            {item.title !== title && (
              <p className="text-[11px] text-slate-400">
                原題: {item.title}
              </p>
            )}
          </header>

          {/* 要約 */}
          {item.excerpt && (
            <section className="mb-5 border-l border-tiffany-100 bg-slate-50/80 px-4 py-3 text-[12px] leading-relaxed text-slate-700">
              <h2 className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-tiffany-700">
                SUMMARY
              </h2>
              <p>{item.excerpt}</p>
            </section>
          )}

          {/* CAR BOUTIQUE の視点 */}
          {item.commentJa && (
            <section className="mb-5 rounded-2xl bg-slate-900/90 px-4 py-3 text-[11px] leading-relaxed text-slate-100">
              <h2 className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-tiffany-200">
                CAR BOUTIQUE&apos;S NOTE
              </h2>
              <p>{item.commentJa}</p>
            </section>
          )}

          {/* タグ + 出典リンク */}
          <div className="mt-4 flex flex-col gap-3 text-[11px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {item.tags &&
                item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] tracking-[0.14em] text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {item.url && item.url !== "#" && (
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white transition hover:bg-slate-800"
                >
                  元記事を読む
                  {sourceDomain && (
                    <span className="text-[9px] text-slate-300">
                      ({sourceDomain})
                    </span>
                  )}
                  <span className="text-[9px] text-slate-200">↗</span>
                </Link>
              )}
            </div>
          </div>
        </GlassCard>
      </Reveal>

      {/* 関連ニュース */}
      {related.length > 0 && (
        <section className="mt-10">
          <Reveal>
            <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-500">
              RELATED NEWS
            </h2>
          </Reveal>
          <div className="space-y-2">
            {related.map((r) => (
              <Reveal key={r.id}>
                <Link
                  href={`/news/${encodeURIComponent(r.id)}`}
                  className="block"
                >
                  <article className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                    <div className="flex-1">
                      <p className="line-clamp-2 font-medium tracking-[0.06em] text-slate-900">
                        {r.titleJa ?? r.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        {r.sourceName && (
                          <span className="tracking-[0.16em]">
                            {r.sourceName}
                          </span>
                        )}
                        {r.maker && (
                          <>
                            <span className="h-[1px] w-4 bg-slate-200" />
                            <span className="tracking-[0.16em]">
                              {r.maker}
                            </span>
                          </>
                        )}
                        {(() => {
                          const relatedDate =
                            r.publishedAtJa ??
                            formatDate(
                              r.publishedAt ?? r.createdAt,
                            );
                          if (!relatedDate) return null;
                          return (
                            <>
                              <span className="h-[1px] w-4 bg-slate-200" />
                              <span className="tracking-[0.16em]">
                                {relatedDate}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="hidden pl-3 text-[9px] font-semibold tracking-[0.24em] text-slate-300 transition group-hover:text-tiffany-500 sm:block">
                      READ
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

async function getRelatedNews(
  current: NewsItem,
): Promise<NewsItem[]> {
  const items = await getLatestNews(80);
  const { id, maker, category, tags: currentTags } = current;

  return items
    .filter((item) => item.id !== id)
    .filter((item) => {
      if (maker && item.maker === maker) return true;
      if (category && item.category === category) return true;
      if (currentTags && currentTags.length > 0) {
        const set = new Set(currentTags);
        const itemTags = item.tags ?? [];
        if (itemTags.some((t) => set.has(t))) return true;
      }
      return false;
    })
    .slice(0, 5);
}
