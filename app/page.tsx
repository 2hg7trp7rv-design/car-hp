// app/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";
import { getLatestNews } from "@/lib/news";

export const metadata = {
  title: "Car Insight Hub",
  description:
    "新型車の情報と「何が変わったか」を、ライト層8割・マニアック2割でまとめるクルマ特化サイト。",
};

function formatDate(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default async function HomePage() {
  const [cars, news] = await Promise.all([
    getAllCars(),
    getLatestNews(4),
  ]);

  const latestCars = cars.slice(0, 4);

  return (
    <main className="space-y-10">
      {/* ヒーローエリア */}
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">Car Insight Hub</h1>
        <p className="text-xs leading-relaxed text-gray-300">
          新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していくサイト。
          少しクルマが好きな人から、装備の違いまで気になるマニアック層までを対象に、
          「何が変わったか」がひと目で分かることを目指しています。
        </p>
      </section>

      {/* 最新の登録車種 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h2 className="font-semibold text-white">最新の登録車種</h2>
          <Link
            href="/cars"
            className="text-[11px] text-purple-300 hover:text-purple-200"
          >
            すべて見る →
          </Link>
        </div>

        {latestCars.length === 0 ? (
          <p className="text-xs text-gray-500">
            まだ車種データがありません。Notion の
            <span className="font-mono">cars</span>
            データベースに行を追加すると、ここに最新4件が表示されます。
          </p>
        ) : (
          <div className="space-y-3">
            {latestCars.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.slug}`}
                className="block rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs transition hover:border-purple-500"
              >
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
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 最新ニュース（クリックすると /news に飛ぶように変更） */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h2 className="font-semibold text-white">最新ニュース</h2>
          <Link
            href="/news"
            className="text-[11px] text-purple-300 hover:text-purple-200"
          >
            すべて見る →
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="text-xs text-gray-500">
            まだニュースデータがありません。Notion の
            <span className="font-mono">news</span>
            データベースに行を追加すると、ここに最新4件が表示されます。
          </p>
        ) : (
          <div className="space-y-3">
            {news.map((item) => (
              <Link
                key={item.id}
                href="/news"
                className="block rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs transition hover:border-purple-500"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white line-clamp-2">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-400">
                      {item.source ?? "ソース不明"}
                      {item.publishedAt && `・${formatDate(item.publishedAt)}`}
                    </div>
                  </div>
                  {item.difficulty === "advanced" && (
                    <span className="rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                      マニアック寄り
                    </span>
                  )}
                </div>
                {item.summary && (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-gray-300">
                    {item.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
