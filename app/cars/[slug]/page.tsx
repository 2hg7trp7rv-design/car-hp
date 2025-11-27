// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { CarRotator } from "@/components/car/CarRotator";
import CompareSlider from "@/components/car/CompareSlider";
import {
  getAllCars,
  getCarBySlug,
  type CarItem,
} from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種が見つかりませんでした。",
    };
  }

  const title = `${car.name} | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "スペック、長所・短所、トラブル傾向、関連ニュースやコラムをまとめた車種ページです。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${encodeURIComponent(
        car.slug,
      )}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return value.toLocaleString("ja-JP");
}

function buildKeywords(car: CarItem): string[] {
  const tags = car.tags ?? [];
  const nameParts = car.name.split(/\s+/);
  return [car.maker, ...nameParts, ...tags].filter(Boolean);
}

async function getRelatedCars(current: CarItem): Promise<CarItem[]> {
  const allCars = await getAllCars();

  const relatedCars = allCars
    .filter(
      (c) =>
        c.slug !== current.slug &&
        (c.maker === current.maker ||
          (c.segment && c.segment === current.segment)),
    )
    .slice(0, 3);

  return relatedCars;
}

async function getRelatedNewsAndColumns(car: CarItem) {
  const [news, columns] = await Promise.all([
    getLatestNews(80),
    getAllColumns(),
  ]);

  const keywords = new Set(buildKeywords(car));

  const relatedNews: NewsItem[] = news
    .filter((item) => {
      if (item.maker && item.maker === car.maker) return true;
      const tags = item.tags ?? [];
      if (tags.some((tag) => keywords.has(tag))) return true;
      const title = `${item.titleJa ?? ""} ${item.title}`.toUpperCase();
      return Array.from(keywords).some(
        (kw) => kw && title.includes(String(kw).toUpperCase()),
      );
    })
    .slice(0, 5);

  const relatedColumns: ColumnItem[] = columns
    .filter((c) => {
      const relatedCarSlugs = (c as any).relatedCarSlugs as
        | string[]
        | undefined;

      if (relatedCarSlugs && relatedCarSlugs.includes(car.slug)) {
        return true;
      }

      const title = `${c.title} ${c.summary}`.toUpperCase();
      return Array.from(keywords).some(
        (kw) => kw && title.includes(String(kw).toUpperCase()),
      );
    })
    .slice(0, 5);

  return { relatedNews, relatedColumns };
}

export default async function CarDetailPage({ params }: PageProps) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  // CarItem にはまだ入れてない拡張フィールドは any 経由で読む
  const strengths = (car as any).strengths as string[] | undefined;
  const weaknesses = (car as any).weaknesses as string[] | undefined;
  const troubleTrends = (car as any).troubleTrends as string[] | undefined;

  const [relatedCars, { relatedNews, relatedColumns }] = await Promise.all([
    getRelatedCars(car),
    getRelatedNewsAndColumns(car),
  ]);

  return (
    <main className="min-h-screen bg-site pb-20 pt-10 sm:pb-28 sm:pt-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <Reveal>
          <header className="flex flex-col gap-3 border-b border-slate-200/70 pb-6">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-tiffany-700">
              CARS
            </p>
            <div className="space-y-1">
              <h1 className="font-serif text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                {car.name}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                {car.maker}
                {car.releaseYear && <> / {car.releaseYear}</>}
              </p>
            </div>
            {car.summaryLong && (
              <p className="max-w-3xl text-[12px] leading-relaxed text-slate-600">
                {car.summaryLong}
              </p>
            )}
            {!car.summaryLong && car.summary && (
              <p className="max-w-3xl text-[12px] leading-relaxed text-slate-600">
                {car.summary}
              </p>
            )}
          </header>
        </Reveal>

        {/* メインビジュアル + 基本スペック */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Reveal className="h-full">
            <GlassCard
              padding="none"
              variant="dim"
              interactive
              className="relative h-full min-h-[260px] overflow-hidden"
            >
              {car.heroImage || (car as any).mainImage ? (
                <CarRotator
                  imageUrl={(car as any).mainImage ?? car.heroImage ?? ""}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-200/60">
                  <span className="text-xs tracking-[0.18em] text-slate-500">
                    IMAGE COMING SOON
                  </span>
                </div>
              )}
            </GlassCard>
          </Reveal>

          <Reveal className="h-full">
            <GlassCard
              as="section"
              padding="md"
              className="h-full border border-slate-200/80 bg-white/90"
            >
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                BASIC SPEC
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-700">
                {car.engine && (
                  <>
                    <dt className="text-slate-400">エンジン</dt>
                    <dd>{car.engine}</dd>
                  </>
                )}
                {car.powerPs && (
                  <>
                    <dt className="text-slate-400">最高出力</dt>
                    <dd>{formatNumber(car.powerPs)} ps</dd>
                  </>
                )}
                {car.torqueNm && (
                  <>
                    <dt className="text-slate-400">最大トルク</dt>
                    <dd>{formatNumber(car.torqueNm)} Nm</dd>
                  </>
                )}
                {car.transmission && (
                  <>
                    <dt className="text-slate-400">トランスミッション</dt>
                    <dd>{car.transmission}</dd>
                  </>
                )}
                {car.drive && (
                  <>
                    <dt className="text-slate-400">駆動方式</dt>
                    <dd>{car.drive}</dd>
                  </>
                )}
                {car.fuel && (
                  <>
                    <dt className="text-slate-400">燃料</dt>
                    <dd>{car.fuel}</dd>
                  </>
                )}
              </dl>
            </GlassCard>
          </Reveal>
        </section>

        {/* 長所 / 短所・トラブル傾向 */}
        {(strengths || weaknesses || troubleTrends) && (
          <section className="grid gap-6 md:grid-cols-3">
            {strengths && strengths.length > 0 && (
              <Reveal>
                <GlassCard
                  as="section"
                  padding="lg"
                  className="h-full border border-emerald-100/80 bg-white/90"
                >
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-emerald-700">
                    STRENGTHS
                  </h2>
                  <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-700">
                    {strengths.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[5px] h-1 w-3 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            )}

            {weaknesses && weaknesses.length > 0 && (
              <Reveal>
                <GlassCard
                  as="section"
                  padding="lg"
                  className="h-full border border-amber-100/80 bg-white/90"
                >
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-amber-700">
                    WEAK POINTS
                  </h2>
                  <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-700">
                    {weaknesses.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[5px] h-1 w-3 rounded-full bg-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            )}

            {troubleTrends && troubleTrends.length > 0 && (
              <Reveal>
                <GlassCard
                  as="section"
                  padding="lg"
                  className="h-full border border-rose-100/80 bg-white/90"
                >
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-rose-700">
                    TROUBLE TRENDS
                  </h2>
                  <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-700">
                    {troubleTrends.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[5px] h-1 w-3 rounded-full bg-rose-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            )}
          </section>
        )}

        {/* 比較スライダー（ダミー） */}
        <section>
          <Reveal>
            <GlassCard
              as="section"
              padding="lg"
              className="border border-slate-200/80 bg-white/90"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                    VISUAL COMPARISON
                  </h2>
                  <p className="text-[12px] leading-relaxed text-slate-600">
                    新旧モデルや他グレードとの違いを視覚的に比べられるようにするための
                    比較スライダーのプレースホルダーです。
                    実画像が揃い次第、ここに本番用の比較写真を配置します。
                  </p>
                </div>
                <div className="flex-1">
                  <CompareSlider
                    beforeImage={
                      (car as any).mainImage ?? car.heroImage ?? ""
                    }
                    afterImage={
                      (car as any).mainImage ?? car.heroImage ?? ""
                    }
                    beforeAlt={`${car.name} (before)`}
                    afterAlt={`${car.name} (after)`}
                  />
                </div>
              </div>
            </GlassCard>
          </Reveal>
        </section>

        {/* 関連CARS / NEWS / COLUMN */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* 関連CARS */}
          <div className="space-y-3">
            <Reveal>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                RELATED CARS
              </h2>
            </Reveal>
            <div className="space-y-3">
              {relatedCars.length === 0 && (
                <p className="text-[11px] text-slate-400">
                  関連する車種はまだ登録されていません。
                </p>
              )}
              {relatedCars.map((rc) => (
                <Reveal key={rc.slug}>
                  <Link href={`/cars/${encodeURIComponent(rc.slug)}`}>
                    <GlassCard
                      as="article"
                      padding="md"
                      interactive
                      className="border border-slate-200/80 bg-white/90"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] tracking-[0.22em] text-slate-400">
                            {rc.maker}
                          </p>
                          <h3 className="text-[12px] font-semibold text-slate-900">
                            {rc.name}
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                            {rc.summary}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          {/* 関連 NEWS / COLUMN */}
          <div className="space-y-8">
            {/* NEWS */}
            <div className="space-y-3">
              <Reveal>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                  RELATED NEWS
                </h2>
              </Reveal>
              <div className="space-y-2">
                {relatedNews.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    この車種に紐づくニュースはまだ登録されていません。
                  </p>
                )}
                {relatedNews.map((item) => (
                  <Reveal key={item.id}>
                    <Link
                      href={`/news/${encodeURIComponent(item.id)}`}
                      className="block"
                    >
                      <article className="group rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                        <p className="line-clamp-2 font-medium tracking-[0.06em] text-slate-900">
                          {item.titleJa ?? item.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          {item.sourceName && (
                            <span className="tracking-[0.16em]">
                              {item.sourceName}
                            </span>
                          )}
                          {item.publishedAtJa && (
                            <span>{item.publishedAtJa}</span>
                          )}
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* COLUMN */}
            <div className="space-y-3">
              <Reveal>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                  RELATED COLUMNS
                </h2>
              </Reveal>
              <div className="space-y-2">
                {relatedColumns.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    この車種に紐づくコラムはまだ登録されていません。
                  </p>
                )}
                {relatedColumns.map((col) => (
                  <Reveal key={col.slug}>
                    <Link
                      href={`/column/${encodeURIComponent(col.slug)}`}
                      className="block"
                    >
                      <article className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                        <p className="font-semibold tracking-[0.06em] text-slate-900">
                          {col.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                          {col.summary}
                        </p>
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
