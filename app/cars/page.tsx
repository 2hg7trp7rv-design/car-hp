// app/cars/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllCars,
  type CarItem,
  type CarDifficulty,
} from "@/lib/cars";

export const metadata: Metadata = {
  title: "クルマ図鑑 | CAR BOUTIQUE",
  description:
    "フェラーリを中心としたモデルの素性や維持ポイントをまとめたクルマ図鑑です。",
};

// 難易度 → 表示用ラベル・スター
const difficultyPresentation: Record<
  CarDifficulty,
  { label: string; stars: string }
> = {
  basic: { label: "初級", stars: "★☆☆" },
  intermediate: { label: "中級", stars: "★★☆" },
  advanced: { label: "上級", stars: "★★★" },
};

function DifficultyBadge({ difficulty }: { difficulty?: CarDifficulty }) {
  if (!difficulty) return null;
  const { label, stars } = difficultyPresentation[difficulty];

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
      <span aria-hidden>{stars}</span>
      <span>{label}</span>
    </span>
  );
}

function CarMeta({ car }: { car: CarItem }) {
  return (
    <div className="text-xs font-medium text-slate-500">
      <span className="uppercase tracking-[0.25em] text-slate-400">
        {car.maker}
      </span>
      {car.releaseYear && (
        <>
          <span className="mx-1 text-slate-300">/</span>
          <span>{car.releaseYear}年</span>
        </>
      )}
    </div>
  );
}

function CarCard({ car }: { car: CarItem }) {
  const imageSrc = car.heroImage ?? car.mainImage ?? null;

  return (
    <article className="group rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:ring-slate-200 sm:p-5">
      {/* サムネイルエリア */}
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-50">
        <div className="aspect-[4/3] sm:aspect-[21/9]">
          {imageSrc ? (
            <>
              <Image
                src={imageSrc}
                alt={car.name}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-200/70" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
              <div className="rounded-full border border-dashed border-slate-300/80 px-3 py-1 text-[11px] font-medium text-slate-400">
                写真は準備中です
              </div>
            </div>
          )}
        </div>
      </div>

      {/* テキスト部分 */}
      <div className="space-y-2">
        <CarMeta car={car} />

        <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {car.name}
        </h2>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
          {car.summary}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <DifficultyBadge difficulty={car.difficulty} />

          {car.tags && car.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {car.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-100"
                >
                  {tag}
                </span>
              ))}
              {car.tags.length > 3 && (
                <span className="text-[11px] text-slate-400">
                  ほか {car.tags.length - 3} 件
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function CarsIndexPage() {
  const cars = await getAllCars();
  const total = cars.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            CARS · DATABASE
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            クルマ図鑑
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            気になるモデルの素性や、維持にまつわるざっくりしたポイントをまとめた
            「クルマ図鑑」です。まずはフェラーリ中心に、少しずつラインナップを増やしていきます。
          </p>
          <p className="mt-4 text-xs text-slate-400">
            件数{" "}
            <span className="font-semibold text-slate-700">{total}</span>
          </p>
        </header>

        {/* コントロールバー（現状は表示のみ。将来フィルタ追加しやすい形に） */}
        <section aria-label="一覧の設定" className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <span className="text-[10px] tracking-wide text-slate-500">
                  並び順
                </span>
                <span>年式が新しい順</span>
              </span>
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                ※ 並び替え・絞り込みは今後拡張予定です
              </span>
            </div>

            <div className="w-full sm:w-64">
              <label className="sr-only" htmlFor="car-search">
                クルマ名やメーカーで検索（準備中）
              </label>
              <div className="relative">
                <input
                  id="car-search"
                  type="search"
                  disabled
                  placeholder="クルマ名やメーカーで検索（準備中）"
                  className="w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:bg-slate-50"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-medium text-slate-300">
                  Coming soon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 一覧 */}
        <section aria-label="クルマ一覧" className="space-y-4 sm:space-y-5">
          {cars.map((car) => (
            <Link
              key={car.slug}
              href={`/cars/${car.slug}`}
              className="block focus:outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            >
              <CarCard car={car} />
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
