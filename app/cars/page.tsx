// app/cars/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars, type CarItem } from "@/lib/cars";

export const metadata: Metadata = {
  title: "CARS一覧 | CAR BOUTIQUE",
  description:
    "BMW 5シリーズやトヨタ ハリアーなど、気になる車種をスペックとストーリーで整理したCARS一覧ページです。",
};

function difficultyLabel(difficulty?: CarItem["difficulty"]): string {
  switch (difficulty) {
    case "basic":
      return "初めてでも扱いやすい";
    case "intermediate":
      return "少しこだわりたい人向け";
    case "advanced":
      return "クルマ好き向け・玄人向け";
    default:
      return "バランスタイプ";
  }
}

export default async function CarsIndexPage() {
  const cars = await getAllCars();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          CARS
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          車種データベース
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          スペックだけでなく、長所短所や維持費感、トラブル傾向まで、
          将来の比較機能を見据えて一台ずつ整理していく車種データベースです。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {cars.map((car) => (
          <GlassCard
            key={car.id}
            as="article"
            interactive
            className="flex h-full flex-col p-4 sm:p-5"
          >
            <Link href={`/cars/${car.slug}`} className="block h-full">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-[10px] font-medium tracking-[0.18em] text-white px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                    {car.maker}
                  </span>
                  {car.releaseYear && (
                    <span>{car.releaseYear}年頃登場</span>
                  )}
                </div>

                <h2 className="mt-3 text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                  {car.name}
                </h2>

                {car.grade && (
                  <p className="mt-1 text-[11px] text-text-sub">
                    グレード{car.grade}
                  </p>
                )}

                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-sub">
                  {car.summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-sub">
                  <div className="flex flex-wrap gap-1">
                    {car.bodyType && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {car.bodyType}
                      </span>
                    )}
                    {car.segment && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {car.segment}
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-white/80 px-2 py-1">
                    {difficultyLabel(car.difficulty)}
                  </span>
                </div>
              </div>
            </Link>
          </GlassCard>
        ))}

        {cars.length === 0 && (
          <p className="text-sm text-text-sub">
            まだ車種データがありません。順次追加していきます。
          </p>
        )}
      </section>
    </main>
  );
}
