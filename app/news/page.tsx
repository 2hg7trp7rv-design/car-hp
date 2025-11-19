// app/news/page.tsx
import { getLatestNews } from "../../lib/news";

export default async function NewsPage() {
  const news = await getLatestNews(50);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold">ニュース一覧</h1>
        <p className="text-sm text-gray-300">
          手動登録した新車ニュースのストック
        </p>
        <div className="mt-4 space-y-3">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-gray-700 bg-gray-900/60 p-4"
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
      </div>
    </main>
  );
}
