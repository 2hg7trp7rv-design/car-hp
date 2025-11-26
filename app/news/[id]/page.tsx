// app/news/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsById, getLatestNews, type NewsItem } from "@/lib/news";

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
  const [item, latest] = await Promise.all([
    getNewsById(params.id),
    getLatestNews(80),
  ]);

  if (!item) {
    notFound();
  }

  const title = item.titleJa || item.title;
  const formattedDate = formatDate(item.publishedAt);

  const related = latest
    .filter((n) => n.id !== item.id)
    .filter((n) => {
      if (item.maker && n.maker === item.maker) return true;
      if (item.category && n.category === item.category) return true;
      return false;
    })
    .slice(0, 3);

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
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
              {item.category}
            </span>
          )}
          {item.maker && (
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
              {item.maker}
            </span>
          )}
          {item.sourceName && (
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1">
              {item.sourceName}
            </span>
          )}
          {formattedDate && (
            <span className="ml-auto text-[10px] tracking-[0.2em] text-slate-400">
              {formattedDate}
            </span>
          )}
        </div>

        {/* タイトル */}
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

        {/* 本文ラッパ（要約＋コメント＋情報カード） */}
        <div className="mb-10 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* 要約・コメントエリア */}
          <section className="space-y-4">
            {/* SUMMARYカード */}
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="mb-4 text-xs font-medium tracking-[0.18em] text-slate-500">
                SUMMARY
              </h2>
              <p className="text-sm leading-relaxed text-slate-800">
                {item.excerpt ??
                  "このニュースは、外部メディアの記事をもとに CAR BOUTIQUE 編集部がピックアップしたものです。詳細は元記事をご覧ください。"}
              </p>
            </div>

            {/* CAR BOUTIQUEのひと言コメント */}
            <div className="rounded-3xl border border-tiffany-100 bg-gradient-to-br from-white via-sky-50/50 to-white p-6 shadow-sm">
              <h2 className="mb-3 text-xs font-medium tracking-[0.2em] text-slate-500">
                CAR BOUTIQUEのひと言
              </h2>
              <p className="text-sm leading-relaxed text-slate-800">
                {item.editorNote ??
                  "このニュースに対するCAR BOUTIQUEとしての視点や、一歩踏み込んだコメントは順次追加していきます。とりあえず今は、元記事の内容とご自身の興味を重ね合わせながら読んでみてください。"}
              </p>
            </div>
          </section>

          {/* 情報カード */}
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
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-xs text-slate-700 shadow-sm">
                <p className="mb-3 text-[11px] tracking-[0.18em] text-slate-500">
                  ORIGINAL ARTICLE
                </p>
                <p className="mb-4">
                  記事の全文は、配信元メディアでご確認いただけます。
                  CAR BOUTIQUE では、要約と独自の視点を添えてご紹介しています。
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

        {/* 関連ニュース */}
        {related.length > 0 && (
          <section className="mb-12 space-y-4">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-700">
              RELATED NEWS
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {related.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`}>
                  <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-xs text-slate-800 shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
                    <p className="text-[10px] font-medium tracking-[0.22em] text-brand-tiffanySoft">
                      {n.category || "NEWS"}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed">
                      {n.titleJa || n.title}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{n.sourceName ?? "EXTERNAL"}</span>
                      <span>{formatDate(n.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 戻るリンク */}
        <div className="mt-12 flex justify-between border-t border-slate-200 pt-6 text-xs">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-slate-500 transition hover:text-slate-900"
          >
            <span className="text-[10px]">←</span>
            <span className="tracking-[0.18em]">NEWS 一覧に戻る</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
