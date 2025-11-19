// app/news/page.tsx
import { getLatestNews } from "@/lib/news";

export default async function NewsPage() {
  const items = await getLatestNews(30);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">新車・技術ニュース</h1>
        <p className="text-xs text-gray-400">
          新型車の正式発表や、パワートレイン・安全装備などの新技術をピックアップ。ライト向け8割＋マニアック2割を意識した構成にしていきます。
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-xs text-gray-500">
          まだニュースがありません。Notionの{" "}
          <span className="font-mono">news</span> データベースに行を追加してください。
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
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
                  <span className="ml-2 rounded bg-purple-700 px-2
