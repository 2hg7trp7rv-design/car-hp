// app/news/[id]/page.tsx
import Link from "next/link";
import { getNewsById } from "@/lib/news";

type Props = {
  params: { id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const item = await getNewsById(params.id);

  if (!item) {
    return (
      <div className="space-y-3 text-xs text-slate-200">
        <p>指定されたニュースが見つかりませんでした。</p>
        <Link href="/news" className="text-sky-300 hover:text-sky-200">
          ニュース一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 border-b border-slate-800 pb-3">
        <p className="text-[11px] text-slate-400">
          {item.source ?? "ソース不明"}
          {item.publishedAt && ` ・ ${item.publishedAt}`}
        </p>
        <h1 className="text-xl font-semibold text-slate-50">{item.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          {item.maker && <span>{item.maker}</span>}
          {item.modelName && <span>・{item.modelName}</span>}
          {item.category && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
              {item.category}
            </span>
          )}
          {item.difficulty === "advanced" && (
            <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              マニアック寄り
            </span>
          )}
        </div>

        {(item.maker || item.modelName) && (
          <div className="pt-2 text-[11px]">
            <Link
              href={{
                pathname: "/cars",
                query: {
                  maker: item.maker ?? undefined,
                  q: item.modelName ?? undefined,
                },
              }}
              className="text-sky-300 hover:text-sky-200"
            >
              関連する車種を一覧で見る →
            </Link>
          </div>
        )}
      </header>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-[13px] leading-relaxed text-slate-100">
        {item.summary ? (
          <p className="whitespace-pre-line">{item.summary}</p>
        ) : (
          <p className="text-slate-400">要約はまだ登録されていません。</p>
        )}

        {item.tags.length > 0 && (
          <div className="pt-2 text-[11px] text-slate-300">
            <span className="mr-2 text-slate-400">タグ</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700 px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {item.referenceUrl && (
        <a
          href={item.referenceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs text-sky-300 hover:text-sky-200"
        >
          メーカー公式サイト・プレスリリースを見る
        </a>
      )}

      <div className="pt-2 text-xs">
        <Link href="/news" className="text-sky-300 hover:text-sky-200">
          ニュース一覧に戻る
        </Link>
      </div>
    </div>
  );
}
