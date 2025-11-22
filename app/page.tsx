// app/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  searchParams?: {
    tab?: string;
  };
};

export default async function HomePage({ searchParams }: Props) {
  const items = await getLatestNews(30);

  const latest = items.slice(0, 3);
  const featured = items.filter((item) => item.featured).slice(0, 3);

  const activeTab = searchParams?.tab === "featured" ? "featured" : "latest";
  const activeList = activeTab === "featured" ? featured : latest;

  return (
    <div className="space-y-10">
      {/* ヒーロー画像セクション（画像＋コピーのみ） */}
      <section className="relative">
        <div
          className="relative h-[380px] w-full overflow-hidden md:h-[460px]"
          style={{
            backgroundImage: "url(/images/hero-sedan.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* 少し暗くするオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/30 to-slate-900/5" />

          {/* 画像上のコピー用ホワイトパネル（範囲を限定） */}
          <div className="relative flex h-full items-end px-4 pb-7 md:px-10 md:pb-10">
            <div className="max-w-xl rounded-3xl bg-white/78 px-5 py-4 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md md:px-6 md:py-5">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-sky-500">
                CAR BOUTIQUE
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-snug md:text-3xl">
                クルマを愉しむ人のためのカーサイト
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
                最新ニュース、試乗記、技術解説から中古車の目利きまで。派手な煽りよりも、
                上質な情報と読み心地のよさを大切にした静かなトーンのクルマメディアです。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ニュースタブ＋カードセクション（ヒーローとは独立） */}
      <section className="px-2 pb-10 md:px-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* タブ切り替え */}
          <div className="flex">
            <div className="inline-flex rounded-full bg-white/80 p-1 text-[12px] shadow-[0_14px_40px_rgba(15,23,42,0.25)] backdrop-blur-md">
              <Link
                href={{ pathname: "/", query: { tab: "latest" } }}
                className={`rounded-full px-4 py-1.5 font-semibold transition ${
                  activeTab === "latest"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                最新ニュース
              </Link>
              <Link
                href={{ pathname: "/", query: { tab: "featured" } }}
                className={`rounded-full px-4 py-1.5 font-semibold transition ${
                  activeTab === "featured"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                注目ニュース
              </Link>
            </div>
          </div>

          {/* 見出し＋一覧への導線 */}
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-800">
              {activeTab === "latest" ? "最新ニュース" : "注目ニュース"}
            </h2>
            <Link
              href="/news"
              className="text-[12px] text-sky-700 underline-offset-2 hover:text-sky-500 hover:underline"
            >
              ニュース一覧へ
            </Link>
          </div>

          {/* ニュースカード */}
          {activeList.length === 0 ? (
            <p className="px-1 text-xs text-slate-500">
              まだニュースが取得できていません。しばらくしてからもう一度ご覧ください。
            </p>
          ) : (
            <div className="space-y-3">
              {activeList.map((item) => (
                <HomeNewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* トップページ用ニュースカード
   日本語タイトル（titleJa）があれば優先表示 */
function HomeNewsCard({ item }: { item: NewsItem }) {
  const displayTitle = item.titleJa ?? item.title;
  const isExternal = item.type === "external" && !!item.sourceUrl;

  const href = isExternal
    ? (item.sourceUrl as string)
    : `/news/${encodeURIComponent(item.id)}`;

  const dateLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
    : "";

  const sourceLabel =
    item.sourceName ?? (item.type === "original" ? "CAR BOUTIQUE" : "News");

  const typeLabel = item.type === "external" ? "External" : "Original";

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="block rounded-[32px] border border-sky-50 bg-white/95 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_22px_65px_rgba(15,23,42,0.28)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-[#8fdde7] px-2.5 py-0.5 font-semibold text-slate-900">
              {sourceLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
              {typeLabel}
            </span>
            {item.category && (
              <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-slate-500">
                {item.category}
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-semibold leading-snug text-slate-900">
            {displayTitle}
          </h3>

          {item.excerpt && (
            <p className="text-[12px] leading-relaxed text-slate-600">
              {item.excerpt}
            </p>
          )}

          <p className="text-[11px] text-slate-400">
            {sourceLabel}
            {dateLabel && `　${dateLabel}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
