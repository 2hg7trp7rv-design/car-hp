// app/heritage/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllHeritage,
  getHeritageBySlug,
  type HeritageItem,
} from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(iso?: string | null): string | null {
  const d = parseDate(iso ?? null);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function sortWithinMaker(items: HeritageItem[]): HeritageItem[] {
  return [...items].sort((a, b) => {
    const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
    const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);
    if (ad && bd) return ad.getTime() - bd.getTime();
    if (bd && !ad) return 1;
    if (ad && !bd) return -1;
    return (a.title ?? "").localeCompare(b.title ?? "");
  });
}

function findNeighbors(
  chain: HeritageItem[],
  currentSlug: string,
): { prev: HeritageItem | null; next: HeritageItem | null } {
  const index = chain.findIndex((item) => item.slug === currentSlug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  const prev = index > 0 ? chain[index - 1] : null;
  const next = index < chain.length - 1 ? chain[index + 1] : null;
  return { prev, next };
}

// SSG用: 全HERITAGEのslugから動的パスを生成
export async function generateStaticParams() {
  const items = await getAllHeritage();
  return items.map((item) => ({
    slug: item.slug,
  }));
}

// SEOメタ
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    return {
      title: "HERITAGEが見つかりません | CAR BOUTIQUE",
      description: "指定されたHERITAGEの記事は見つかりませんでした。",
    };
  }

  const title = heritage.titleJa ?? heritage.title ?? heritage.slug;
  const description =
    heritage.summary ??
    heritage.body ??
    "ブランドの系譜や名車の歴史を振り返るHERITAGEコンテンツです。";

  return {
    title: `${title} | HERITAGE | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | HERITAGE | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/heritage/${encodeURIComponent(
        heritage.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title: `${title} | HERITAGE | CAR BOUTIQUE`,
      description,
    },
  };
}

// Page本体
export default async function HeritageDetailPage({ params }: PageProps) {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    notFound();
  }

  const all = await getAllHeritage();
  const sameMaker = sortWithinMaker(
    all.filter(
      (item) =>
        item.maker &&
        heritage.maker &&
        item.maker === heritage.maker,
    ),
  );

  const { prev, next } = findNeighbors(sameMaker, heritage.slug);

  const dateLabel =
    formatDateLabel(heritage.publishedAt) ??
    formatDateLabel(heritage.updatedAt);
  const tags = heritage.tags ?? [];

  const title = heritage.titleJa ?? heritage.title ?? heritage.slug;

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* ページ専用の光レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[42vh] bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="absolute -left-[22%] top-[18%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[18%] bottom-[-12%] h-[52vw] w-[52vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.26),_transparent_75%)] blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ヒーロー */}
        <section className="border-b border-slate-100/70 bg-gradient-to-b from-white/90 via-vapor/70 to-transparent">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
            <Reveal>
              <nav className="flex items-center text-xs text-slate-500">
                <Link href="/" className="hover:text-slate-800">
                  HOME
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <Link href="/heritage" className="hover:text-slate-800">
                  HERITAGE
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="line-clamp-1 text-slate-400">
                  {title}
                </span>
              </nav>
            </Reveal>

            <Reveal>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-1.5 text-[10px] font-semibold tracking-[0.26em] text-slate-500 shadow-soft">
                    <span className="h-[1px] w-6 bg-gradient-to-r from-tiffany-400 to-slate-400" />
                    BRAND HERITAGE
                    <span className="h-[1px] w-6 bg-slate-200" />
                  </div>

                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-[2.3rem]">
                    {title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    {heritage.maker && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 font-semibold uppercase tracking-[0.18em] text-slate-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                        {heritage.maker}
                      </span>
                    )}
                    {heritage.modelName && (
                      <span className="rounded-full border border-tiffany-200 bg-tiffany-50/80 px-3 py-1 text-[11px] font-medium text-tiffany-800">
                        {heritage.modelName}
                      </span>
                    )}
                    {heritage.eraLabel && (
                      <span className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-[11px] text-slate-600">
                        {heritage.eraLabel}
                      </span>
                    )}
                    {dateLabel && (
                      <>
                        <span className="h-[1px] w-6 bg-slate-200" />
                        <span className="text-[11px] text-slate-400">
                          {dateLabel} 更新
                        </span>
                      </>
                    )}
                  </div>

                  {heritage.summary && (
                    <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                      {heritage.summary}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 本文＋前後リンク */}
        <section className="border-b border-slate-100/70 pb-14 pt-6 sm:pb-18 sm:pt-8">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:px-8">
            {/* 本文 */}
            <div className="space-y-6">
              <GlassCard className="border border-slate-200/80 bg-gradient-to-br from-white/92 via-vapor/90 to-white/95 shadow-soft">
                <article className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                  {/* 導入ボックス */}
                  <div className="rounded-2xl bg-slate-50/90 px-4 py-3 text-[11px] text-slate-600">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      MODEL HERITAGE OUTLINE
                    </p>
                    <p className="mt-1 leading-relaxed">
                      このHERITAGEは、「
                      <span className="font-semibold text-slate-800">
                        {heritage.modelName ?? title}
                      </span>
                      」がどの時代にどんな役割を担ったのかを、
                      ブランドの系譜の中で振り返るための読み物です。
                    </p>
                  </div>

                  {/* 本文 */}
                  {heritage.body && (
                    <div className="whitespace-pre-line text-sm leading-8 text-slate-700 sm:text-[15px] sm:leading-[2rem]">
                      {heritage.body}
                    </div>
                  )}
                  {!heritage.body && heritage.summary && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                      {heritage.summary}
                    </p>
                  )}

                  {/* タグ */}
                  {tags.length > 0 && (
                    <div className="pt-4">
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                        TAGS
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-300 bg-slate-50/90 px-2.5 py-0.5 text-[11px] text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </GlassCard>

              {/* 戻る＆前後ナビ */}
              <div className="flex flex-col gap-3 pt-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/heritage"
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 underline-offset-4 hover:text-tiffany-700 hover:underline"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-[11px]">
                      ←
                    </span>
                    HERITAGE一覧に戻る
                  </Link>
                </div>

                {(prev || next) && (
                  <div className="flex flex-col gap-2 pt-1 text-xs text-slate-600 md:flex-row md:justify-between">
                    {prev ? (
                      <Link
                        href={`/heritage/${encodeURIComponent(prev.slug)}`}
                        className="inline-flex max-w-xs flex-col gap-1 border border-slate-200 bg-white/85 px-3 py-2 text-left shadow-sm transition hover:border-tiffany-300 hover:bg-white"
                      >
                        <span className="text-[10px] text-slate-500">
                          PREVIOUS
                        </span>
                        <span className="line-clamp-2 text-[12px] font-medium text-slate-800">
                          {prev.titleJa ?? prev.title}
                        </span>
                      </Link>
                    ) : (
                      <span />
                    )}

                    {next ? (
                      <Link
                        href={`/heritage/${encodeURIComponent(next.slug)}`}
                        className="inline-flex max-w-xs flex-col items-end gap-1 border border-slate-200 bg-white/85 px-3 py-2 text-right shadow-sm transition hover:border-tiffany-300 hover:bg-white"
                      >
                        <span className="text-[10px] text-slate-500">
                          NEXT
                        </span>
                        <span className="line-clamp-2 text-[12px] font-medium text-slate-800">
                          {next.titleJa ?? next.title}
                        </span>
                      </Link>
                    ) : (
                      <span />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右カラム: 同一ブランドの案内ボックス（将来拡張用） */}
            <aside className="space-y-4">
              <GlassCard className="border border-slate-200/80 bg-white/90 shadow-sm">
                <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
                  <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                    SAME BRAND LINEUP
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    同じメーカーのHERITAGEは、一覧ページから
                    年代順にたどれるようになっています。
                    <br />
                    少し間をおいてから、他の世代と続けて読むと
                    ブランドのキャラクターの変遷が見えやすくなります。
                  </p>
                  {heritage.maker && (
                    <p className="text-[11px] text-slate-500">
                      現在表示中のブランド:
                      <span className="ml-1 font-semibold text-slate-800">
                        {heritage.maker}
                      </span>
                    </p>
                  )}
                </div>
              </GlassCard>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
