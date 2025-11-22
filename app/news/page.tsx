// app/news/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getDisplayTitle(item: NewsItem) {
  return item.titleJa ?? item.title;
}

function getSourceLabel(item: NewsItem) {
  if (item.type === "original") return "Original";
  return item.sourceName ?? "External";
}

export default async function NewsPage() {
  const items = await getLatestNews();

  if (!items || items.length === 0) {
    return (
      <main className="bg-gradient-to-r from-sky-50/70 via-white to-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="text-xl font-semibold text-slate-900">ニュース</h1>
          <p className="mt-2 text-sm text-slate-600">
            まだニュースが登録されていません。
          </p>
        </div>
      </main>
    );
  }

  const [lead, ...rest] = items;
  const secondary = rest.slice(0, 4);
  const others = rest.slice(4);

  return (
    <main className="bg-gradient-to-r from-sky-50/70 via-white to-white min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        {/* ページヘッダー */}
        <header className="space-y-2">
          <p className="text-[11px] tracking-[0.25em] text-sky-500">
            CAR BOUTIQUE JOURNAL
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            ニュース
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            クルマにまつわる最新トピックを、静かなトーンでまとめたニュースページです。
            大きな見出しでいま押さえておきたい記事を、その下に時系列で一覧表示します。
          </p>
        </header>

        {/* トップニュース＋サブヘッドライン */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-stretch">
          {/* トップニュース（大きなカード） */}
          <Link
            href={`/news/${encodeURIComponent(lead.id)}`}
            className="group relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl"
          >
            {/* 背景：ティファニーブルーグラデーション */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-200 via-sky-100 to-white" />
            {/* オーバーレイ（少し暗くして文字を読みやすく） */}
            <div className="absolute inset-0 bg-slate-950/35" />

            <div className="relative flex h-full flex-col justify-end p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-sky-500/80 px-3 py-0.5 font-semibold uppercase tracking-wide">
                  Top News
                </span>
                <span className="rounded-full bg-white/15 px-3 py-0.5 text-[10px]">
                  {getSourceLabel(lead)}
                </span>
                {lead.category && (
                  <span className="rounded-full bg-white/8 px-3 py-0.5 text-[10px]">
                    {lead.category}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-semibold leading-snug md:text-xl">
                {getDisplayTitle(lead)}
              </h2>

              {lead.excerpt && (
                <p className="text-[13px] leading-relaxed text-slate-100/90 line-clamp-3">
                  {lead.excerpt}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-100/80">
                <span>{formatDate(lead.publishedAt)}</span>
                <span className="inline-flex items-center gap-1 text-sky-50 group-hover:text-sky-100">
                  記事の詳細へ
                  <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </Link>

          {/* サブヘッドライン（リスト） */}
          <div className="space-y-3 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-sky-100/70 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold tracking-[0.16em] text-slate-500">
                HEADLINES
              </p>
              <Link
                href="/news/archive"
                className="text-[11px] text-sky-500 hover:text-sky-600"
              >
                過去のニュース一覧へ
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {secondary.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${encodeURIComponent(item.id)}`}
                  className="group flex flex-col gap-1 py-3"
                >
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-slate-600">
                      {getSourceLabel(item)}
                    </span>
                    {item.category && (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-600">
                        {item.category}
                      </span>
                    )}
                    <span className="text-slate-400">
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium leading-snug text-slate-900 group-hover:text-sky-700">
                    {getDisplayTitle(item)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 下部：通常の一覧（Car Watchのリスト部分イメージ） */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              最新の記事一覧
            </h2>
            <p className="text-[11px] text-slate-500">
              発行日の新しい順に最大20件まで表示します。
            </p>
          </div>

          <div className="space-y-3">
            {others.map((item) => (
              <Link
                key={item.id}
                href={`/news/${encodeURIComponent(item.id)}`}
                className="group block rounded-2xl bg-white/80 p-4 text-sm shadow-sm ring-1 ring-slate-100/80 backdrop-blur-sm hover:ring-sky-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-slate-600">
                      {getSourceLabel(item)}
                    </span>
                    {item.category && (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                        {item.category}
                      </span>
                    )}
                    {item.maker && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                        {item.maker}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(item.publishedAt)}
                  </span>
                </div>

                <p className="mt-2 text-[13px] font-medium leading-snug text-slate-900 group-hover:text-sky-700">
                  {getDisplayTitle(item)}
                </p>

                {item.excerpt && (
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-600 line-clamp-2">
                    {item.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
