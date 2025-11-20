// app/news/page.tsx
import { getLatestNews } from "@/lib/news";

export default async function NewsPage() {
  const items = await getLatestNews(30);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">新車・技術ニュース</h1>
        <p className="text-xs text-gray-400">
          国内外メーカーの新型車やパワートレイン、装備変更などをざっくり把握するためのニュース一覧。
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-xs text-gray-500">
          まだニュースデータがありません。Notionの{" "}
          <span className="font-mono">news</span> データベースに行を追加してください。
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs"
            >
              <header className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-white">
                    {item.title || "No title"}
                  </h2>
                  <div className="mt-0.5 text-[11px] text-gray-400">
                    {item.source ?? "ソース不明"}
                    {item.publishedAt && `・${item.publishedAt}`}
                    {item.difficulty === "advanced" && (
                      <span className="ml-2 rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                        マニアック寄り
                      </span>
                    )}
                  </div>
                </div>
              </header>

              {item.summary && (
                <p className="mt-2 text-[11px] text-gray-200 whitespace-pre-line">
                  {item.summary}
                </p>
              )}

              {item.referenceUrl && (
                <a
                  href={item.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-[11px] text-blue-400 underline"
                >
                  メーカー公式サイト・プレスリリースを見る
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
