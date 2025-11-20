// app/news/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/news";

type Props = {
  params: { id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const item = await getNewsById(params.id);

  if (!item) {
    notFound();
  }

  const difficultyLabel =
    item.difficulty === "advanced" ? "マニアック寄り" : "ライト寄り";

  return (
    <div className="space-y-8">
      {/* パンくずとメタ */}
      <nav className="text-[11px] text-gray-400">
        <Link href="/" className="hover:text-gray-200">
          ホーム
        </Link>
        <span className="mx-1">/</span>
        <Link href="/news" className="hover:text-gray-200">
          ニュース一覧
        </Link>
        {item.maker && (
          <>
            <span className="mx-1">/</span>
            <span className="text-gray-300">
              {item.maker}
              {item.modelName ? `・${item.modelName}` : ""}
            </span>
          </>
        )}
      </nav>

      {/* タイトルブロック */}
      <header className="space-y-4 rounded-2xl border border-gray-800 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black px-4 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-300">
          {item.category && (
            <span className="rounded-full bg-gray-800/90 px-2 py-0.5 text-[9px] text-gray-100">
              {item.category}
            </span>
          )}
          {item.maker && (
            <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-[9px] text-gray-200">
              {item.maker}
              {item.modelName ? `・${item.modelName}` : ""}
            </span>
          )}
          {item.publishedAt && (
            <span className="text-[10px] text-gray-400">{item.publishedAt}</span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] ${
              item.difficulty === "advanced"
                ? "bg-purple-600 text-white"
                : "bg-slate-700 text-slate-100"
            }`}
          >
            {difficultyLabel}
          </span>
        </div>

        <h1 className="text-lg font-semibold leading-snug text-white">
          {item.title ?? "No title"}
        </h1>

        <p className="text-[11px] text-gray-400">
          {item.source ?? "ソース不明"}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[9px]">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-800/80 px-2 py-0.5 text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 本文要約 */}
      {item.summary && (
        <section className="rounded-2xl border border-gray-800 bg-slate-950/80 p-4 text-[11px] leading-relaxed text-gray-100">
          <h2 className="mb-2 text-xs font-semibold text-gray-200">
            ざっくり要点
          </h2>
          <p className="whitespace-pre-line">{item.summary}</p>
        </section>
      )}

      {/* 公式リンク */}
      {item.referenceUrl && (
        <section className="border-t border-gray-800 pt-4 text-[11px]">
          <a
            href={item.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-purple-300 hover:text-purple-200"
          >
            メーカー公式サイト・プレスリリースを見る
            <span className="ml-1 text-[9px]">↗</span>
          </a>
        </section>
      )}
    </div>
  );
}
