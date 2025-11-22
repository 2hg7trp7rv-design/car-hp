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
        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)] lg:items-stretch">
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] tracking-[0.2em] text-slate-500">
                CAR BOUTIQUE
              </p>
              <h1 className="text-2xl font-semibold tracking-wide text-slate-900 sm:text-3xl">
                クルマを愉しむ人のためのカーサイト
              </h1>
              <p className="max-w-md text-[13px] leading-relaxed text-slate-600">
                最新ニュース、試乗記、技術解説から中古車の目利きまで。
                派手な煽りよりも、上質な情報と読み心地のよさを大切にした
                静かなトーンのクルマメディアです。
              </p>
            </div>
            <div className="mt-6 text-[11px] text-slate-500">
              モノトーンの紙面に、ティファニーブルーをひとしずく。
              情報量の多いクルマの世界を、少し余裕を持たせて並べていきます。
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-slate-900">
            <Image
              src="/images/hero-sedan.jpg"
              alt="スタジオで静かにたたずむラグジュアリーセダン"
              fill
              priority
              className="object-cover opacity-90"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1f2933]/80 via-[#1f2933]/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.25em] text-sky-100">
                QUIET STUDIO
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-50">
                モノトーンのスタジオライティングのなかで、
                光と陰のコントラストだけで静かな存在感を描きます。
                派手な演出ではなく、淡々とした上質さを追いかける場所です。
              </p>
            </div>
          </div>
        </section>

        <TopNewsTabs latest={latest} featured={featured} />

        {/* ここより下に、車種一覧や技術解説への導線セクションを将来追加していくイメージ */}
      </main>
    </div>
  );
}
