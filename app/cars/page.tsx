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
    <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white pb-20">
      <section className="mx-auto max-w-5xl space-y-8 px-6 pt-16">
        {/* 見出し＋説明（文字を一段階大きく） */}
        <header className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
            CARS
          </p>
          <h1 className="serif-font text-3xl font-bold text-slate-900 md:text-4xl">
            車種一覧
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していくページ。
            フィルターで気になる車だけ絞り込めます。
          </p>
        </header>

        {/* フィルター */}
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-[11px] shadow-sm">
          <form className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-slate-600">キーワード</label>
              <input
                type="text"
                name="q"
                defaultValue={searchParams?.q ?? ""}
                placeholder="車名・概要・特徴で検索"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="w-full space-y-1 md:w-40">
              <label className="text-slate-600">メーカー</label>
              <select
                name="maker"
                defaultValue={makerFilter}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
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
              <label className="text-slate-600">解説の濃さ</label>
              <select
                name="difficulty"
                defaultValue={difficultyFilter}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
              >
                <option value="">すべて</option>
                <option value="basic">ライト向け</option>
                <option value="advanced">マニアック寄り</option>
              </select>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <button
                type="submit"
                className="mt-4 flex-1 rounded-full bg-tiffany-500 px-3 py-2 text-xs font-semibold text-white shadow-soft hover:bg-tiffany-600 md:mt-0"
              >
                絞り込む
              </button>
              <Link
                href="/cars"
                className="mt-4 inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:border-tiffany-400 hover:text-tiffany-600 md:mt-0 md:flex-none"
              >
                クリア
              </Link>
            </div>
          </form>
        </section>

        {/* 一覧 */}
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500">
            条件に合う車種がありませんでした。
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${encodeURIComponent(car.slug)}`}
                className="block rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs shadow-sm transition hover:border-tiffany-400 hover:shadow-soft"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      {car.maker ?? "メーカー不明"}
                      {car.releaseYear && ` ・ ${car.releaseYear}年`}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-900">
                      {car.name}
                    </div>
                    {car.summary && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
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
      </section>
    </main>
  );
}
