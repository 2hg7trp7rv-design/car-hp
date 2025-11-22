// app/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  searchParams?: {
    tab?: string;
  };
};

export default async function HomePage({ searchParams }: Props) {
  const tabParam = searchParams?.tab === "featured" ? "featured" : "latest";

  const allNews = await getLatestNews(30);
  const latest = allNews.slice(0, 5);
  const featured = allNews.filter((n) => n.featured).slice(0, 5);

  const activeItems = tabParam === "featured" ? featured : latest;

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#dff5ff] via-white to-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-12 pt-10 md:px-6 md:pt-12">
        <HeroIntro />
        <NewsHomeSection
          activeTab={tabParam}
          latest={latest}
          featured={featured}
          activeItems={activeItems}
        />
        <CategoryCardsSection />
      </div>
    </main>
  );
}

function HeroIntro() {
  return (
    <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-md md:px-10 md:py-10">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-sky-500">
        CAR BOUTIQUE
      </p>
      <h1 className="mt-3 text-2xl font-semibold leading-snug text-slate-900 md:text-[28px]">
        クルマを愉しむ人のためのカーサイト
      </h1>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-700 md:text-[14px]">
        最新ニュース、試乗記、技術解説から中古車の目利きまで。派手な煽りよりも、
        上質な情報と読み心地のよさを大切にした静かなトーンのクルマメディアです。
      </p>
    </section>
  );
}

type NewsHomeSectionProps = {
  activeTab: "latest" | "featured";
  latest: NewsItem[];
  featured: NewsItem[];
  activeItems: NewsItem[];
};

function NewsHomeSection({
  activeTab,
  latest,
  featured,
  activeItems,
}: NewsHomeSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
          最新ニュース
        </h2>
        <Link
          href="/news"
          className="text-[12px] font-medium text-sky-600 hover:text-sky-700"
        >
          ニュース一覧へ
        </Link>
      </div>

      <div className="inline-flex rounded-full bg-slate-100/80 p-1 text-[12px]">
        <Link
          href="/?tab=latest"
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            activeTab === "latest"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          最新ニュース
        </Link>
        <Link
          href="/?tab=featured"
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            activeTab === "featured"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          注目ニュース
        </Link>
      </div>

      <div className="space-y-3 text-[12px] text-slate-700">
        {activeTab === "featured" && featured.length === 0 && (
          <p className="text-slate-500">
            注目ニュースに設定された記事がまだありません。
          </p>
        )}

        {activeItems.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const displayTitle = item.titleJa ?? item.title;
  const dateLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
    : "";

  const typeLabel =
    item.type === "original"
      ? "Original"
      : item.sourceName
      ? "External"
      : "News";

  const typeBadgeClass =
    item.type === "original"
      ? "bg-slate-200 text-slate-700"
      : "bg-emerald-100 text-emerald-700";

  const wrapper =
    item.type === "external" && item.sourceUrl
      ? {
          href: item.sourceUrl,
          target: "_blank" as const,
          rel: "noreferrer",
        }
      : {
          href: `/news/${encodeURIComponent(item.id)}`,
          target: "_self" as const,
          rel: undefined,
        };

  return (
    <Link
      {...wrapper}
      className="block rounded-3xl border border-white/70 bg-white/90 px-4 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.10)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] md:px-5 md:py-5"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {item.sourceName && (
          <span className="rounded-full bg-sky-900 px-2.5 py-0.5 text-[11px] font-semibold text-sky-50">
            {item.sourceName}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeBadgeClass}`}
        >
          {typeLabel}
        </span>
        {item.category && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">
            {item.category}
          </span>
        )}
      </div>

      <h3 className="mt-2 text-[14px] font-semibold leading-snug text-slate-900 md:text-[15px]">
        {displayTitle}
      </h3>

      {item.excerpt && (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
          {item.excerpt}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {item.type === "external"
            ? item.sourceName ?? "外部サイト"
            : "CAR BOUTIQUE"}
        </span>
        {dateLabel && <span>{dateLabel}</span>}
      </div>
    </Link>
  );
}

function CategoryCardsSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
        セクションガイド
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-sky-500">
            DRIVE NOTE
          </p>
          <h3 className="mt-2 text-[14px] font-semibold text-slate-900">
            試乗記と乗り味のノート
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            最新モデルから少し前の名車まで、気になるクルマを静かな視点で丁寧にレビューします。
            スペックだけでなく、乗り味や質感のニュアンスを言葉にしていきます。
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-sky-500">
            TECH FOCUS
          </p>
          <h3 className="mt-2 text-[14px] font-semibold text-slate-900">
            技術解説
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            エンジン、電動化、シャシー、先進運転支援まで。
            難しい専門用語は控えめに、メカ好きも納得できる深さで仕組みをひもときます。
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-sky-500">
            USED LOUNGE
          </p>
          <h3 className="mt-2 text-[14px] font-semibold text-slate-900">
            中古車の目利き
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            気になるモデルの持病や年式ごとの違い、買う前に見ておきたいポイントを整理します。
            じっくり選びたい人のための中古車リファレンスをめざします。
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-sky-500">
            HERITAGE
          </p>
          <h3 className="mt-2 text-[14px] font-semibold text-slate-900">
            クルマの歴史
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            名車が生まれた背景や時代ごとのデザインの流れを、写真とともにゆっくり振り返ります。
            好きなブランドの系譜を、カタログを見るような感覚でたどっていけるコーナーです。
          </p>
        </div>
      </div>
    </section>
  );
}
