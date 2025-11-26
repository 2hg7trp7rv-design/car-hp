// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, getAllCars, type CarItem } from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種は見つかりませんでした。",
    };
  }

  const title = car.name ?? "CARS DETAIL";
  const description =
    car.summary ??
    "スペックだけでなく、そのクルマの性格や付き合い方まで含めて整理するCAR BOUTIQUEのCARSページ。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const allCars = await getAllCars();
  const latestNews = await getLatestNews(40);

  const title = car.name ?? car.slug;
  const yearLabel = car.releaseYear ? `${car.releaseYear}年頃` : null;

  const relatedCars = buildRelatedCars(car, allCars);
  const filteredNews = buildRelatedNews(car, latestNews);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{title}</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-4">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {car.maker && (
                <span className="rounded-full bg-white/70 px-3 py-1 tracking-[0.08em] text-slate-700">
                  {car.maker}
                </span>
              )}
              {yearLabel && (
                <span className="rounded-full bg-white/60 px-3 py-1 tracking-[0.08em] text-slate-600">
                  登場は{yearLabel}
                </span>
              )}
              {car.bodyType && (
                <span className="rounded-full bg-white/50 px-3 py-1 tracking-[0.08em] text-slate-600">
                  {car.bodyType}
                </span>
              )}
              {car.segment && (
                <span className="rounded-full bg-white/40 px-3 py-1 tracking-[0.08em] text-slate-600">
                  {car.segment}
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                CAR BOUTIQUE CARS DETAIL
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              {car.summary && (
                <p className="max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">
                  {car.summary}
                </p>
              )}
            </div>
          </Reveal>
        </header>

        {/* メイン: 性格＋スペック */}
        <Reveal delay={140}>
          <section className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* 左: 性格・長文・関連ニュース */}
            <div className="space-y-6">
              {car.summaryLong && (
                <GlassCard padding="lg" className="bg-white/95">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
                      CHARACTER
                    </p>
                    <p className="text-sm leading-relaxed text-slate-800 sm:text-[15px]">
                      {car.summaryLong}
                    </p>
                  </div>
                </GlassCard>
              )}

              {filteredNews.length > 0 && (
                <GlassCard padding="md" className="bg-slate-950 text-slate-50">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-200/90">
                      RELATED NEWS
                    </p>
                    <span className="text-[10px] text-slate-300/90">
                      このクルマに関連する最近のニュース
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {filteredNews.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/news/${encodeURIComponent(item.id)}`}
                          className="group flex flex-col gap-1 rounded-xl bg-slate-900/50 px-3 py-2 transition hover:bg-slate-900/80"
                        >
                          <p className="text-[11px] font-semibold leading-relaxed text-slate-50">
                            {item.titleJa ?? item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-300/90">
                            {item.maker && (
                              <span className="rounded-full bg-slate-100/10 px-2 py-1">
                                {item.maker}
                              </span>
                            )}
                            {item.publishedAtJa && (
                              <span className="rounded-full bg-slate-100/5 px-2 py-1">
                                {item.publishedAtJa}
                              </span>
                            )}
                            {item.sourceName && (
                              <span className="underline decoration-slate-400/60 underline-offset-2">
                                {item.sourceName}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>

            {/* 右: スペック・所有難易度など */}
            <div className="space-y-4">
              <GlassCard padding="md" className="bg-white/95">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                    SPECIFICATION
                  </p>
                  {car.grade && (
                    <span className="rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-slate-50">
                      {car.grade}
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-[11px] text-slate-700 sm:grid-cols-2">
                  {car.engine && (
                    <SpecRow label="エンジン" value={car.engine} />
                  )}
                  {car.powerPs && (
                    <SpecRow label="最高出力" value={`${car.powerPs}ps前後`} />
                  )}
                  {car.torqueNm && (
                    <SpecRow label="最大トルク" value={`${car.torqueNm}Nm前後`} />
                  )}
                  {car.transmission && (
                    <SpecRow label="トランスミッション" value={car.transmission} />
                  )}
                  {car.drive && (
                    <SpecRow label="駆動方式" value={car.drive} />
                  )}
                  {car.fuel && <SpecRow label="燃料" value={car.fuel} />}
                </dl>
              </GlassCard>

              <GlassCard padding="md" className="bg-white/95">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                    POSITION &amp; OWNERSHIP
                  </p>
                </div>
                <dl className="space-y-2 text-[11px] text-slate-700">
                  {car.segment && (
                    <SpecRow label="ポジション" value={car.segment} />
                  )}
                  {car.difficulty && (
                    <SpecRow
                      label="所有の難易度"
                      value={formatDifficulty(car.difficulty)}
                    />
                  )}
                  {car.bodyType && (
                    <SpecRow label="ボディタイプ" value={car.bodyType} />
                  )}
                </dl>
                {car.tags && car.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 text-[10px] text-slate-500">
                    {car.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* 関連CARS */}
        {relatedCars.length > 0 && (
          <Reveal delay={220}>
            <section className="mb-12">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-600">
                  RELATED CARS
                </h2>
                <span className="text-[11px] text-slate-400">
                  同じメーカーやキャラクターのクルマを、もう少しだけ覗いてみる
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedCars.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/cars/${encodeURIComponent(c.slug)}`}
                  >
                    <GlassCard
                      as="article"
                      padding="sm"
                      interactive
                      className="h-full bg-white/95"
                    >
                      <div className="flex h-full flex-col gap-2 text-[11px] text-slate-700">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                          {c.maker}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {c.name}
                        </p>
                        {c.summary && (
                          <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                            {c.summary}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          {c.segment && (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {c.segment}
                            </span>
                          )}
                          {c.bodyType && (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {c.bodyType}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* 回遊導線 */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <Link href="/news">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                NEWS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                このクルマに関する最新ニュースをNEWSから辿る。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                マイナーチェンジや特別仕様車、後継モデルの登場など、
                動きがあればNEWSセクションで追っていく予定です。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                ニュース一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>

          <Link href="/column">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                COLUMN
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                実際のオーナー体験やトラブルの話はCOLUMNで。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                このクルマにまつわるリアルな話や、似たキャラクターのクルマとの比較などは、
                COLUMNセクションで少しずつ増やしていきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                コラム一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}

/* 補助関数・コンポーネント */

function buildRelatedCars(current: CarItem, all: CarItem[]): CarItem[] {
  return all
    .filter((c) => c.slug !== current.slug)
    .filter((c) => {
      if (current.maker && c.maker === current.maker) return true;
      if (current.segment && c.segment === current.segment) return true;
      return false;
    })
    .slice(0, 3);
}

function buildRelatedNews(
  car: CarItem,
  items: NewsItem[],
): NewsItem[] {
  const name = car.name ?? "";
  const maker = car.maker ?? "";

  return items
    .filter((item) => {
      if (!maker && !name) return false;
      if (maker && item.maker === maker) return true;

      const haystack = `${item.title} ${item.titleJa ?? ""}`.toLowerCase();
      if (name && haystack.includes(name.toLowerCase())) return true;

      return false;
    })
    .slice(0, 3);
}

type SpecRowProps = {
  label: string;
  value: string;
};

function SpecRow({ label, value }: SpecRowProps) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 flex-shrink-0 text-[10px] font-medium tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="flex-1 text-[11px] leading-relaxed text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function formatDifficulty(
  difficulty: CarItem["difficulty"],
): string {
  switch (difficulty) {
    case "basic":
      return "エントリー(初めてでも付き合いやすい)";
    case "standard":
      return "標準(維持しやすいバランス型)";
    case "advanced":
      return "上級(多少の理解と覚悟があると安心)";
    default:
      return "不明";
  }
}
