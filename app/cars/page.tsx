// app/cars/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";

type Props = {
  searchParams?: {
    q?: string;
    maker?: string;
    difficulty?: string;
  };
};

export default async function CarsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const makerFilter = searchParams?.maker ?? "";
  const difficultyFilter = searchParams?.difficulty ?? "";

  const cars = await getAllCars();

  const makers = Array.from(
    new Set(cars.map((c) => c.maker).filter(Boolean)),
  ) as string[];

  const filtered = cars.filter((car) => {
    if (makerFilter && car.maker !== makerFilter) return false;
    if (difficultyFilter && car.difficulty !== difficultyFilter) return false;

    if (q) {
      const text = [
        car.name,
        car.maker,
        car.summary,
        car.summaryLong,
        car.engine,
        car.segment,
        car.grade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!text.includes(q)) return false;
    }

    return true;
  });

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top_left,#0ABAB5_0%,#ffffff_45%,#ffffff_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-200 backdrop-blur md:p-8">
        <div className="mb-6 text-sm font-semibold tracking-[0.18em] text-slate-500">
          CARS
        </div>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          車種一覧
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-600 md:text-base">
          新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していくページ。フィルターで気になる車だけ絞り込めます。
        </p>

        {/* フィルター */}
        <form className="mb-8 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500">
              キーワード
            </label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              placeholder="車名・メーカー・キーワード"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500">
              メーカー
            </label>
            <select
              name="maker"
              defaultValue={makerFilter}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
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
              解説の濃さ
            </label>
            <select
              name="difficulty"
              defaultValue={difficultyFilter}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">すべて</option>
              <option value="basic">ライト向け</option>
              <option value="advanced">マニアック寄り</option>
            </select>
          </div>
          <div className="flex gap-2">
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
                  className="block rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 transition hover:border-teal-300 hover:bg-white hover:shadow-md"
                >
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    {car.maker}・
                    {car.releaseYear ? `${car.releaseYear}年` : "年式不明"}
                  </div>
                  <div className="mb-1 text-base font-semibold tracking-tight text-slate-900 md:text-lg">
                    {car.name}
                  </div>
                  {car.summary && (
                    <p className="mb-2 text-sm leading-relaxed text-slate-600">
                      {car.summary}
                    </p>
                  )}
                  <div className="text-xs font-medium text-teal-600">
                    {car.difficulty === "advanced"
                      ? "マニアック解説あり"
                      : car.difficulty === "basic"
                      ? "ライト向けの解説"
                      : "解説準備中"}
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
