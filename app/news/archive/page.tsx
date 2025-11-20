// app/news/archive/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

function getMonthKey(item: NewsItem): string | null {
  if (!item.publishedAt) return null;
  return item.publishedAt.slice(0, 7); // "YYYY-MM"
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  if (!y || !m) return key;
  return `${y}年${m}月`;
}

export default async function NewsArchivePage() {
  const items = await getLatestNews(200);

  const groups = new Map<string, NewsItem[]>();

  for (const item of items) {
    const key = getMonthKey(item);
    if (!key) continue;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  const monthKeys = Array.from(groups.keys()).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">
          ニュースアーカイブ
        </h1>
        <p className="text-xs text-gray-400">
          過去のニュースを月別に一覧できるページ。
        </p>
      </header>

      {monthKeys.length === 0 ? (
        <p className="text-xs text-gray-500">
          まだニュースデータがありません。
        </p>
      ) : (
        <div className="space-y-6">
          {monthKeys.map((key) => {
            const monthItems = groups.get(key) ?? [];
            return (
              <section key={key} className="space-y-2">
                <h2 className="text-sm font-semibold text-white">
                  {formatMonthLabel(key)}
                </h2>
                <div className="space-y-1">
                  {monthItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.id}`}
                      className="block rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs hover:border-gray-700"
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
            );
          })}
        </div>
      )}
    </div>
  );
}
