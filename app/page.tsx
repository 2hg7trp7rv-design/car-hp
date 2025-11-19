// app/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  const [cars, news] = await Promise.all([
    getAllCars(),
    getLatestNews(4),
  ]);

  const latestCars = cars.slice(0, 4);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs tracking-wide text-gray-400">
          新車情報と装備の違いを、ライト層8割・マニアック2割でまとめるクルマ特化サイト
        </p>
        <h1 className="text-2xl font-semibold text-white">
          新型情報と「何が変わったか」を一気にチェック
        </h1>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">最新の登録車種</h2>
          <Link href="/cars" className="text-xs text-gray-400 hover:text-white">
            すべて見る →
          </Link>
        </div>

        {latestCars.length === 0 ? (
          <p className="text-xs text-gray-500">
            まだ車種データがありません。Notionの{" "}
            <span className="font-mono">cars</span> データベースに行を追加すると表示されます。
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {latestCars.map((car) => (
              <Link
                key={car.id}
                href="/cars"
                className="block rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs hover:border-gray-500"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{car.name}</div>
                  {car.releaseYear && (
                    <div className="text-[10px] text-gray-400">
                      {car.releaseYear}年
                    </div>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-gray-400">
                  {car.maker ?? "メーカー不明"}
                </div>
                {car.difficulty === "advanced" && (
                  <div className="mt-2 inline-flex items-center rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                    マニアック解説あり
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">最新ニュース</h2>
          <Link href="/news" className="text-xs text-gray-400 hover:text-white">
            すべて見る →
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="text-xs text-gray-500">
            まだニュースがありません。Notionの{" "}
            <span className="font-mono">news</span> データベースに行を追加すると表示されます。
          </p>
        ) : (
          <div className="space-y-3">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url ?? "#"}
                target={item.url ? "_blank" : undefined}
                rel={item.url ? "noreferrer" : undefined}
                className="block rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs hover:border-gray-500"
              >
                <div className="font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-[11px] text-gray-400">
                  {item.source ?? "ソース不明"}
                  ・
                  {item.publishedAt ?? ""}
                  {item.difficulty === "advanced" && (
                    <span className="ml-2 rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                      マニアック寄り
                    </span>
                  )}
                </div>
                {item.summary && (
                  <p className="mt-2 line-clamp-2 text-[11px] text-gray-300">
                    {item.summary}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
