// app/cars/page.tsx
import { GlassCard } from "@/components/GlassCard";
import Link from "next/link";
import { getAllCars } from "@/lib/cars";

export const metadata = {
  title: "車種データベース | CAR BOUTIQUE",
  description:
    "スペック、性格、維持費、トラブル傾向などを含めた車種データを丁寧に整理。高品質な車種カタログ。",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    bodyType?: string;
    segment?: string;
  };
}) {
  const q = (searchParams?.q ?? "").toLowerCase();
  const bodyFilter = searchParams?.bodyType ?? "";
  const segmentFilter = searchParams?.segment ?? "";

  const cars = await getAllCars();

  const filtered = cars.filter((item) => {
    const matchesQuery =
      q === "" ||
      item.name.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q);

    const matchesBody =
      bodyFilter === "" ||
      item.bodyType?.toLowerCase() === bodyFilter.toLowerCase();

    const matchesSegment =
      segmentFilter === "" ||
      item.segment?.toLowerCase() === segmentFilter.toLowerCase();

    return matchesQuery && matchesBody && matchesSegment;
  });

  const uniqueBodies = Array.from(new Set(cars.map((c) => c.bodyType).filter(Boolean)));
  const uniqueSegments = Array.from(
    new Set(cars.map((c) => c.segment).filter(Boolean))
  );

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* 見出し */}
        <header className="mb-10">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            DATABASE
          </p>
          <h1 className="font-display-serif mt-3 text-3xl font-semibold sm:text-4xl">
            車種データベース
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-sub">
            各車種の基本情報から、性格、維持のしやすさ、長所・短所、トラブル傾向まで。
            スペック表だけでは分からない「実際どういう車なのか」を丁寧にまとめています。
          </p>
        </header>

        {/* フィルタUI（GlassCard） */}
        <GlassCard className="mb-10">
          <form className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {/* キーワード */}
            <div className="flex flex-col">
              <label className="font-body-light text-[10px] tracking-[0.25em] text-text-sub mb-1">
                キーワード
              </label>
              <input
                type="text"
                name="q"
                placeholder="車名・特徴で検索"
                defaultValue={q}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-tiffanySoft"
              />
            </div>

            {/* ボディタイプ */}
            <div className="flex flex-col">
              <label className="font-body-light text-[10px] tracking-[0.25em] text-text-sub mb-1">
                ボディタイプ
              </label>
              <select
                name="bodyType"
                defaultValue={bodyFilter}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-tiffanySoft"
              >
                <option value="">すべて</option>
                {uniqueBodies.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* セグメント */}
            <div className="flex flex-col">
              <label className="font-body-light text-[10px] tracking-[0.25em] text-text-sub mb-1">
                セグメント
              </label>
              <select
                name="segment"
                defaultValue={segmentFilter}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-tiffanySoft"
              >
                <option value="">すべて</option>
                {uniqueSegments.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 検索ボタン */}
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="mt-2 rounded-md bg-brand-tiffany px-5 py-2 text-xs font-semibold tracking-wider text-white transition hover:bg-brand-tiffanySoft"
              >
                SEARCH
              </button>
            </div>
          </form>
        </GlassCard>

        {/* 一覧 */}
        <div className="space-y-4">
          {filtered.map((car) => (
            <GlassCard
              key={car.id}
              as="article"
              className="transition hover:shadow-lg"
            >
              <Link href={`/cars/${car.slug}`} className="block">
                <div className="flex flex-col gap-2">
                  <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                    {car.maker ?? ""}
                  </p>

                  <h2 className="font-display-serif text-lg font-semibold leading-snug">
                    {car.name}
                  </h2>

                  <p className="text-xs leading-relaxed text-text-sub">
                    {car.summary}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-text-sub">
                    <p>{car.releaseYear}年式</p>
                    <p>{car.bodyType}</p>
                  </div>
                </div>
              </Link>
            </GlassCard>
          ))}
        </div>

        {/* 該当なし */}
        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-text-sub">
            条件に一致する車種がありません。
          </p>
        )}
      </div>
    </main>
  );
}
