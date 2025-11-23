import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface NewsCardProps {
  title: string;
  publishedAt: string;
  sourceUrl: string;
  sourceName?: string; // 媒体名があれば表示
  summary?: string;    // 要約があれば表示
}

export function NewsCard({ title: titleText, publishedAt, sourceUrl, sourceName, summary }: NewsCardProps) {
  // 日付のフォーマット（例：3時間前）
  const relativeDate = formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: ja });

  // 日付のフォーマット（例：2025/11/20）
  const formattedDate = new Date(publishedAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  });


  return (
    <article 
      className="
        bg-white/80 backdrop-blur-sm rounded-2xl p-6
        border border-tiffany-100/50
        shadow-[0_4px_20px_rgb(0,0,0,0.03)]
        hover:shadow-soft hover:bg-white hover:-translate-y-0.5
        transition-all duration-300 ease-out
      "
    >
      <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="flex items-center justify-between mb-3 text-sm">
            {sourceName && (
                 <span className="px-2 py-0.5 bg-tiffany-50 text-tiffany-700 rounded-full font-medium text-xs tracking-wider">
                     {sourceName}
                 </span>
            )}
            <time dateTime={publishedAt} className="text-muted-foreground/80 font-light tabular-nums">
                {formattedDate}
            </time>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-foreground leading-snug group-hover:text-tiffany-800 transition-colors mb-2 serif-font">
          {titleText}
        </h3>

        {summary && (
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-light">
                {summary}
            </p>
        )}

        <div className="mt-4 text-right">
          <span className="text-sm text-tiffany-600 font-medium group-hover:underline underline-offset-4 decoration-tiffany-300">
            元記事を読む <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
