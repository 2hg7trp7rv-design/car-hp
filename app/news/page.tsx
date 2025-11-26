// app/news/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "ニュース一覧 | CAR BOUTIQUE",
  description:
    "クルマの最新ニュースを、要約とCAR BOUTIQUE目線のコメント付きでピックアップ。気になるメーカーやカテゴリからも絞り込めます。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  };
};

function normalizeText(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

export default async function NewsPage({ searchParams }: Props) {
  const q = normalizeText(searchParams?.q);
  const categoryFilter = (searchParams?.category ?? "").trim();
  const makerFilter = (searchParams?.maker ?? "").trim();
  const tagFilter = (searchParams?.tag ?? "").trim();

  const items = await getLatestNews(80);

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as string[];

  const makers = Array.from(
    new Set(items.map((i) => i.maker).filter(Boolean)),
  ) as string[];

  const tags = Array.from(
    new Set(items.flatMap((i) => i.tags ?? [])),
  ) as string[];

  const filtered = items.filter((item) => {
    if (q) {
      const haystack =
        `${item.title} ${item.titleJa ?? ""} ${item.excerpt ?? ""} ${item.maker ?? ""} ${item.category ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (makerFilter && item.maker !== makerFilter) return false;
    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">NEWS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-3">
          <Reveal>
            <p className="text-[10px] tracking-[0.32em] text-text-sub">
              CURATED CAR NEWS
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              クルマのニュースを
              <span className="inline-block bg-gradient-to-r from-tiffany-500 to-tiffany-700 bg-clip-text text-transparent">
                編集目線
              </span>
              でピックアップ。
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="max-w-2xl text-sm leading-relaxed text-text-sub">
              国内外のニュースから、クルマ好きが押さえておきたいトピックを中心に、
              要約とCAR BOUTIQUEとしてのひと言コメント付きで集めていく予定です。
            </p>
          </Reveal>
        </header>

        {/* フィルターバー（検索＋カテゴリ＋メーカー＋タグ） */}
        <Reveal delay={200}>
          <section className="mb-8 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <form
              action="/news"
              method="get"
              className="space-y-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* キーワード検索 */}
                <div className="w-full md:w-2/5">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    KEYWORD
                  </label>
                  <input
                    name="q"
                    defaultValue={searchParams?.q ?? ""}
                    placeholder="車名・メーカー・キーワードで探す"
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  />
                </div>

                {/* セレクト群 */}
                <div className="flex w-full flex-col gap-3 md:w-3/5 md:flex-row">
                  <div className="w-full md:w-1/3">
                    <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                      CATEGORY
                    </label>
                    <select
                      name="category"
                      defaultValue={categoryFilter}
                      className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    >
                      <option value="">すべて</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                      MAKER
                    </label>
                    <select
                      name="maker"
                      defaultValue={makerFilter}
                      className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    >
                      <option value="">すべて</option>
                      {makers.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                      TAG
                    </label>
                    <select
                      name="tag"
                      defaultValue={tagFilter}
                      className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    >
                      <option value="">すべて</option>
                      {tags.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* フィルター適用ボタン */}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
                >
                  絞り込み
                </button>
              </div>
            </form>
          </section>
        </Reveal>

        {/* NEWSリスト */}
        <Reveal delay={260}>
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                LATEST NEWS
              </h2>
              <p className="text-[11px] text-slate-400">
                {filtered.length}件表示中
              </p>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
                条件に合致するニュースが見つかりませんでした。
                絞り込み条件を緩めて再度お試しください。
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <NewsListItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* NEWSから他セクションへの回遊導線 */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <Link href="/cars">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                CARS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                ニュースで気になったクルマは、スペックと「性格」もまとめて確認。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                パワートレーンやボディサイズといった数字だけでなく、
                そのクルマが得意なシーンや維持費感、トラブル傾向なども
                少しずつ整理していきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                CARSページへ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>

          <Link href="/column">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                COLUMN
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                ニュースの裏側や、オーナーの本音はコラムでじっくり。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                試乗記や技術解説だけでなく、「買ってからどうだったか」
                「壊れたときいくらかかったか」といったリアルな話は、
                COLUMNセクションで深掘りしていきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                コラム一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}

type NewsListItemProps = {
  item: NewsItem;
};

function NewsListItem({ item }: NewsListItemProps) {
  const title = item.titleJa ?? item.title;

  return (
    <Link href={`/news/${encodeURIComponent(item.id)}`}>
      <article className="group rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-[2px] hover:border-slate-300 hover:shadow-soft-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              {item.maker && (
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {item.maker}
                </span>
              )}
              {item.category && (
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {item.category}
                </span>
              )}
              {item.tags &&
                item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-50 px-2 py-1 group-hover:bg-slate-900 group-hover:text-white"
                  >
                    #{tag}
                  </span>
                ))}
            </div>

            <h2 className="text-sm font-semibold leading-relaxed text-slate-900">
              {title}
            </h2>

            {item.excerpt && (
              <p className="text-[11px] leading-relaxed text-text-sub line-clamp-2">
                {item.excerpt}
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-col items-end gap-1 text-right text-[10px] text-slate-400 md:mt-0 md:w-36">
            {item.publishedAtJa && (
              <p className="font-medium tracking-[0.16em]">
                {item.publishedAtJa}
              </p>
            )}
            <p className="text-[10px]">
              出典:
              <span className="ml-1 underline decoration-slate-300 underline-offset-2 group-hover:decoration-slate-500">
                {item.sourceName ?? "外部サイト"}
              </span>
            </p>
          </div>
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
          {item.commentJa ||
            "詳細は記事ページと元記事にてご確認ください。CAR BOUTIQUEとしてのコメントも順次追加していきます。"}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-50 px-2 py-1 group-hover:bg-slate-900 group-hover:text-white"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="rounded-full bg-slate-50 px-2 py-1">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
