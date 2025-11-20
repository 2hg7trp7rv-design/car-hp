// app/news/[id]/page.tsx
import Link from "next/link";
import { getNewsById, getLatestNews } from "@/lib/news";

type Props = {
  params: { id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const news = await getNewsById(params.id);

  if (!news) {
    return (
      <div className="space-y-4">
        <Link
          href="/news"
          className="text-xs text-gray-400 hover:text-white hover:underline"
        >
          ← ニュース一覧に戻る
        </Link>
        <p className="text-xs text-gray-400">
          該当するニュースが見つかりませんでした。
        </p>
      </div>
    );
  }

  const all = await getLatestNews(50);

  const related = all
    .filter((item) => item.id !== news.id)
    .filter((item) => {
      const sameModel =
        news.modelName && item.modelName === news.modelName;
      const sameMaker = news.maker && item.maker === news.maker;
      const shareTag = news.tags.some((t) => item.tags.includes(t));
      return sameModel || sameMaker || shareTag;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Link
        href="/news"
        className="text-xs text-gray-400 hover:text-white hover:underline"
      >
        ← ニュース一覧に戻る
      </Link>

      <article className="space-y-4 rounded-lg border border-gray-800 bg-gray-900/70 p-4 text-xs">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-white">
            {news.title}
          </h1>
          <div className="text-[11px] text-gray-400">
            {news.source ?? "ソース不明"}
            {news.publishedAt && `・${news.publishedAt}`}
            {news.category && `・${news.category}`}
            {news.difficulty === "advanced" && (
              <span className="ml-2 rounded bg-purple-600 px-2 py-0.5 text-[10px] text-white">
                マニアック寄り
              </span>
            )}
          </div>
          {(news.maker || news.modelName) && (
            <div className="text-[11px] text-gray-300">
              {news.maker && news.maker}
              {news.modelName && `・${news.modelName}`}
            </div>
          )}
          {news.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 text-[10px] text-gray-300">
              {news.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-gray-700 px-1.5 py-0.5"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        {news.summary && (
          <section className="space-y-2 text-[11px] text-gray-100 whitespace-pre-line">
            {news.summary}
          </section>
        )}

        {news.referenceUrl && (
          <div>
            <a
              href={news.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 underline"
            >
              メーカー公式サイト・プレスリリースを見る
            </a>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">関連ニュース</h2>
          <div className="space-y-2">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="block rounded-lg border border-gray-800 bg-gray-900/60 p-3 text-xs hover:border-gray-700"
              >
                <div className="font-semibold text-white">
                  {item.title}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">
                  {item.source ?? "ソース不明"}
                  {item.publishedAt && `・${item.publishedAt}`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
