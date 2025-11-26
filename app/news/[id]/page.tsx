// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsById, getLatestNews, type NewsItem } from "@/lib/news";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

type Props = {
  params: { id: string };
};

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildTitle(item: NewsItem): string {
  const base = item.titleJa || item.title;
  if (item.sourceName) {
    return `${base} | ${item.sourceName}`;
  }
  return base;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getNewsById(params.id);

  if (!item) {
    return {
      title: "記事が見つかりません | CAR BOUTIQUE",
      description: "指定されたニュース記事は見つかりませんでした。",
    };
  }

  const title = buildTitle(item);
  const description =
    item.excerpt ??
    "車のニュースと、その先にある物語を届ける CAR BOUTIQUE のニュース詳細ページです。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      url: `https://car-hp.vercel.app/news/${item.id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const item = await getNewsById(params.id);

  if (!item) {
    notFound();
  }

  const title = item.titleJa || item.title;
  const formattedDate = formatDate(item.publishedAt);

  // 関連ニュース用データ
  const latest = await getLatestNews(80);

  const relatedByMaker = item.maker
    ? latest
        .filter(
          (n) =>
            n.id !== item.id &&
            n.maker === item.maker &&
            n.id !== item.id,
        )
        .slice(0, 4)
    : [];

  const relatedByCategory = item.category
    ? latest
        .filter(
          (n) =>
            n.id !== item.id &&
            n.category === item.category &&
            // メーカー重複を少し避ける（あれば）
            (!item.maker || n.maker !== item.maker),
        )
        .slice(0, 4)
    : [];

  const hasRelated =
    relatedByMaker.length > 0 || relatedByCategory.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-slate-800">
            NEWS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">DETAIL</span>
        </nav>

        {/* タグ・メタ情報行 */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-slate-500">
          {item.category && (
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              {item.category}
            </span>
          )}
          {item.maker && (
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              {item.maker}
            </span>
          )}
          {item.sourceName && (
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              {item.sourceName}
            </span>
          )}
          {formattedDate && (
            <span className="ml-auto text-[10px] tracking-[0.2em] text-slate-400">
              {formattedDate}
            </span>
          )}
        </div>

        {/* タイトル＋原題 */}
        <header className="mb-10 space-y-4">
          <h1 className="text-balance text-2xl font-semibold leading-relaxed tracking-[0.08em] md:text-3xl">
            {title}
          </h1>
          {item.titleJa && (
            <p className="text-xs text-slate-500">
              原題
              <span className="ml-2 text-[11px] tracking-[0.12em]">
                {item.title}
              </span>
            </p>
          )}
        </header>

        {/* 本文ラッパ（要約＋情報カード） */}
        <div className="mb-10 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* 要約・コメントエリア */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-3 text-xs font-medium tracking-[0.18em] text-slate-500">
              SUMMARY
            </h2>
            <p className="text-sm leading-relaxed text-slate-800">
              {item.excerpt ??
                "このニュースは、外部メディアの記事をもとに CAR BOUTIQUE 編集部がピックアップしたものです。詳細は元記事をご覧ください。"}
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50/80 p-4 text-xs text-slate-600">
              <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500">
                CAR BOUTIQUE VIEW
              </p>
              <p className="mt-2 leading-relaxed">
                将来的には、ここに「なぜこの記事をピックアップしたのか」
                「オーナー目線でどう感じるか」といった一言コメントや
                コラムへのリンクを追加していく想定です。
              </p>
            </div>
          </section>

          {/* 情報カード＋元記事リンク */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-tiffany-100 bg-gradient-to-br from-white via-sky-50/40 to-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-medium tracking-[0.2em] text-slate-500">
                ARTICLE INFO
              </h2>
              <dl className="space-y-2 text-xs text-slate-700">
                {item.sourceName && (
                  <div className="flex">
                    <dt className="w-20 shrink-0 text-slate-400">出典</dt>
                    <dd>{item.sourceName}</dd>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex">
                    <dt className="w-20 shrink-0 text-slate-400">配信日</dt>
                    <dd>{formattedDate}</dd>
                  </div>
                )}
                {item.category && (
                  <div className="flex">
                    <dt className="w-20 shrink-0 text-slate-400">カテゴリ</dt>
                    <dd>{item.category}</dd>
                  </div>
                )}
                {item.maker && (
                  <div className="flex">
                    <dt className="w-20 shrink-0 text-slate-400">メーカー</dt>
                    <dd>{item.maker}</dd>
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <dt className="mb-1 text-slate-400">タグ</dt>
                    <dd className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 元記事へのリンク */}
            {item.url && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-xs text-slate-700 shadow-sm">
                <p className="mb-3 text-[11px] tracking-[0.18em] text-slate-500">
                  ORIGINAL ARTICLE
                </p>
                <p className="mb-4 leading-relaxed">
                  記事の全文は、配信元メディアでご確認いただけます。
                  CAR BOUTIQUEでは、要約と独自の視点を添えてご紹介しています。
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
                >
                  元記事を読む
                </a>
              </div>
            )}
          </aside>
        </div>

        {/* 関連ニュースブロック */}
        {hasRelated && (
          <section className="mb-12 space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-700 sm:text-sm">
                関連ニュース
              </h2>
              <Link
                href="/news"
                className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
              >
                NEWS一覧へ戻る
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedByMaker.length > 0 && (
                <GlassCard padding="lg" className="h-full">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    同じメーカーのニュース
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedByMaker.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={`/news/${n.id}`}
                          className="group block"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:underline">
                            {n.titleJa || n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {n.excerpt ??
                              "詳細は記事ページと元記事にてご確認ください。"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDate(n.publishedAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {relatedByCategory.length > 0 && (
                <GlassCard padding="lg" className="h-full">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    同じカテゴリのニュース
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedByCategory.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={`/news/${n.id}`}
                          className="group block"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:underline">
                            {n.titleJa || n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {n.excerpt ??
                              "詳細は記事ページと元記事にてご確認ください。"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDate(n.publishedAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>
          </section>
        )}

        {/* 回遊導線: CARS / COLUMN へ */}
        <section className="mb-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-tiffany-100 bg-gradient-to-br from-white via-sky-50/40 to-white p-5 text-xs shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-tiffany-700">
              CARS
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">
              記事で気になった車種は、CARSページでスペックと性格をチェック。
            </h2>
            <p className="mt-2 leading-relaxed text-text-sub">
              メーカー別にニュースを追いながら、実際の車種ページで
              維持費感やトラブル傾向も併せて見ていくイメージです。
              まずは気になるブランドから、いくつか車種をピックアップしてみてください。
            </p>
            <div className="mt-3">
              <Link href="/cars">
                <Button size="sm" variant="secondary">
                  CARS一覧へ
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-xs shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
              COLUMN
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">
              ニュースの背景や、オーナーの本音はコラムでじっくり。
            </h2>
            <p className="mt-2 leading-relaxed text-text-sub">
              技術解説やブランドの歴史、実際に乗ってみてどうだったかといった
              一歩踏み込んだ話は、COLUMNセクションで少しずつ増やしていきます。
            </p>
            <div className="mt-3">
              <Link href="/column">
                <Button size="sm" variant="outline">
                  コラム一覧へ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 戻るリンク */}
        <div className="mt-6 flex justify-between border-t border-slate-200 pt-6 text-xs">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-slate-500 transition hover:text-slate-900"
          >
            <span className="text-[10px]">←</span>
            <span className="tracking-[0.18em]">NEWS一覧に戻る</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
