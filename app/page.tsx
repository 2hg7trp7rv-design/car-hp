// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getLatestNews, type NewsItem } from "@/lib/news";

export default async function HomePage() {
  // ニュースを多めに取得して、このページ用に絞り込む
  const items = await getLatestNews(30);

  const latest = items.slice(0, 3);
  const featured = items.filter((item) => item.featured).slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-[#e4f4f7] via-white to-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-8 md:px-6 md:pt-10">
        {/* ヒーロー: 画像全面＋上にテキスト */}
        <section className="relative overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
          <div className="relative isolate">
            <Image
              src="/images/hero-sedan.jpg"
              alt="クルマのスタジオライティング"
              width={1600}
              height={900}
              priority
              className="h-[280px] w-full object-cover md:h-[360px]"
            />

            {/* 上からの暗めグラデーション */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/65 to-slate-900/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

            {/* テキストブロック */}
            <div className="relative z-10 flex h-full flex-col justify-center px-6 py-8 md:px-10 md:py-10">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-sky-200">
                CAR BOUTIQUE
              </p>
              <h1 className="mt-3 text-2xl font-semibold leading-snug text-white md:text-3xl">
                クルマを愉しむ人のためのカーサイト
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-100/90">
                最新ニュース、試乗記、技術解説から中古車の目利きまで。派手な煽りよりも、上質な情報と読み心地のよさを大切にした静かなトーンのクルマメディアです。
              </p>
            </div>
          </div>
        </section>

        {/* トップニュース（最新＋注目） */}
        <TopNewsSection latest={latest} featured={featured} />
      </main>
    </div>
  );
}

function TopNewsSection(props: { latest: NewsItem[]; featured: NewsItem[] }) {
  const { latest, featured } = props;

  return (
    <section className="space-y-4">
      {/* タブ風ラベル */}
      <div className="inline-flex rounded-full bg-white/70 p-1 shadow-md shadow-sky-100/80">
        <span className="rounded-full bg-slate-900 px-4 py-1 text-[11px] font-semibold tracking-wide text-white">
          最新ニュース
        </span>
        <span className="rounded-full px-4 py-1 text-[11px] font-semibold tracking-wide text-slate-500">
          注目ニュース
        </span>
      </div>

      {/* 2カラム（スマホでは縦並び） */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 最新ニュース */}
        <div className="space-y-3">
          {latest.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {/* 注目ニュース */}
        <div className="space-y-3">
          {featured.length === 0 ? (
            <p className="text-xs text-slate-500">
              注目ニュースはまだ準備中です。
            </p>
          ) : (
            featured.map((item) => <NewsCard key={item.id} item={item} />)
          )}
        </div>
      </div>

      <div className="pt-1 text-right">
        <Link
          href="/news"
          className="text-[11px] font-semibold text-sky-700 hover:text-sky-500"
        >
          ニュース一覧へ →
        </Link>
      </div>
    </section>
  );
}

// 日本語タイトル優先＋外部/オリジナルでラベル色を切り替えたカード
function NewsCard({ item }: { item: NewsItem }) {
  const displayTitle = item.titleJa ?? item.title;
  const dateLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
    : "";

  const isExternal = item.type === "external";

  const typeBadgeClass = isExternal
    ? "bg-[#d7f5f5] text-[#007c7c]" // 外部:ティファニーブルー系
    : "bg-slate-100 text-slate-500"; // オリジナル:淡グレー

  return (
    <a
      href={item.sourceUrl ?? `/news/${encodeURIComponent(item.id)}`}
      target={item.sourceUrl ? "_blank" : undefined}
      rel={item.sourceUrl ? "noreferrer" : undefined}
      className="block rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.16)]"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
        {item.sourceName && (
          <span className="rounded-full bg-sky-900/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-sky-50">
            {item.sourceName}
          </span>
        )}
        <span
          className={
            "rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide " +
            typeBadgeClass
          }
        >
          {isExternal ? "External" : "Original"}
        </span>
        {item.category && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
            {item.category}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold leading-relaxed text-slate-900">
        {displayTitle}
      </p>

      {item.excerpt && (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          {item.excerpt}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">
          {item.maker ?? item.sourceName ?? "car boutique"}
        </span>
        {dateLabel && <span>{dateLabel}</span>}
      </div>
    </a>
  );
}
