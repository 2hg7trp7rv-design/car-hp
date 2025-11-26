// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAllCars, type CarItem } from "@/lib/cars";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CARS一覧 | CAR BOUTIQUE",
  description:
    "一台ずつ、スペックと「性格」を整理したCARS一覧。ニュースやコラムと行き来しながら、次の愛車候補を考えられる車種データベースを目指します。",
};

type Props = {
  searchParams?: {
    q?: string;
    maker?: string;
    bodyType?: string;
    difficulty?: string;
    segment?: string;
  };
};

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

export default async function CarsPage({ searchParams }: Props) {
  const all = await getAllCars();

  const q = normalize(searchParams?.q);
  const makerFilter = (searchParams?.maker ?? "").trim();
  const bodyTypeFilter = (searchParams?.bodyType ?? "").trim();
  const difficultyFilter = (searchParams?.difficulty ?? "").trim();
  const segmentFilter = (searchParams?.segment ?? "").trim();

  const makers = Array.from(
    new Set(all.map((c) => c.maker).filter(Boolean)),
  ) as string[];

  const bodyTypes = Array.from(
    new Set(all.map((c) => c.bodyType).filter(Boolean)),
  ) as string[];

  const difficulties = Array.from(
    new Set(all.map((c) => c.difficulty).filter(Boolean)),
  ) as string[];

  const segments = Array.from(
    new Set(all.map((c) => c.segment).filter(Boolean)),
  ) as string[];

  const cars = all.filter((car) => {
    if (q) {
      const haystack = [
        car.name,
        car.maker,
        car.summary,
        car.summaryLong,
        car.bodyType,
        car.segment,
        car.grade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (makerFilter && car.maker !== makerFilter) return false;
    if (bodyTypeFilter && car.bodyType !== bodyTypeFilter) return false;
    if (difficultyFilter && car.difficulty !== difficultyFilter) return false;
    if (segmentFilter && car.segment !== segmentFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">CARS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-3">
          <p className="text-[10px] tracking-[0.32em] text-text-sub">
            CURATED CAR CATALOG
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            一台ずつ、
            <span className="inline-block bg-gradient-to-r from-tiffany-500 to-tiffany-700 bg-clip-text text-transparent">
              性格
            </span>
            まで分かるカタログへ。
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-text-sub">
            ただのスペック表ではなく、「どんな性格のクルマか」「維持していくとどうか」
            までイメージできるCARSページを少しずつ増やしていきます。
            まずは気になるメーカーやボディタイプから絞り込んでみてください。
          </p>
        </header>

        {/* フィルターバー */}
        <section className="mb-8 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
          <form action="/cars" method="get" className="space-y-4">
            {/* 上段 キーワード＋難易度 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="w-full md:w-2/3">
                <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                  KEYWORD
                </label>
                <input
                  name="q"
                  defaultValue={searchParams?.q ?? ""}
                  placeholder="車名・グレード・キーワードで探す"
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                  DIFFICULTY
                </label>
                <select
                  name="difficulty"
                  defaultValue={difficultyFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                >
                  <option value="">すべて</option>
                  {difficulties.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 下段 メーカー・ボディタイプ・セグメント */}
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                  MAKER
                </label>
                <select
                  name="maker"
                  defaultValue={makerFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                >
                  <option value="">すべて</option>
                  {makers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                  BODY TYPE
                </label>
                <select
                  name="bodyType"
                  defaultValue={bodyTypeFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                >
                  <option value="">すべて</option>
                  {bodyTypes.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                  SEGMENT
                </label>
                <select
                  name="segment"
                  defaultValue={segmentFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                >
                  <option value="">すべて</option>
                  {segments.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
              >
                絞り込み
              </button>
            </div>
          </form>
        </section>

        {/* 一覧 */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
              CARS LIST
            </h2>
            <p className="text-[11px] text-slate-400">
              {cars.length}台表示中（登録総数{all.length}台）
            </p>
          </div>

          {cars.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
              条件に合致する車種が見つかりませんでした。
              絞り込み条件を緩めて再度お試しください。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type CardProps = {
  car: CarItem;
};

function CarCard({ car }: CardProps) {
  const difficultyLabel = car.difficulty ?? "";
  const releaseYear = car.releaseYear
    ? `${car.releaseYear}年頃`
    : undefined;

  return (
    <Link href={`/cars/${car.slug}`}>
      <article className="group h-full rounded-3xl border border-white/80 bg-white/90 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
        {/* 上段: メーカー・ボディタイプ・難易度 */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
          {car.maker && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              {car.maker}
            </span>
          )}
          {car.bodyType && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              {car.bodyType}
            </span>
          )}
          {difficultyLabel && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              難易度{difficultyLabel}
            </span>
          )}
          {releaseYear && (
            <span className="ml-auto text-[10px] text-slate-400">
              {releaseYear}
            </span>
          )}
        </div>

        {/* 車名 */}
        <h2 className="text-[13px] font-semibold leading-relaxed text-slate-900 md:text-sm">
          {car.name}
        </h2>

        {/* グレード・セグメント */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          {car.grade && <span>{car.grade}</span>}
          {car.segment && (
            <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px]">
              {car.segment}
            </span>
          )}
        </div>

        {/* 概要 */}
        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
          {car.summary ??
            "この車種の詳細ページでは、スペックだけでなく性格や維持費感まで少しずつ整理していきます。"}
        </p>
      </article>
    </Link>
  );
}
