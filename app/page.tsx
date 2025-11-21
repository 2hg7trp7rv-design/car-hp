// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  const items = (await getLatestNews(80)) as any[];
  const latest = items.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ヒーロー セクション */}
      <section className="grid gap-8 border-b border-neutral-200 pb-12 md:grid-cols-[1.5fr_minmax(0,1fr)]">
        {/* 左側 画像＋テキストオーバーレイ */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-neutral-100">
          <Image
            src="/images/hero-sedan.jpg"
            alt="ラグジュアリーセダンのサイドビュー"
            width={1200}
            height={800}
            priority
            className="h-full w-full object-cover"
          />

          {/* 上に重ねるグラデーションとテキスト */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent" />

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200">
              Curated Automotive Journal
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              クルマを愉しむ人のためのカーサイト
            </h1>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-neutral-100 sm:text-sm">
              最新ニュース、試乗記、技術解説から中古車の目利きまで
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-[11px] sm:text-xs">
              <Link
                href="/news"
                className="pointer-events-auto inline-flex items-center rounded-full border border-sky-400 bg-sky-500/90 px-5 py-2 font-medium tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-sky-600"
              >
                最新ニュースを見る
              </Link>
              <Link
                href="/reviews"
                className="pointer-events-auto inline-flex items-center rounded-full border border-white/60 bg-white/10 px-5 py-2 font-medium tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                試乗記を読む
              </Link>
            </div>
          </div>
        </div>

        {/* 右側 説明カード（テキスト変更済み） */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-sky-50 bg-white/90 p-5 text-xs leading-relaxed text-neutral-600 shadow-sm shadow-sky-50">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              About
            </p>
            <h2 className="mt-2 text-sm font-medium tracking-tight text-neutral-900">
              高級ブティックのような佇まいで
            </h2>
            <p className="mt-3">
              モノトーンとスカイブルーを基調にした静かなデザインで、
              情報量の多いクルマの世界をすっきり整理して届けます。
              読み疲れしないレイアウトと、落ち着いたトーンの文章を大切にしています。
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-[11px] text-neutral-600">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Focus
              </dt>
              <dd className="mt-1">輸入車中心のニュースと解説</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Style
              </dt>
              <dd className="mt-1">モノトーン＋スカイブルーのミニマルUI</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 最新ニュース3件 */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-600">
              Latest
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
    </div>
  );
}
