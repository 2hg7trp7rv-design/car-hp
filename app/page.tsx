// app/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export const revalidate = 300;

type LatestNewsItem = {
  id: string | number;
  title: string;
  summary?: string;
  source?: string;
  publishedAt?: string;
  url?: string;
};

export default async function HomePage() {
  const rawItems: any[] = await getLatestNews(6);

  const latestNews: LatestNewsItem[] = rawItems.map((item, index) => ({
    id: item.id ?? index,
    title: item.title ?? "",
    summary:
      item.summary ??
      item.excerpt ??
      item.description ??
      "",
    source:
      item.source ??
      item.siteName ??
      item.feedTitle ??
      "",
    publishedAt:
      item.publishedAt ??
      item.date ??
      item.isoDate ??
      "",
    url: item.url ?? item.link ?? "#",
  }));

  const primaryNews = latestNews.slice(0, 3);
  const secondaryNews = latestNews.slice(3, 6);

  return (
    <main
      className="min-h-screen text-neutral-900"
      style={{
        // 横方向に、少し薄めたTiffany系カラーから白へ滑らかに変化させた40:60グラデーション
        // 左0〜40%がTiffany系（#0ABAB5を少しミント寄りにした帯）、40〜100%で白にフェード
        backgroundImage:
          "linear-gradient(90deg, #c9f3ee 0%, #90ded7 20%, #0ABAB5 32%, #e9faf7 40%, #ffffff 100%)",
      }}
    >
      {/* ヒーロー: フルページ画像＋オーバーレイ＋コピー */}
      <section className="relative overflow-hidden">
        {/* トップページで使うヒーロー画像 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-sedan.jpg')",
          }}
          aria-hidden="true"
        />
        {/* 黒の薄いグラデーションオーバーレイ（文字の視認性確保） */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/65"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex min-h-[520px] max-w-5xl flex-col justify-center px-4 py-16 text-white">
          <p className="mb-4 text-xs tracking-[0.28em] text-white/70">
            CURATED AUTOMOTIVE JOURNAL
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Driving Elegance.
          </h1>
          <p className="mb-4 max-w-xl text-sm leading-relaxed text-white/85">
            車のニュースと、その先にある物語を。静かな時間の中で、愛車と未来を想うための場所です。
          </p>
          <p className="mb-8 max-w-xl text-xs leading-relaxed text-white/75">
            大手メディアの速報を選び取りつつ、オーナーの視点から少し深く解説していく小さなブティックメディアです。
          </p>

          <div className="space-y-2 text-[11px] text-white/75">
            <p className="tracking-[0.24em]">CAR BOUTIQUE</p>
            <p className="max-w-xl">
              ニュースは自動で集め、本音のコラムとガイドは手で編んでいく。その二つが混ざり合う場所を目指しています。
            </p>
          </div>
        </div>
      </section>

      {/* ダッシュボードエリア（カードにふわっとした影） */}
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-10 pt-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/news"
            className="rounded-[28px] border border-black/10 bg-neutral-900/95 px-5 py-4 text-neutral-50 shadow-xl shadow-black/25 backdrop-blur"
          >
            <p className="text-[11px] tracking-[0.24em] text-white/60">
              NEWS
            </p>
            <h2 className="mt-1 text-base font-semibold">
              最新ニュース
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-white/72">
              国内外の主要メディアから集めたトピックを、見出しの一覧でさっと追えるように。
            </p>
          </Link>

          <Link
            href="/column"
            className="rounded-[28px] border border-black/10 bg-neutral-900/95 px-5 py-4 text-neutral-50 shadow-xl shadow-black/25 backdrop-blur"
          >
            <p className="text-[11px] tracking-[0.24em] text-white/60">
              COLUMN
            </p>
            <h2 className="mt-1 text-base font-semibold">
              コラムとストーリー
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-white/72">
              オーナー目線の本音や、修理体験、技術の話をじっくり読むための場所。
            </p>
          </Link>

          <Link
            href="/guide"
            className="rounded-[28px] border border-white/60 bg-white/95 px-5 py-4 text-neutral-900 shadow-xl shadow-teal-500/20 backdrop-blur"
          >
            <p className="text-[11px] tracking-[0.24em] text-neutral-500">
              GUIDE
            </p>
            <h2 className="mt-1 text-base font-semibold">
              お金と暮らしのガイド
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-700">
              買い方、売り方、維持費や保険など、暮らしに近い視点で車と向き合うための実用ガイド。
            </p>
          </Link>

          <Link
            href="/cars"
            className="rounded-[28px] border border-white/60 bg-white/95 px-5 py-4 text-neutral-900 shadow-xl shadow-teal-500/20 backdrop-blur"
          >
            <p className="text-[11px] tracking-[0.24em] text-neutral-500">
              CARS
            </p>
            <h2 className="mt-1 text-base font-semibold">
              車種からさがす
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-700">
              スペックや長所短所、トラブル傾向を一つのページにまとめた車種データの入り口。
            </p>
          </Link>
        </div>
      </section>

      {/* 最新ニュースセクション */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] tracking-[0.24em] text-neutral-600">
              NEWS
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              最新ニュース
            </h2>
          </div>
          <Link
            href="/news"
            className="text-[11px] font-medium text-teal-700 underline-offset-2 hover:underline"
          >
            すべてのニュースを見る
          </Link>
        </div>

        {/* 上段: 注目ニュース（3件） */}
        <div className="grid gap-4 sm:grid-cols-3">
          {primaryNews.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-[24px] border border-white/80 bg-white/96 p-4 text-sm shadow-xl shadow-teal-500/15"
            >
              <div className="mb-3">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                  {item.source && <span>{item.source}</span>}
                  {item.publishedAt && <span>{item.publishedAt}</span>}
                </div>
                <h3 className="text-sm font-medium leading-snug tracking-tight">
                  {item.url ? (
                    <Link
                      href={item.url}
                      target="_blank"
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
              </div>
              {item.summary && (
                <p className="mb-3 line-clamp-3 text-[12px] leading-relaxed text-neutral-600">
                  {item.summary}
                </p>
              )}
              {item.url && (
                <div className="mt-auto">
                  <Link
                    href={item.url}
                    target="_blank"
                    className="text-[11px] font-medium text-teal-700 underline underline-offset-2"
                  >
                    元記事を読む
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* 下段: そのほかの最新ニュース（3件） */}
        {secondaryNews.length > 0 && (
          <div className="mt-6 space-y-3 rounded-[24px] border border-white/80 bg-white/94 p-4 text-sm shadow-xl shadow-teal-500/15">
            {secondaryNews.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-1 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                  {item.source && <span>{item.source}</span>}
                  {item.publishedAt && <span>{item.publishedAt}</span>}
                </div>
                <h3 className="text-sm font-medium leading-snug tracking-tight">
                  {item.url ? (
                    <Link
                      href={item.url}
                      target="_blank"
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.summary && (
                  <p className="text-[12px] leading-relaxed text-neutral-600 line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
