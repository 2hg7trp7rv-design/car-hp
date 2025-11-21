// app/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  const items = (await getLatestNews(80)) as any[];
  const latest = items.slice(0, 3);

  return (
    <div className="bg-neutral-50">
      {/* ヒーロー 全画面画像＋テキスト＋最新ニュースカード */}
      <section
        className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-sedan.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

        <div className="relative z-10 flex h-full flex-col px-4 py-10 sm:px-6 lg:px-8">
          {/* キャッチコピー */}
          <div className="mt-6 flex justify-center">
            <div className="max-w-3xl text-center text-neutral-50">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200">
                CURATED AUTOMOTIVE JOURNAL
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                クルマを愉しむ人のためのカーサイト
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-neutral-100 sm:text-base md:text-lg">
                最新ニュース、試乗記、技術解説から中古車の目利きまで
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3 text-[11px] sm:text-xs">
                <Link
                  href="/news"
                  className="inline-flex items-center rounded-full border border-sky-400 bg-sky-500/90 px-6 py-2 font-medium tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-sky-600"
                >
                  最新ニュースを見る
                </Link>
                <Link
                  href="/reviews"
                  className="inline-flex items-center rounded-full border border-white/70 bg-white/10 px-6 py-2 font-medium tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  試乗記を読む
                </Link>
              </div>
            </div>
          </div>

          {/* ヒーロー内の最新ニュースカード */}
          <div className="mt-12 md:mt-16 mb-4 flex justify-center">
            <section className="w-full max-w-4xl rounded-2xl border border-white/25 bg-black/40 p-5 text-xs leading-relaxed text-neutral-100 shadow-sm shadow-black/40 backdrop-blur-md sm:p-6">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-sky-100">
                    LATEST
                  </p>
                  <h2 className="mt-1 text-sm font-medium tracking-tight text-white">
                    最新ニュース
                  </h2>
                </div>
                <Link
                  href="/news"
                  className="text-[11px] tracking-[0.18em] text-sky-200 underline-offset-4 hover:underline"
                >
                  一覧を見る
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {latest.map((item, index) => {
                  const id = String(index);
                  const date =
                    item.date ?? item.publishedAt ?? item.createdAt ?? "";
                  return (
                    <Link
                      key={id}
                      href={`/news/${id}`}
                      className="group flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-sky-300/60 hover:bg-white/10"
                    >
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-sky-200">
                          {item.category ?? "NEWS"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-neutral-50 group-hover:text-neutral-100">
                          {item.title}
                        </p>
                      </div>
                      <div className="hidden flex-col items-end text-[10px] text-neutral-200 sm:flex">
                        {date && <span>{date}</span>}
                        {item.maker && (
                          <span className="mt-0.5 text-[10px] text-neutral-300">
                            {item.maker}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* 下段は従来どおりニュース3件のカード一覧 */}
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-sky-600">
                LATEST
              </p>
              <h2 className="mt-1 text-sm font-semibold tracking-tight text-neutral-900">
                最新ニュース
              </h2>
            </div>
            <Link
              href="/news"
              className="text-[11px] tracking-[0.18em] text-sky-700 underline-offset-4 hover:underline"
            >
              すべてのニュース
            </Link>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {latest.map((item, index) => {
              const id = String(index);
              const date =
                item.date ?? item.publishedAt ?? item.createdAt ?? "";

              return (
                <Link
                  key={id}
                  href={`/news/${id}`}
                  className="group block rounded-2xl border border-neutral-200 bg-white/90 p-4 text-sm shadow-sm shadow-neutral-100 transition hover:-translate-y-[1px] hover:border-sky-200 hover:shadow-md hover:shadow-sky-100"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sky-600">
                    {item.category ?? "NEWS"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-medium tracking-tight text-neutral-900 group-hover:text-neutral-700">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-600">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{date}</span>
                    {item.maker && <span>{item.maker}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
