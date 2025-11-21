// app/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  // 一覧と同じ80件を取得し、先頭3件だけ表示
  const items = (await getLatestNews(80)) as any[];
  const latest = items.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ヒーロー */}
      <section className="grid gap-10 border-b border-neutral-200 pb-12 md:grid-cols-[1.4fr_minmax(0,1fr)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-sky-600">
            Curated Automotive Journal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            静かにクルマを愉しむ人のための
            <br />
            ブティック・カーサイト
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
            最新ニュース、試乗記、技術解説から中古車の目利きまで。
            派手な煽りよりも、上質な情報と読み心地のよさを大切にした
            クルマ好きのためのメディアです。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <Link
              href="/news"
              className="inline-flex items-center rounded-full border border-sky-600 bg-sky-600 px-5 py-2 font-medium tracking-[0.18em] text-white transition hover:bg-sky-700"
            >
              最新ニュースを見る
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center rounded-full border border-sky-200 bg-white px-5 py-2 font-medium tracking-[0.18em] text-neutral-800 transition hover:border-sky-400 hover:text-sky-700"
            >
              試乗記を読む
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm shadow-sky-50 backdrop-blur-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              About
            </p>
            <h2 className="mt-2 text-sm font-medium tracking-tight text-neutral-900">
              高級ブティックのような佇まいで
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600">
              情報量の多いクルマの世界を、
              TiffanyやDiorのような静かな高級感をイメージした
              UIで再構成。
              モノトーンをベースに、スカイブルーを一滴だけ加えた世界観で
              読み疲れしないレイアウトを徹底しています。
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
            // 0,1,2…をそのままidとして使う
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
