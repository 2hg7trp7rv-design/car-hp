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
      const text =
        `${car.name} ${car.maker ?? ""} ${car.summary ?? ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">車種一覧</h1>
        <p className="text-xs text-gray-400">
          新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していくページ。
          フィルターで気になる車だけ絞り込めます。
        </p>
      </header>

      {/* フィルター */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px]">
        <form className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-slate-300">キーワード</label>
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q ?? ""}
              placeholder="車名・概要・特徴で検索"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50 placeholder:text-slate-500"
            />
          </div>
          <div className="w-full space-y-1 md:w-40">
            <label className="text-slate-300">メーカー</label>
            <select
              name="maker"
              defaultValue={makerFilter}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50"
            >
              <option value="">すべて</option>
              {makers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full space-y-1 md:w-40">
            <label className="text-slate-300">解説の濃さ</label>
            <select
              name="difficulty"
              defaultValue={difficultyFilter}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50"
            >
              <option value="">すべて</option>
              <option value="basic">ライト向け</option>
              <option value="advanced">マニアック寄り</option>
            </select>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <button
              type="submit"
              className="mt-4 flex-1 rounded-md bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400 md:mt-0"
            >
              絞り込む
            </button>
            <Link
              href="/cars"
              className="mt-4 inline-flex items-center justify-center rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:border-slate-400 md:mt-0"
            >
              クリア
            </Link>
          </div>
        </form>
      </section>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-500">
          条件に合う車種がありませんでした。
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${encodeURIComponent(car.slug)}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs transition hover:border-sky-500/60 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    {car.maker ?? "メーカー不明"}
                    {car.releaseYear && ` ・ ${car.releaseYear}年`}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-white">
                    {car.name}
                  </div>
                  {car.summary && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-300">
                      {car.summary}
                    </p>
                  )}
                </div>
                {car.difficulty === "advanced" && (
                  <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    マニアック解説あり
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
