// app/cars/[slug]/page.tsx
import Link from "next/link";
import { getCarBySlug } from "@/lib/cars";
import { getNewsByCar, type NewsItem } from "@/lib/news";

type Props = {
  params: { slug: string };
};

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return (
      <div className="space-y-3 text-xs text-slate-200">
        <p>指定された車種が見つかりませんでした。</p>
        <Link href="/cars" className="text-sky-300 hover:text-sky-200">
          車種一覧に戻る
        </Link>
      </div>
    );
  }

  // メーカー名と車名が両方あるときだけ関連記事を取得
  let relatedNews: NewsItem[] = [];
  if (car.maker && car.name) {
    relatedNews = await getNewsByCar(car.maker, car.name, 5);
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          {car.maker ?? "メーカー不明"}
          {car.releaseYear && ` ・ ${car.releaseYear}年`}
        </p>
        <h1 className="text-xl font-semibold text-slate-50">{car.name}</h1>
        {car.difficulty === "advanced" && (
          <p className="inline-flex items-center rounded-full bg-fuchsia-600 px-3 py-0.5 text-[10px] font-semibold text-white">
            マニアック寄りの解説を含みます
          </p>
        )}
      </header>

      {/* 概要と押さえどころ */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <h2 className="text-[13px] font-semibold text-slate-50">
            概要とキャラクター
          </h2>
          {car.summary ? (
            <p className="whitespace-pre-line text-slate-200">{car.summary}</p>
          ) : (
            <p className="text-slate-400">概要のメモはまだありません。</p>
          )}

          {car.changeSummary && (
            <div className="mt-3 space-y-1">
              <h3 className="text-[12px] font-semibold text-slate-50">
                先代・ライバルからの主な変更点
              </h3>
              <p className="whitespace-pre-line text-slate-200">
                {car.changeSummary}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <h2 className="text-[13px] font-semibold text-slate-50">
            この車の押さえどころ
          </h2>
          {car.specHighlights ? (
            <p className="whitespace-pre-line text-slate-200">
              {car.specHighlights}
            </p>
          ) : (
            <p className="text-slate-400">
              スペックの押さえどころはまだ整理中です。
            </p>
          )}

          <div className="mt-3 grid gap-2 text-[11px] md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-emerald-300">良いところ</h3>
              {car.pros ? (
                <p className="mt-1 whitespace-pre-line text-slate-200">
                  {car.pros}
                </p>
              ) : (
                <p className="mt-1 text-slate-400">メモなし</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-amber-300">気になるところ</h3>
              {car.cons ? (
                <p className="mt-1 whitespace-pre-line text-slate-200">
                  {car.cons}
                </p>
              ) : (
                <p className="mt-1 text-slate-400">メモなし</p>
              )}
            </div>
          </div>

          {car.referenceUrl && (
            <a
              href={car.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-[11px] text-sky-300 hover:text-sky-200"
            >
              メーカー公式サイト・プレスリリースを見る
            </a>
          )}
        </div>
      </section>

      {/* 関連ニュース */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-slate-50">関連ニュース</h2>
          <Link
            href={{
              pathname: "/news",
              query: {
                maker: car.maker ?? undefined,
                q: car.name ?? undefined,
              },
            }}
            className="text-[11px] text-sky-300 hover:text-sky-200"
          >
            ニュース一覧でこの車を探す →
          </Link>
        </div>

        {relatedNews.length === 0 ? (
          <p className="text-xs text-slate-400">
            この車に紐づくニュースはまだ登録されていません。
          </p>
        ) : (
          <div className="space-y-2">
            {relatedNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${encodeURIComponent(item.id)}`}
                className="block rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px] transition hover:border-sky-500/60 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-slate-400">
                      {item.sourceName ?? "CAR BOUTIQUE"}
                      {item.publishedAt &&
                        ` ・ ${new Date(item.publishedAt).toLocaleDateString(
                          "ja-JP"
                        )}`}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-50">
                      {item.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="pt-2 text-xs">
        <Link href="/cars" className="text-sky-300 hover:text-sky-200">
          車種一覧に戻る
        </Link>
      </div>
    </div>
  );
}
