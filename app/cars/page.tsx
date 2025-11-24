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

    if (car.releaseYear) {
      if (
        car.releaseYear < selectedYearFrom ||
        car.releaseYear > selectedYearTo
      ) {
        return false;
      }
    }

    if (q) {
      const text = [
        car.name,
        car.maker,
        car.summary,
        car.summaryLong,
        car.engine,
        car.segment,
        car.grade,
        car.bodyType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!text.includes(q)) return false;
    }

    return true;
  });

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-200 backdrop-blur md:p-8">
        <div className="mb-6 text-sm font-semibold tracking-[0.18em] text-slate-500">
          CARS
        </div>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          車種一覧
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-600 md:text-base">
          新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していくページ。
          フィルターで気になる車だけ絞り込めます。
        </p>

        {/* フィルター */}
        <form className="mb-8 space-y-4">
          {/* キーワード */}
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500">
              キーワード
            </label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20"
              placeholder="車名・メーカー・キーワード"
            />
          </div>

          {/* メーカー / ボディタイプ */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500">
                メーカー
              </label>
              <select
                name="maker"
                defaultValue={makerFilter}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20"
              >
                <option value="">すべて</option>
                {makers.map((maker) => (
                  <option key={maker} value={maker}>
                    {maker}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500">
                ボディタイプ
              </label>
              <select
                name="bodyType"
                defaultValue={bodyTypeFilter}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0ABAB5] focus:ring-2 focus:ring-[#0ABAB5]/20"
              >
                <option value="">すべて</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 発売年レンジスライダー */}
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500">
              発売年
            </label>
            <div className="flex items-baseline justify-between text-[11px] text-slate-500">
              <span>{selectedYearFrom}年</span>
              <span>{selectedYearTo}年</span>
            </div>

            <div className="mt-2">
              <div className="range-slider">
                <div className="range-slider-track" />
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
