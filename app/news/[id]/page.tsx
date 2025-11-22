// app/news/[id]/page.tsx
import Link from "next/link";
import { getNewsById, type NewsItem } from "@/lib/news";

type Props = {
  params: { id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const item = await getNewsById(params.id);

  if (!item) {
    return (
      <div className="bg-gradient-to-r from-[#e4f4f7] via-white to-white">
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 md:px-6">
          <p className="text-sm text-slate-600">
            指定されたニュースが見つかりませんでした。
          </p>
          <div className="mt-4">
            <Link
              href="/news"
              className="text-[13px] font-semibold text-sky-700 hover:text-sky-500"
            >
              ニュース一覧へ戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const displayTitle = item.titleJa ?? item.title;
  const dateLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  const isExternal = item.type === "external";

  return (
    <div className="bg-gradient-to-r from-[#e4f4f7] via-white to-white">
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 md:px-6">
        <article className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.14)] backdrop-blur">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-sky-500">
            CAR BOUTIQUE JOURNAL
          </p>

          <h1 className="mt-3 text-xl font-semibold text-slate-900">
            {displayTitle}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {item.sourceName && (
              <span className="rounded-full bg-sky-900/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-sky-50">
                {item.sourceName}
              </span>
            )}
            <span
              className={
                "rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide " +
                (isExternal
                  ? "bg-[#d7f5f5] text-[#007c7c]"
                  : "bg-slate-100 text-slate-500")
              }
            >
              {isExternal ? "External" : "Original"}
            </span>
            {item.category && (
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                {item.category}
              </span>
            )}
            {dateLabel && (
              <span className="text-slate-400">公開日: {dateLabel}</span>
            )}
          </div>

          {item.excerpt && (
            <p className="mt-4 border-l-2 border-sky-200 pl-4 text-[13px] leading-relaxed text-slate-600">
              {item.excerpt}
            </p>
          )}

          {/* 本文 or 外部リンク案内 */}
          {item.type === "original" && item.content ? (
            <div className="mt-6 space-y-4 text-[13px] leading-relaxed text-slate-700">
              {item.content.split(/\n{2,}/).map((para, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-3 text-[13px] text-slate-650">
              <p>
                詳細な本文は元サイトに掲載されています。静かなトーンで眺めたい方のために、リンクだけをそっと置いておきます。
              </p>
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2 text-[12px] font-semibold text-white shadow-sm shadow-sky-200/80 transition hover:bg-sky-700"
                >
                  元記事を開く
                  <span className="text-[10px] opacity-80">↗</span>
                </a>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-4 text-right">
            <Link
              href="/news"
              className="text-[12px] font-semibold text-sky-700 hover:text-sky-500"
            >
              ニュース一覧へ戻る →
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
