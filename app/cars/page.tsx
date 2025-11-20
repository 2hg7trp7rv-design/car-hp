// app/cars/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";

export default async function CarsPage() {
  const cars = await getAllCars();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">車種一覧</h1>
        <p className="text-xs text-gray-400">
          新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していく予定のページ。
        </p>
      </header>

      {cars.length === 0 ? (
        <p className="text-xs text-gray-500">
          まだ車種データがありません。
          Notionの <span className="font-mono">cars</span> データベースに行を追加してください。
        </p>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.slug}`}
              className="block"
            >
              <div className="rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs hover:border-purple-500 hover:bg-gray-900 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white">{car.name}</div>
                    <div className="mt-0.5 text-[11px] text-gray-400">
                      {car.maker ?? "メーカー不明"}
                      {car.releaseYear && `・${car.releaseYear}年`}
                    </div>
                  </div>
                  {car.difficulty === "advanced" && (
                    <span className="rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                      マニアック解説あり
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
