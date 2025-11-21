// app/news/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLatestNews } from "@/lib/news";

type Props = {
  params: {
    id: string;
  };
};

export default async function NewsDetailPage({ params }: Props) {
  const items = (await getLatestNews(80)) as any[];

  const index = Number(params.id);

  // 数値でない、範囲外なら404
  if (!Number.isInteger(index) || index < 0 || index >= items.length) {
    notFound();
  }

  const item = items[index];
  const date =
    item.date ??
    item.publishedAt ??
    item.createdAt ??
    "";

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-600">
              News
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
              {item.title}
            </h1>
          </div>
          <div className="hidden text-right text-[11px] text-neutral-500 sm:block">
            {date && <p>{date}</p>}
            {item.maker && <p>{item.maker}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-sky-700">
              {item.category ?? "NEWS"}
            </span>
            {Array.isArray(item.tags) &&
              item.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] text-neutral-500"
                >
                  {tag}
                </span>
              ))}
          </div>
          <div className="text-right text-[11px] text-neutral-500 sm:hidden">
            {date && <p>{date}</p>}
            {item.maker && <p>{item.maker}</p>}
          </div>
        </div>

        <article className="rounded-2xl border border-neutral-200 bg-white/90 p-6 text-sm leading-relaxed text-neutral-700 shadow-sm shadow-neutral-100">
          {item.excerpt && (
            <p className="mb-4 text-neutral-600">{item.excerpt}</p>
          )}

          {"content" in item && item.content ? (
            <div className="space-y-4 text-sm leading-relaxed text-neutral-800">
              {typeof item.content === "string" ? (
                <p>{item.content}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-neutral-500">詳細本文は現在準備中です。</p>
          )}
        </article>

        <div className="mt-8 flex justify-between text-[11px] text-neutral-500">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sky-700 underline-offset-4 hover:underline"
          >
            ← ニュース一覧に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
