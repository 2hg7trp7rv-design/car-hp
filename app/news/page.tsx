// app/news/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "ニュース一覧 | CAR BOUTIQUE",
  description:
    "主要メーカーや国内外メディアから厳選したニュースを、分かりやすく整理してお届けします。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    tag?: string;
  };
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function NewsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const categoryFilter = searchParams?.category ?? "";
  const tagFilter = searchParams?.tag ?? "";

  const items = await getLatestNews(80);

  const filtered = items.filter((item) => {
    const titleJa = (item.titleJa ?? "").toLowerCase();
    const excerpt = (item.excerpt ?? "").toLowerCase();

    const matchesQuery =
      q === "" ||
      item.title.toLowerCase().includes(q) ||
      titleJa.includes(q) ||
      excerpt.includes(q);

    const matchesCategory =
      categoryFilter === "" || item.category === categoryFilter;

    const matchesTag =
      tagFilter === "" ||
      (item.tags ?? []).some(
        (t) => t.toLowerCase() === tagFilter.toLowerCase(),
      );

    return matchesQuery && matchesCategory && matchesTag;
  });

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {/* 見出し */}
        <header className="mb-10">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            THE JOURNAL
          </p>
          <h1 className="font-display-serif mt-3 text-3xl font-semibold sm:text-4xl">
            ニュース一覧
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-sub">
            日々のニュースを、少しだけ丁寧に解説します。メーカー公式情報から独自ピックアップまで、
            「何が起きているのか」の背景が分かる形でまとめています。
          </p>
        </header>

        {/* ニュースカード一覧 */}
        <div className="space-y-4">
          {filtered.map((item) => {
            const title = item.titleJa || item.title;
            const sourceName = item.sourceName ?? "EXTERNAL";
            const dateLabel = formatDate(item.publishedAt);

            return (
              <GlassCard
                key={item.id}
                as="article"
                className="transition hover:shadow-lg"
              >
                <Link href={`/news/${item.id}`} className="block">
                  <div className="flex flex-col gap-2">
                    <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>

                    <h2 className="font-display-serif text-lg font-semibold leading-snug">
                      {title}
                    </h2>

                    {item.excerpt && (
                      <p className="text-xs leading-relaxed text-text-sub">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-1 flex items-center justify-between text-[11px] text-text-sub">
                      <p>{sourceName}</p>
                      <p>{dateLabel}</p>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            );
          })}
        </div>

        {/* 検索ヒットが0件のとき */}
        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-text-sub">
            条件に一致するニュースがありません。
          </p>
        )}
      </div>
    </main>
  );
}
