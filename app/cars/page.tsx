// app/cars/page.tsx
import { getAllCars } from "../../lib/cars";

export default async function CarsPage() {
  const cars = await getAllCars();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold">新車一覧</h1>
        <p className="text-sm text-gray-300">
          maker・発売年・記事レベルでざっくり眺めるための一覧
        </p>
        <div className="mt-4 divide-y divide-gray-800 rounded-lg border border-gray-700 bg-gray-900/60">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="text-xs text-gray-400">
                  {car.maker ?? "メーカー不明"}
                </div>
                <div className="text-sm font-semibold">{car.name}</div>
              </div>
              <div className="text-right text-xs text-gray-400">
                {car.releaseYear && <div>{car.releaseYear}年</div>}
                {car.difficulty && (
                  <div>
                    {car.difficulty === "basic" ? "一般向け" : "マニア向け"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
