// app/page.tsx
import Link from "next/link";
import { getAllCars } from "@/lib/cars";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  const cars = await getAllCars();
  const news = await getLatestNews(6);

  const latestCars = cars.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* ヒーローエリア */}
      <section className="overflow-hidden rounded-2xl border border-slate-800/70 bg-gradient-to-r from-slate-900 to-slate-950 px-5 py-6 shadow-xl shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              curated for car lovers
            </p>
            <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">
              新型車の「何が変わったか」を
              <br className="hidden md:block" />
              ライト層8割・マニアック2割で整理する
            </h1>
            <p className="text-xs leading-relaxed text-slate-300">
              ディーラーの営業トークとマニアの掲示板の
              ちょうど中間くらいの温度感で、新型車の装備差や変更点を一望できるサイト。
              気になる車種とニュースだけ、さっと押さえられるようにしていきます。
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link
                href="/cars"
                className="rounded-full bg-sky-500 px-3 py-1 font-semibold text-slate-950 shadow-sm shadow-sky-500/40 hover:bg-sky-400"
              >
                車種一覧を見る
              </Link>
              <Link
                href="/news"
                className="rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1 text-slate-200 hover:border-slate-400"
              >
                ニュースから探す
              </Link>
            </div>
          </div>

          <div className="mt-2 flex shrink-0 flex-col gap-2 rounded-2xl bg-slate-900/60 px-4 py-3 text-[11px] text-slate-200 md:w-60">
            <p className="text-xs font-medium text-slate-100">
              このサイトでできること
            </p>
            <ul className="space-y-1 leading-relaxed">
              <li>・新型車の概要と押さえどころをざっと確認</li>
              <li>・「良くなった点・気になる点」を短時間で把握</li>
              <li>・メーカー公式リリースへのリンクで一次情報も確認</li>
              <li>・気になる車種とニュースの関連を横断して眺める</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 最新登録車種 */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              最新の登録車種
            </h2>
            <p className="text-[11px] text-slate-400">
              ざっくりスペックと「マニアック解説あり」の車種だけ、まずチェック。
            </p>
          </div>
          <Link
            href="/cars"
            className="text-[11px] text-sky-300 hover:text-sky-200"
          >
            すべて見る →
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {latestCars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${encodeURIComponent(car.slug)}`}
              className="group rounded-xl border border-slate-800 bg-slate-900/70 p-3 transition hover:border-sky-500/60 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {car.maker ?? "メーカー不明"}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-50">
                    {car.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {car.releaseYear ? `${car.releaseYear}年登録` : "年式情報なし"}
                  </p>
                </div>
                {car.difficulty === "advanced" && (
                  <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    マニアック解説あり
                  </span>
                )}
              </div>
              {car.summary && (
                <p className="mt-2 line-clamp-2 text-[11px] text-slate-300">
                  {car.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* 最新ニュース */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              最新ニュース
            </h2>
            <p className="text-[11px] text-slate-400">
              パワートレインや安全装備、マイナーチェンジなどの気になる話題。
            </p>
          </div>
          <Link
            href="/news"
            className="text-[11px] text-sky-300 hover:text-sky-200"
          >
            ニュース一覧へ →
          </Link>
        </div>

        <div className="space-y-2">
          {news.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={`/news/${encodeURIComponent(item.id)}`}
              className="group rounded-xl border border-slate-800 bg-slate-900/70 p-3 transition hover:border-sky-500/60 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400">
                    {item.source ?? "ソース不明"}
                    {item.publishedAt && ` ・ ${item.publishedAt}`}
                  </p>
                  <p className="text-sm font-semibold text-slate-50">
                    {item.title}
                  </p>
                  {item.summary && (
                    <p className="line-clamp-2 text-[11px] text-slate-300">
                      {item.summary}
                    </p>
                  )}
                </div>
                {item.difficulty === "advanced" && (
                  <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    マニアック寄り
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
