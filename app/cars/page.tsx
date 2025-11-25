// app/cars/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";

export default async function CarsPage({
  searchParams,
}: {
  searchParams?: {
    maker?: string;
    body?: string;
    segment?: string;
  };
}) {
  const makerFilter = searchParams?.maker ?? "";
  const bodyFilter = searchParams?.body ?? "";
  const segmentFilter = searchParams?.segment ?? "";

  const cars = await getAllCars();

  // null や undefined を除去して純粋な string[] だけに整形
  const uniqueMakers = Array.from(
    new Set(
      cars
        .map((c) => c.maker)
        .filter((v): v is string => typeof v === "string" && v.length > 0),
    ),
  );

  const uniqueBodies = Array.from(
    new Set(
      cars
        .map((c) => c.bodyType)
        .filter((v): v is string => typeof v === "string" && v.length > 0),
    ),
  );

  const uniqueSegments = Array.from(
    new Set(
      cars
        .map((c) => c.segment)
        .filter((v): v is string => typeof v === "string" && v.length > 0),
    ),
  );

  // フィルタリング
  const filtered = cars.filter((c) => {
    if (makerFilter && c.maker !== makerFilter) return false;
    if (bodyFilter && c.bodyType !== bodyFilter) return false;
    if (segmentFilter && c.segment !== segmentFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <h1 className="text-3xl font-display-serif mb-6">車種一覧</h1>

      {/* フィルタ UI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* メーカー */}
        <select
          className="border rounded-md px-3 py-2"
          value={makerFilter}
          onChange={(e) => {
            const v = e.target.value;
            const params = new URLSearchParams(searchParams as any);
            if (v) params.set("maker", v);
            else params.delete("maker");
            window.location.search = params.toString();
          }}
        >
          <option value="">すべて</option>
          {uniqueMakers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* ボディタイプ */}
        <select
          className="border rounded-md px-3 py-2"
          value={bodyFilter}
          onChange={(e) => {
            const v = e.target.value;
            const params = new URLSearchParams(searchParams as any);
            if (v) params.set("body", v);
            else params.delete("body");
            window.location.search = params.toString();
          }}
        >
          <option value="">すべて</option>
          {uniqueBodies.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* セグメント */}
        <select
          className="border rounded-md px-3 py-2"
          value={segmentFilter}
          onChange={(e) => {
            const v = e.target.value;
            const params = new URLSearchParams(searchParams as any);
            if (v) params.set("segment", v);
            else params.delete("segment");
            window.location.search = params.toString();
          }}
        >
          <option value="">すべて</option>
          {uniqueSegments.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 一覧表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((car) => (
          <Link
            key={car.id}
            href={`/cars/${car.slug}`}
            className="block border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">{car.name}</h2>

            <div className="text-sm text-gray-600 mb-1">
              {car.maker} / {car.bodyType}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {car.segment} / {car.releaseYear}
            </div>

            <p className="text-gray-700 text-sm line-clamp-2 mt-3">
              {car.summary}
            </p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center mt-10 text-gray-500">
          条件に合う車種がありません
        </p>
      )}
    </main>
  );
}
