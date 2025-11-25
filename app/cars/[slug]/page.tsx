// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCarBySlug } from "@/lib/cars";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種ページが見つかりませんでした。",
    };
  }

  return {
    title: `${car.name} | CAR BOUTIQUE`,
    description: car.summary,
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return (
      <main className="min-h-screen px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
            CARS
          </p>
          <h1 className="mt-4 text-lg font-semibold text-slate-900 sm:text-xl">
            指定された車種ページが見つかりませんでした。
          </h1>
          <div className="mt-6">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center rounded-full border border-tiffany-400/70 bg-white/80 px-6 py-2 text-xs font-medium tracking-[0.18em] text-tiffany-700 shadow-soft hover:bg-white"
            >
              CARS一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      {/* ヒーロー */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
            {car.maker} / CARS
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {car.name}
          </h1>
          {car.grade && (
            <p className="mt-1 text-xs text-text-sub">
              グレード{car.grade}
            </p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-text-sub sm:text-[15px]">
            {car.summaryLong ?? car.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-text-sub">
            {car.bodyType && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.bodyType}
              </span>
            )}
            {car.segment && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.segment}
              </span>
            )}
            {car.releaseYear && (
              <span className="rounded-full bg-white/80 px-3 py-1">
                {car.releaseYear}年頃登場
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tiffany-50 via-white to-slate-50 shadow-soft-card">
            <div className="relative aspect-[4/3] w-full">
              {car.heroImage ? (
                <Image
                  src={car.heroImage}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-100 to-white" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/5 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* スペックとお金周り */}
      <section className="mt-10 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <GlassCard as="section" padding="lg">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            パワートレーンとスペック
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] text-text-sub sm:text-xs">
            {car.engine && (
              <>
                <dt className="font-medium text-slate-700">エンジン</dt>
                <dd>{car.engine}</dd>
              </>
            )}
            {typeof car.powerPs === "number" && (
              <>
                <dt className="font-medium text-slate-700">最高出力</dt>
                <dd>{car.powerPs}ps</dd>
              </>
            )}
            {typeof car.torqueNm === "number" && (
              <>
                <dt className="font-medium text-slate-700">最大トルク</dt>
                <dd>{car.torqueNm}Nm</dd>
              </>
            )}
            {car.transmission && (
              <>
                <dt className="font-medium text-slate-700">トランスミッション</dt>
                <dd>{car.transmission}</dd>
              </>
            )}
            {car.drive && (
              <>
                <dt className="font-medium text-slate-700">駆動方式</dt>
                <dd>{car.drive}</dd>
              </>
            )}
            {car.fuel && (
              <>
                <dt className="font-medium text-slate-700">燃料</dt>
                <dd>{car.fuel}</dd>
              </>
            )}
            {car.fuelEconomy && (
              <>
                <dt className="font-medium text-slate-700">実用燃費目安</dt>
                <dd>{car.fuelEconomy}</dd>
              </>
            )}
          </dl>
        </GlassCard>

        <GlassCard as="section" padding="lg">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            価格感と維持費の目安
          </h2>
          <dl className="mt-4 space-y-3 text-[11px] text-text-sub sm:text-xs">
            {car.priceNew && (
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-700">新車時価格帯</dt>
                <dd className="text-right">{car.priceNew}</dd>
              </div>
            )}
            {car.priceUsed && (
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-700">現在の中古車相場</dt>
                <dd className="text-right">{car.priceUsed}</dd>
              </div>
            )}
            <div className="mt-2 text-[11px] leading-relaxed text-text-sub">
              実際の維持費は個体差や乗り方によって大きく変わります。
              CARSページ全体で同じ基準になるよう、順次「年間維持費のざっくり目安」も整理していく予定です。
            </div>
          </dl>
        </GlassCard>
      </section>

      {/* タグ */}
      {car.tags && car.tags.length > 0 && (
        <section className="mt-10">
          <GlassCard padding="sm">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
              TAGS
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-text-sub">
              {car.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>
        </section>
      )}

      {/* 戻るリンク */}
      <section className="mt-10">
        <Link
          href="/cars"
          className="inline-flex items-center justify-center rounded-full border border-tiffany-400/70 bg-white/80 px-6 py-2 text-xs font-medium tracking-[0.18em] text-tiffany-700 shadow-soft hover:bg-white"
        >
          CARS一覧へ戻る
        </Link>
      </section>
    </main>
  );
}
