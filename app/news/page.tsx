// app/news/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export default async function NewsPage() {
  const items = await getLatestNews(30);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">ニュース一覧</h1>
        <p className="text-xs text-gray-400">
          国内外メーカーの新型車やパワートレイン、装備変更などをざっくり把握するためのニュース一覧。
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-xs text-gray-500">
          まだニュースデータがありません。Notionの
          <span className="font-mono">news</span>データベースに行を追加してください。
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const metaParts: string[] = [];
            if (item.source) metaParts.push(item.source);
            if (item.publishedAt) metaParts.push(item.publishedAt);
            if (item.category) metaParts.push(item.category);
            const metaLine = metaParts.join("・");

            const carParts: string[] = [];
            if (item.maker) carParts.push(item.maker);
            if (item.modelName) carParts.push(item.modelName);
            const carLine = carParts.join(" ");

            return (
              <article
                key={item.id}
                className="rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs"
              >
                <header className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h2 className="font-semibold text-white">
                      <Link href={`/news/${item.id}`}>{item.title}</Link>
                    </h2>
                    {metaLine && (
                      <div className="text-[11px] text-gray-400">
                        {metaLine}
                      </div>
                    )}
                    {carLine && (
                      <div className="text-[11px] text-gray-400">
                        {carLine}
                      </div>
                    )}
                  </div>
                  {item.difficulty === "advanced" && (
                    <span className="rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                      マニアック寄り
                    </span>
                  )}
                </header>

                {item.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-700 px-2 py-0.5 text-gray-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {item.summary && (
                  <p className="mt-2 text-[11px] text-gray-100 whitespace-pre-line">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
