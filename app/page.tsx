// app/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  const items = (await getLatestNews(80)) as any[];
  const latest = items.slice(0, 3);

  return (
    <div className="bg-neutral-50">
      {/* ヒーロー 全画面画像＋テキスト＋ABOUT */}
      <section
        className="
          relative min-h-[calc(100vh-72px)] overflow-hidden
          bg-[url('/images/hero-sedan.jpg')] bg-cover bg-center
        "
      >
        {/* 暗めグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/15" />

        {/* 中身 */}
        <div className="relative z-10 flex h-full flex-col px-4 py-10 sm:px-6 lg:px-8">
          {/* 上側 キャッチコピー */}
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
              <p className="mt-3 text-xs leading-relaxed text-neutral-200 sm:text-sm">
                スタジオの静謐な光とともに、情報を愉しむ空間へ。
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

          {/* ボタンとABOUTの間隔を広めにとる */}
          <div className="mt-12 md:mt-16 mb-4 flex justify-center">
            <section className="w-full max-w-4xl rounded-2xl border border-white/20 bg-black/35 p-5 text-xs leading-relaxed text-neutral-100 shadow-sm shadow-black/40 backdrop-blur-md sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sky-100">
                ABOUT
              </p>
              <h2 className="mt-2 text-sm font-medium tracking-tight text-white">
                高級ブティックのような佇まいで
              </h2>
              <p className="mt-3">
                モノトーンとスカイブルーを基調にした静かなデザインで、
                情報量の多いクルマの世界をすっきり整理して届けます。
                読み疲れしないレイアウトと、落ち着いたトーンの文章を大切にしています。
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 text-[11px] text-neutral-100">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-neutral-200">
                    FOCUS
                  </dt>
                  <dd className="mt-1">輸入車中心のニュースと解説</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-neutral-200">
                    STYLE
                  </dt>
                  <dd className="mt-1">モノトーン＋スカイブルーのミニマルUI</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </section>

      {/* 最新ニュース3件 ブロック */}
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
