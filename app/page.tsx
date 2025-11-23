// app/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export const revalidate = 600;

export default async function HomePage() {
  const latestNews = await getLatestNews(3);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          {/* Tiffanyブルー×白グラデーションのベース */}
          <div className="h-full w-full bg-gradient-to-br from-sky-200 via-white to-sky-300 opacity-80" />
          {/* うっすら暗くして文字を読みやすくする */}
          <div className="absolute inset-0 bg-neutral-950/60" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-20 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-300">
              Curated Automotive Journal
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Driving Elegance.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-100">
              車のニュースと、その先にある物語を。
              静かな時間の中で、愛車との未来を想うための場所です。
            </p>
            <p className="mt-3 text-xs text-neutral-200">
              大手メディアの速報を選び取りつつ、
              オーナーの視点から少し深く解説していく小さなブティックメディアです。
            </p>
          </div>

          <div className="flex flex-col gap-3 text-xs text-neutral-200">
            <p className="uppercase tracking-[0.2em]">
              Car Boutique
            </p>
            <p className="max-w-xs leading-relaxed">
              ニュースは自動で集め、
              本音のコラムとガイドは手で編んでいく。
              その二つが混ざり合う場所を目指しています。
            </p>
          </div>
        </div>
      </section>

      {/* ダッシュボード的な入口 */}
      <section className="border-y border-neutral-900 bg-neutral-900/40">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-6 text-xs sm:grid-cols-4">
          <Link
            href="/news"
            className="group rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-4 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              News
            </p>
            <p className="mt-2 text-sm font-medium tracking-tight">
              最新ニュース
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              国内外の主要メディアから集めたトピックを、
              見出しの一覧でさっと追えるように。
            </p>
          </Link>

          <Link
            href="/column"
            className="group rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-4 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Column
            </p>
            <p className="mt-2 text-sm font-medium tracking-tight">
              コラムとストーリー
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              オーナー目線の本音や、修理体験、技術の話をじっくり読むための場所。
            </p>
          </Link>

          <Link
            href="/guide"
            className="group rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-4 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Guide
            </p>
            <p className="mt-2 text-sm font-medium tracking-tight">
              買い方と維持のガイド
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              予算の組み方や維持費の感覚など、
              お金まわりの悩みを整理するためのガイドライン。
            </p>
          </Link>

          <Link
            href="/cars"
            className="group rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-4 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Cars
            </p>
            <p className="mt-2 text-sm font-medium tracking-tight">
              車種別ガレージ
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              一台ごとの性格やトラブル傾向を、
              ニュースやコラムとあわせて整理していく予定です。
            </p>
          </Link>
        </div>
      </section>

      {/* 最新ニュース3件のダイジェスト */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <header className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
              Latest
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              最新ニュースのダイジェスト
            </h2>
          </div>
          <Link
            href="/news"
            className="text-[11px] text-neutral-300 underline-offset-4 hover:underline"
          >
            すべてのニュースを見る
          </Link>
        </header>

        <div className="space-y-4">
          {latestNews.length === 0 && (
            <p className="text-xs text-neutral-500">
              ニュースの取得準備中です。
            </p>
          )}

          {latestNews.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-900 bg-neutral-900/40 px-4 py-4 transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              <h3 className="text-sm font-medium leading-snug tracking-tight">
                <Link
                  href={item.url}
                  target="_blank"
                  className="hover:underline"
                >
                  {item.title}
                </Link>
              </h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
