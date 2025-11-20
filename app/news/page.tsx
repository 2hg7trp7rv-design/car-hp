// app/news/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

export const metadata = {
  title: "ニュース一覧 | Car Insight Hub",
};

export default async function NewsPage() {
  const items = await getLatestNews(60);

  if (!items || items.length === 0) {
    return (
      <div className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold text-white">ニュース一覧</h1>
          <p className="text-xs text-gray-400">
            国内外メーカーの新型車やパワートレイン、装備変更などをざっくり把握するためのニュース一覧。
          </p>
        </header>
        <p className="text-xs text-gray-500">
          まだニュースデータがありません。Notionの
          <span className="font-mono">news</span>
          データベースに行を追加してください。
        </p>
      </div>
    );
  }

  // おすすめフラグ付きだけをピックアップ
  const featured = items.filter((i) => i.isFeatured).slice(0, 3);
  const featuredIds = new Set(featured.map((i) => i.id));

  // 残り
  const others = items.filter((i) => !featuredIds.has(i.id));

  // カテゴリ一覧
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as string[];

  return (
    <div className="space-y-10">
      {/* ヘッダー */}
      <header className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-900/20 px-3 py-1 text-[10px] font-medium text-purple-100">
          新型車情報とマニアック解説をまとめてチェック
        </div>
        <h1 className="text-xl font-semibold text-white">ニュース一覧</h1>
        <p className="text-xs leading-relaxed text-gray-400">
          国内外メーカーの新型車発表、パワートレインのアップデート、安全装備の刷新など。
          ライト層でも読みやすく、マニアックな人は深掘りのきっかけにできるよう整理していきます。
        </p>

        {/* カテゴリのチップ（現状は表示のみ） */}
        {categories.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-gray-700 bg-gray-800/80 px-2.5 py-1 text-[10px] text-gray-200"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* おすすめニュース */}
      {featured.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">ピックアップ３選</h2>
            <span className="text-[10px] text-gray-400">
              チェックしておきたいアップデートだけを厳選
            </span>
          </div>
          <div className="grid gap-3">
            {featured.map((item) => (
              <NewsCard key={item.id} item={item} accent />
            ))}
          </div>
        </section>
      )}

      {/* すべてのニュース */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">すべてのニュース</h2>
          <span className="text-[10px] text-gray-500">
            新しいものから順に表示しています
          </span>
        </div>
        <div className="grid gap-3">
          {others.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function NewsCard({ item, accent = false }: { item: NewsItem; accent?: boolean }) {
  const difficultyLabel =
    item.difficulty === "advanced" ? "マニアック寄り" : "ライト寄り";

  return (
    <article
      className={`group rounded-xl border p-4 text-xs transition ${
        accent
          ? "border-purple-500/60 bg-gradient-to-br from-purple-900/40 via-slate-900/90 to-slate-950/95 shadow-[0_18px_45px_rgba(0,0,0,0.6)]"
          : "border-gray-800 bg-slate-900/70 hover:border-purple-500/50 hover:bg-slate-900"
      }`}
    >
      <Link href={`/news/${item.id}`} className="block h-full space-y-3">
        {/* 上部メタ情報 */}
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-[13px] font-semibold leading-snug text-white group-hover:text-purple-100">
              {item.title ?? "No title"}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-400">
              <span>{item.source ?? "ソース不明"}</span>
              {item.publishedAt && <span>・{item.publishedAt}</span>}
              {item.maker && (
                <span className="rounded-full bg-gray-800/80 px-2 py-0.5 text-[9px] text-gray-200">
                  {item.maker}
                  {item.modelName ? `・${item.modelName}` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] ${
                item.difficulty === "advanced"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              {difficultyLabel}
            </span>
            {item.category && (
              <span className="rounded-full bg-gray-800/80 px-2 py-0.5 text-[9px] text-gray-100">
                {item.category}
              </span>
            )}
          </div>
        </header>

        {/* 要約 */}
        {item.summary && (
          <p className="line-clamp-4 whitespace-pre-line text-[11px] leading-relaxed text-gray-200">
            {item.summary}
          </p>
        )}

        {/* タグ */}
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

        {/* メーカー公式リンク */}
        {item.referenceUrl && (
          <div className="pt-1 text-[10px]">
            <span className="inline-flex items-center text-purple-300 group-hover:text-purple-200">
              メーカー公式サイト・プレスリリースを見る
              <span className="ml-1 text-[9px]">↗</span>
            </span>
          </div>
        )}
      </Link>
    </article>
  );
}
