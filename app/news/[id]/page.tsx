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
      <div className="space-y-4">
        <p className="text-xs text-gray-400">ニュースが見つかりませんでした。</p>
        <Link href="/news" className="text-xs text-sky-400 hover:underline">
          ニュース一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs text-gray-400">
          {item.source ?? "ソース不明"}
          {item.publishedAt && `・${item.publishedAt}`}
        </p>
        <h1 className="text-lg font-semibold text-white">{item.title}</h1>
        {item.difficulty === "advanced" && (
          <span className="inline-block rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
            マニアック寄り
          </span>
        )}
      </header>

      {item.summary && (
        <p className="whitespace-pre-line text-xs leading-relaxed text-gray-100">
          {item.summary}
        </p>
      )}

      {item.referenceUrl && (
        <p className="mt-4 text-xs">
          <a
            href={item.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sky-400 hover:underline"
          >
            メーカー公式サイト・プレスリリースを見る
          </a>
        </p>
      )}

      <p className="mt-8 text-xs">
        <Link href="/news" className="text-sky-400 hover:underline">
          ニュース一覧に戻る
        </Link>
      </p>
    </div>
  );
}
