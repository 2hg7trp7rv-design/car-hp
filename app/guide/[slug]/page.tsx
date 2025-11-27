// app/guide/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGuideBySlug,
  getAllGuides,
  type GuideItem,
} from "@/lib/guides";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const item = await getGuideBySlug(params.slug);

  if (!item) {
    return {
      title: "ガイドが見つかりません | CAR BOUTIQUE",
      description: "指定されたガイド記事が見つかりませんでした。",
    };
  }

  const description =
    item.summary ||
    "買い方・売り方・維持費・保険など、クルマとの暮らしを少し楽にするための実用ガイドです。";

  return {
    title: `${item.title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${item.title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/guide/${encodeURIComponent(
        params.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title: `${item.title} | CAR BOUTIQUE`,
      description,
    },
  };
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function mapCategoryLabel(category: GuideItem["category"]): string {
  switch (category) {
    case "MONEY":
      return "お金と維持費のこと";
    case "SELL":
      return "手放すときの心得";
    default:
      return "GUIDE";
  }
}

function splitBody(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export default async function GuideDetailPage({ params }: PageProps) {
  const item = await getGuideBySlug(params.slug);

  if (!item) {
    notFound();
  }

  const all = await getAllGuides();
  const related = getRelatedGuides(item, all);

  const dateLabel = item.publishedAt ? formatDate(item.publishedAt) : "";
  const paragraphs = splitBody(item.body);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 lg:px-0">
        {/* パンくず */}
        <Reveal>
          <nav
            className="mb-6 text-[10px] text-slate-500"
            aria-label="パンくずリスト"
          >
            <Link href="/" className="hover:text-slate-800">
              HOME
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/guide" className="hover:text-slate-800">
              GUIDE
            </Link>
            <span className="mx-1.5">/</span>
            <span className="tracking-[0.22em] text-slate-400">
              DETAIL
            </span>
          </nav>
        </Reveal>

        {/* ヘッダー */}
        <Reveal delay={80}>
          <GlassCard className="mb-8 border border-slate-200/70 bg-white/85 px-4 py-5 shadow-soft sm:px-6 sm:py-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] tracking-[0.18em] text-slate-600">
                {mapCategoryLabel(item.category)}
              </span>
              {item.readMinutes && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] tracking-[0.18em] text-slate-500">
                  約{item.readMinutes}分で読めます
                </span>
              )}
              {dateLabel && (
                <span className="ml-auto text-[10px] tracking-[0.16em] text-slate-400">
                  {dateLabel}
                </span>
              )}
            </div>
            <h1 className="serif-heading text-xl font-medium leading-relaxed text-slate-900 sm:text-2xl">
              {item.title}
            </h1>
            {item.summary && (
              <p className="mt-3 text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
                {item.summary}
              </p>
            )}
          </GlassCard>
        </Reveal>

        {/* 本文 */}
        <Reveal delay={140}>
          <GlassCard className="mb-10 border border-slate-200/70 bg-white/90 px-4 py-6 text-[13px] leading-relaxed text-slate-800 sm:px-6 sm:py-8">
            <article className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-relaxed prose-p:text-slate-700">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="mb-4">
                  {p}
                </p>
              ))}
            </article>
          </GlassCard>
        </Reveal>

        {/* Related Guides */}
        {related.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <h2 className="mb-3 text-xs font-semibold tracking-[0.22em] text-slate-600">
                RELATED GUIDES
              </h2>
            </Reveal>
            <div className="space-y-3">
              {related.map((g) => (
                <Reveal key={g.slug}>
                  <Link
                    href={`/guide/${encodeURIComponent(g.slug)}`}
                    className="block"
                  >
                    <GlassCard className="border border-slate-200/70 bg-white/90 px-4 py-3 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:px-5 sm:py-3.5">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] tracking-[0.18em] text-slate-600">
                          {mapCategoryLabel(g.category)}
                        </span>
                        {g.readMinutes && (
                          <span className="text-[9px] tracking-[0.16em] text-slate-400">
                            約{g.readMinutes}分
                          </span>
                        )}
                        {g.publishedAt && (
                          <span className="text-[9px] tracking-[0.16em] text-slate-400">
                            {formatDate(g.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {g.title}
                      </h3>
                      {g.summary && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                          {g.summary}
                        </p>
                      )}
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* 戻る導線 */}
        <Reveal>
          <div className="border-t border-slate-100 pt-4">
            <Link
              href="/guide"
              className="inline-flex items-center justify-center rounded-full border border-tiffany-400/70 bg-white/80 px-6 py-2 text-[11px] font-medium tracking-[0.18em] text-tiffany-700 shadow-soft hover:bg-white"
            >
              GUIDE 一覧へ戻る
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function getRelatedGuides(
  current: GuideItem,
  all: GuideItem[],
): GuideItem[] {
  const { slug, category, tags = [] } = current;
  const tagSet = new Set(tags);

  return all
    .filter((g) => g.slug !== slug)
    .map((g) => {
      let score = 0;
      if (g.category === category) score += 2;
      if (g.tags && g.tags.length > 0 && tagSet.size > 0) {
        const overlap = g.tags.filter((t) => tagSet.has(t)).length;
        if (overlap > 0) {
          score += 1 + overlap * 0.1;
        }
      }
      return { guide: g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.guide);
}
