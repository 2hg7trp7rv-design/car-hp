// app/page.tsx
import Image from "next/image";
import { getLatestNews, type NewsItem } from "@/lib/news";
import TopNewsTabs from "@/components/TopNewsTabs";

function pickFeaturedForTop(all: NewsItem[]): NewsItem[] {
  const featured = all.filter((i) => i.featured);
  if (featured.length >= 3) {
    return featured.slice(0, 3);
  }

  const originals = all.filter((i) => i.type === "original");
  const pool: NewsItem[] = [];
  for (const item of [...featured, ...originals]) {
    if (!pool.find((p) => p.id === item.id)) {
      pool.push(item);
    }
    if (pool.length >= 3) break;
  }
  if (pool.length > 0) return pool.slice(0, 3);

  return all.slice(0, 3);
}

export default async function HomePage() {
  const all = await getLatestNews(40);
  const latest = all.slice(0, 3);
  const featured = pickFeaturedForTop(all);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f5f7] via-white to-white text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
              {/* ヒーローセクション */}
      <section className="mt-8 rounded-[32px] bg-gradient-to-r from-[#CDEFF2] via-white to-white px-6 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12">
        <div className="space-y-6">
          {/* キャッチコピー */}
          <div className="space-y-4">
            <p className="text-[11px] tracking-[0.25em] text-sky-800">
              CAR BOUTIQUE
            </p>
            <h1 className="text-2xl font-semibold tracking-wide text-slate-900 sm:text-3xl">
              クルマを愉しむ人のためのカーサイト
            </h1>
            <p className="text-[13px] leading-relaxed text-slate-700 sm:text-sm">
              最新ニュース、試乗記、技術解説から中古車の目利きまで。派手な煽りよりも、
              上質な情報と読み心地のよさを大切にした静かなトーンのクルマメディアです。
            </p>
          </div>

          {/* ヒーロー画像カード（画像だけ残す） */}
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-slate-900/70 shadow-[0_18px_40px_rgba(15,23,42,0.7)]">
            <div className="relative h-[230px] sm:h-[300px]">
              <img
                src="/images/hero-sedan.jpg"
                alt="静かなスタジオで佇むセダン"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

        <TopNewsTabs latest={latest} featured={featured} />

        {/* ここより下に、車種一覧や技術解説への導線セクションを将来追加していくイメージ */}
      </main>
    </div>
  );
}
