// components/home/NewsCard.tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface NewsCardProps {
  title: string;
  publishedAt: string;
  sourceUrl: string;
  sourceName?: string;
  summary?: string;
}

export function NewsCard({
  title: titleText,
  publishedAt,
  sourceUrl,
  sourceName,
  summary,
}: NewsCardProps) {
  const date = new Date(publishedAt);
  const relativeDate = formatDistanceToNow(date, {
    addSuffix: true,
    locale: ja,
  });
  const formattedDate = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <article
      className={[
        "rounded-2xl border border-tiffany-100/60 bg-white/80 p-6",
        "backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
        "hover:bg-white hover:-translate-y-0.5 hover:shadow-soft",
        "transition-all duration-300 ease-out",
      ].join(" ")}
    >
      <Link
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="mb-3 flex items-center justify-between text-sm">
          {sourceName && (
            <span className="rounded-full bg-tiffany-50 px-2 py-0.5 text-xs font-medium tracking-wider text-tiffany-700">
              {sourceName}
            </span>
          )}
          <div className="text-right text-xs text-muted-foreground/80">
            <time dateTime={publishedAt} className="tabular-nums">
              {formattedDate}
            </time>
            <span className="ml-2 text-[11px] text-muted-foreground/70">
              {relativeDate}
            </span>
          </div>
        </div>

        <h3 className="serif-font mb-2 text-lg md:text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-tiffany-800">
          {titleText}
        </h3>

        {summary && (
          <p className="text-sm font-light leading-relaxed text-muted-foreground line-clamp-2">
            {summary}
          </p>
        )}

        <div className="mt-4 text-right">
          <span className="text-sm font-medium text-tiffany-600 underline-offset-4 decoration-tiffany-300 group-hover:underline">
            元記事を読む
            <span
              aria-hidden="true"
              className="ml-1 inline-block transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
