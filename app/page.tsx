// app/page.tsx
import Link from "next/link";
import { getAllCars } from "../lib/cars";
import { getLatestNews } from "../lib/news";

export default async function HomePage() {
  const [cars, news] = await Promise.all([
    getAllCars(),
    getLatestNews(5),
  ]);

  const latestCars = cars.slice(0, 6);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
        <section className="space-y-4">
          <h1 className="text-3xl font-semibold">
            新車情報ダッシュボード
          </h1>
          <p className="text-sm text-gray-300">
            新車情報・新機能・改善点と、少しマニアックな技術解説をまとめた個人用ポータル
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">最新の新車</h2>
            <Link href="/cars" className="text-xs text-blue-400 underline">
              一覧を見る
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {latestCars.map((car) => (
              <div
                key={car.id}
                className="rounded-lg border border-gray-700 bg-gray-900/60 p-4"
              >
                <div className="text-xs text-gray-400">
                  {car.maker ?? "メーカー不明"}
                </div>
                <div className="text-lg font-semibold">{car.name}</div>
                <div className="mt-1 text-xs text-gray-400">
                  {car.releaseYear ? `${car.releaseYear}年デビュー` : ""}
                  {car.difficulty === "advanced" && (
                    <span className="ml-2 rounded bg-purple-600 px-2 py-0.5 text-[10px]">
                      マニア向け
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">最新ニュース</h2>
            <Link href="/news" className="text-xs text-blue-400 underline">
              一覧を見る
            </Link>
          </div>
          <div className="space-y-3">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url ?? "#"}
                className="block rounded-lg border border-gray-700 bg-gray-900/60 p-4"
                target="_blank"
                rel="noreferrer"
              >
                <div className="text-xs text-gray-400">
                  {item.source ?? "ソース不明"}・
                  {item.publishedAt ?? ""}
                  {item.difficulty === "advanced" && (
                    <span className="ml-2 rounded bg-purple-600 px-2 py-0.5 text-[10px]">
                      マニア向け
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {item.title}
                </div>
                {item.summary && (
                  <p className="mt-1 text-xs text-gray-300 line-clamp-3">
                    {item.summary}
                  </p>
                )}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
