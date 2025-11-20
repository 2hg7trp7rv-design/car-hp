// app/news/[id]/page.tsx
import Link from "next/link";
import { getAllNewsIds, getNewsById } from "@/lib/news";

type Props = {
  params: { id: string };
};

export async function generateStaticParams() {
  const ids = await getAllNewsIds();
  return ids.map((id) => ({ id }));
}

export default async function NewsDetailPage({ params }: Props) {
  const item = await getNewsById(params.id);

  if (!item) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-gray-400">ニュースが見つかりませんでした。</p>
        <Link href="/news" className="text-xs text-blue-400 underline">
          ニュース一覧に戻る
        </Link>
      </div>
    );
  }

  const metaParts: string[] = [];
  if (item.source) metaParts.push(item.source);
  if (item.publishedAt) metaParts.push(item.publishedAt);
  if (item.category) metaParts.push(item.category);
  const metaLine = metaParts.join("・");

  const carParts: string[] = [];
  if (item.maker) carParts.push(item.maker);
  if (item.modelName) carParts.push(item.modelName);
  const carLine = carParts.join(" ");

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <p className="text-[11px] text-gray-400">
          <Link href="/news" className="underline">
            ニュース一覧に戻る
          </Link>
        </p>
        <h1 className="text-lg font-semibold text-white">{item.title}</h1>
        {metaLine && (
          <p className="text-[11px] text-gray-400">{metaLine}</p>
        )}
        {carLine && (
          <p className="text-[11px] text-gray-400">{carLine}</p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-700 px-2 py-0.5 text-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {item.summary && (
        <p className="text-[12px] leading-relaxed text-gray-100 whitespace-pre-line">
          {item.summary}
        </p>
      )}

      {item.referenceUrl && (
        <a
          href={item.referenceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-[12px] text-blue-400 underline"
        >
          メーカー公式サイト・プレスリリースを見る
        </a>
      )}
    </div>
  );
}
