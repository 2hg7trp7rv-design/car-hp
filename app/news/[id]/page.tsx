// app/news/[id]/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

type Props = {
  params: { id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const items = (await getLatestNews(80)) as any[];
  const index = Number(params.id);
  const item = items[index];

  if (!item) {
    return (
      <div className="relative min-h-screen bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(129,216,208,0.65) 0%, rgba(129,216,208,0.65) 70%, #ffffff 100%)",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
          <p className="text-sm text-neutral-600">
            記事が見つかりませんでした。
          </p>
        </div>
      </div>
    );
  }

  const date = item.date ?? item.publishedAt ?? item.createdAt ?? "";
  const tags = Array.isArray(item.tags) ? item.tags : [];

  return (
    <div className="relative min-h-screen bg-white">
      {/* 背景 Tiffany 系グラデーション */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(129,216,208,0.65) 0%, rgba(129,216,208,0.65) 70%, #ffffff 100%)",
        }}
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {/* パンくず */}
          <nav className="text-[11px] text-neutral-500">
            <Link
              href="/"
              className="hover:text-neutral-700 hover:underline underline-offset-4"
            >
              Home
            </Link>
            <span className="mx-1">/</span>
            <Link
              href="/news"
              className="hover:text-neutral-700 hover:underline underline-offset-4"
            >
              News
            </Link>
          </nav>

          {/* 記事ヘッダー */}
          <header className="mt-4 rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm shadow-neutral-100 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.25em] text-sky-600">
              {item.category ?? "NEWS"}
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
              {item.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
              {date && <span>{date}</span>}
              {item.maker && (
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-[2px] text-[10px] text-neutral-600">
                  {item.maker}
                </span>
              )}
              {tags.length > 0 && (
                <span className="flex flex-wrap gap-1">
                  {tags.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2 py-[2px] text-[10px] text-neutral-500"
                    >
                      #{t}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </header>

          {/* 記事本文カード */}
          <article className="mt-5 rounded-2xl border border-neutral-200 bg-white/95 p-5 text-sm leading-relaxed text-neutral-800 shadow-sm shadow-neutral-100 backdrop-blur">
            {item.excerpt && (
              <p className="text-[13px] font-medium text-neutral-800">
                {item.excerpt}
              </p>
            )}

            {/* 本文があれば content を優先、なければ excerpt を軽く伸ばす */}
            <div className="mt-4 space-y-4 text-[13px] leading-7">
              {item.content ? (
                <p>{item.content}</p>
              ) : (
                <>
                  <p>
                    {item.excerpt ??
                      "この記事の本文は、今後追って追加していきます。ひとまず概要だけを静かなトーンでまとめています。"}
                  </p>
                  <p>
                    スペックの羅列ではなく、実際の乗り味や質感、日常での扱いやすさなど、クルマの空気感が伝わるような記事を目指しています。
                  </p>
                  <p>
                    内容は随時アップデートしていく予定ですので、気になるモデルがあればときどき覗いてみてください。
                  </p>
                </>
              )}
            </div>
          </article>

          {/* 下部リンク */}
          <div className="mt-8 flex justify-between text-[11px] text-neutral-500">
            <Link
              href="/news"
              className="underline-offset-4 hover:text-neutral-700 hover:underline"
            >
              ニュース一覧に戻る
            </Link>
            <Link
              href="/"
              className="underline-offset-4 hover:text-neutral-700 hover:underline"
            >
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
