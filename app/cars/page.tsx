// app/cars/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";

type Props = {
  searchParams?: {
    q?: string;
    maker?: string;
    bodyType?: string;
    yearMin?: string;
    yearMax?: string;
  };
};

export default async function CarsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const makerFilter = searchParams?.maker ?? "";
  const bodyTypeFilter = searchParams?.bodyType ?? "";

  const cars = await getAllCars();

  // 年式スライダーの固定レンジ
  const sliderMinYear = 1990;
  const sliderMaxYear = 2025;

  const parseYear = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const clampYear = (value: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, value));
  };

  const rawYearMin = parseYear(searchParams?.yearMin, sliderMinYear);
  const rawYearMax = parseYear(searchParams?.yearMax, sliderMaxYear);

  const yearMin = clampYear(rawYearMin, sliderMinYear, sliderMaxYear);
  const yearMax = clampYear(rawYearMax, sliderMinYear, sliderMaxYear);

  const selectedYearFrom = Math.min(yearMin, yearMax);
  const selectedYearTo = Math.max(yearMin, yearMax);

  const makers = Array.from(
    new Set(cars.map((c) => c.maker).filter(Boolean)),
  ) as string[];

  const bodyTypes = Array.from(
    new Set(
      cars
        .map((c) => c.bodyType?.trim())
        .filter((v): v is string => Boolean(v)),
    ),
  );

  const filtered = cars.filter((car) => {
    if (makerFilter && car.maker !== makerFilter) return false;
    if (bodyTypeFilter && car.bodyType !== bodyTypeFilter) return false;

    if (q) {
      const keyword = q.toLowerCase();
      const haystack = [
        car.name,
        car.maker,
        car.bodyType,
        car.segment,
        car.summary,
        car.summaryLong,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(keyword)) return false;
    }

    if (car.releaseYear) {
      if (car.releaseYear < selectedYearFrom) return false;
      if (car.releaseYear > selectedYearTo) return false;
    }

    return true;
  });

  return (
    <main className="mx-auto flex.max-w-5xl.flex-col.gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-2 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Cars
        </p>
        <h1 className="serif-font text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          車種データベース(仮)
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
          気になるモデルをざっくり比較しやすくするための車種リストです。
          まずは登録車種を少しずつ増やしながら、比較機能や条件検索を強化していきます。
        </p>
      </header>

      {/* フィルタエリア */}
      <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
        <form className="space-y-3" method="GET">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* キーワード */}
            <div className="space-y-1">
              <label
                htmlFor="q"
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500"
              >
                キーワード
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="車名やメーカー名、ボディタイプなど"
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs leading-none text-slate-900 shadow-sm outline-none ring-0 transition focus:border-[#0ABAB5] focus:ring-1 focus:ring-[#0ABAB5]/60"
              />
            </div>

            {/* メーカーとボディタイプ */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="maker"
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500"
                >
                  メーカー
                </label>
                <select
                  id="maker"
                  name="maker"
                  defaultValue={makerFilter}
                  className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs leading-none text-slate-900 shadow-sm outline-none ring-0 transition focus:border-[#0ABAB5] focus:ring-1 focus:ring-[#0ABAB5]/60"
                >
                  <option value="">指定なし</option>
                  {makers.map((maker) => (
                    <option key={maker} value={maker}>
                      {maker}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="bodyType"
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500"
                >
                  ボディタイプ
                </label>
                <select
                  id="bodyType"
                  name="bodyType"
                  defaultValue={bodyTypeFilter}
                  className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs leading-none text-slate-900 shadow-sm outline-none ring-0 transition focus:border-[#0ABAB5] focus:ring-1 focus:ring-[#0ABAB5]/60"
                >
                  <option value="">指定なし</option>
                  {bodyTypes.map((body) => (
                    <option key={body} value={body}>
                      {body}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 年式スライダー */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                年式レンジ
              </label>
              <div className="text-[11px] text-slate-500">
                {selectedYearFrom}年〜{selectedYearTo}年
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center.gap-2">
                <input
                  type="range"
                  name="yearMin"
                  min={sliderMinYear}
                  max={sliderMaxYear}
                  defaultValue={selectedYearFrom}
                  className="range-slider-input"
                />
                <input
                  type="range"
                  name="yearMax"
                  min={sliderMinYear}
                  max={sliderMaxYear}
                  defaultValue={selectedYearTo}
                  className="range-slider-input"
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>{sliderMinYear}年</span>
                <span>{sliderMaxYear}年</span>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium tracking-wide text-white transition hover:bg-slate-800"
            >
              絞り込む
            </button>
            <Link
              href="/cars"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium tracking-wide text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              クリア
            </Link>
          </div>
        </form>

        {/* 一覧 */}
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            条件に合う車種が見つかりませんでした。
          </p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((car) => (
              <li key={car.id}>
                <Link
                  href={`/cars/${car.slug}`}
                  className="block rounded-2xl border border-slate-100 bg-white/85 px-4 py-4 transition hover:border-[#0ABAB5]/60 hover:bg-white hover:shadow-md"
                >
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    {car.maker}
                    {car.releaseYear ? `・${car.releaseYear}年` : null}
                  </div>
                  <div className="mb-1 text-base font-semibold tracking-tight text-slate-900 md:text-lg">
                    {car.name}
                  </div>
                  {car.summary && (
                    <p className="mb-2 text-sm leading-relaxed text-slate-600">
                      {car.summary}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {car.bodyType && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {car.bodyType}
                      </span>
                    )}
                    {car.segment && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {car.segment}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
