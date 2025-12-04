// app/cars/page.tsx （App Router の場合）

import { getAllCars } from "@/lib/cars";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "クルマ図鑑",
};

export default async function CarsPage() {
  const cars = await getAllCars();

  // 念のため
  // console.log("cars length:", cars.length);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          クルマ図鑑
        </h1>

        <p className="mb-4 text-sm text-slate-600">
          件数: <span className="font-semibold">{cars.length}</span>
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Link
              key={car.slug}
              href={`/cars/${car.slug}`}
              className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* 画像エリア */}
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                {car.heroImage ? (
                  <Image
                    src={car.heroImage}
                    alt={car.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    画像準備中
                  </div>
                )}
              </div>

              {/* テキストエリア */}
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-red-600">
                  {car.name}
                </h2>

                <p className="text-xs text-slate-500">
                  {car.maker}
                  {car.releaseYear ? ` / ${car.releaseYear}年` : null}
                </p>

                <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
                  {car.summary}
                </p>

                {car.difficulty && (
                  <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {car.difficulty === "basic"
                      ? "★ 入門"
                      : car.difficulty === "intermediate"
                      ? "★★ 中級"
                      : "★★★ 上級"}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
