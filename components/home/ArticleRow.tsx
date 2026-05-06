import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type HomeArticleItem = {
  id: string;
  href: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  meta?: string | null;
  dateLabel?: string | null;
  kindLabel?: string | null;
  /**
   * 並び替え用の内部キー（unix time / ms）
   * - 表示には使わない
   */
  sortTime?: number;
};

type Props = {
  item: HomeArticleItem;
  index: number;
};

function formatIndex(index: number): string {
  return String(index).padStart(2, "0");
}

/**
 * Home page: 1記事=1セクション（ジグザグ）
 * - odd : image left / text right
 * - even: image right / text left
 * - 背景に大きい番号を置いて、誌面の間をゆるくつなぐ
 */
export function ArticleRow({ item, index }: Props) {
  const isEven = index % 2 === 1;
  const sectionNo = formatIndex(index + 1);

  const imageSrc =
    typeof item.image === "string" && item.image.trim().length > 0
      ? item.image
      : "/images/hero-sedan.webp";

  const labelParts = [item.kindLabel, item.meta].filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );

  return (
    <article className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          isEven ? "text-right" : "text-left",
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <span
            className={cn(
              "font-[var(--font-editorial)] text-[clamp(5rem,16vw,11rem)] font-semibold leading-none tracking-[-0.05em] text-[rgba(141,126,114,0.18)]",
              isEven ? "pr-2" : "pl-2",
            )}
          >
            {sectionNo}
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex flex-col items-start gap-7 sm:gap-10 lg:flex-row",
            isEven && "lg:flex-row-reverse",
          )}
        >
          <Link href={item.href} className="group block w-full lg:basis-[48%]" aria-label={item.title}>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-2)]">
              <Image
                src={imageSrc}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,243,0.04)_0%,rgba(251,248,243,0.0)_48%,rgba(251,248,243,0.18)_100%)]" />
            </div>
          </Link>

          <div className="min-w-0 w-full lg:basis-[52%]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.28em] text-[var(--text-tertiary)]">
              {labelParts.length > 0 && (
                <p className="flex flex-wrap items-center gap-3">
                  <span className="inline-block h-px w-10 bg-[var(--border-default)]" />
                  <span>{labelParts.join(" ・ ")}</span>
                </p>
              )}
              {item.dateLabel && (
                <p className="ml-auto text-[10px] tracking-[0.22em] text-[var(--text-tertiary)]">
                  {item.dateLabel}
                </p>
              )}
            </div>

            <h3 className="serif-heading mt-5 max-w-[18ch] text-[clamp(1.45rem,3vw,2.5rem)] font-medium leading-[1.45] tracking-[-0.01em] text-[var(--text-primary)]">
              <Link href={item.href} className="inline-block transition-colors hover:text-[var(--accent-strong)]">
                {item.title}
              </Link>
            </h3>

            {item.excerpt ? (
              <p className="mt-5 max-w-2xl text-[14px] leading-[1.95] text-[var(--text-secondary)] sm:text-[15px]">
                {item.excerpt}
              </p>
            ) : null}

            <div className="mt-8">
              <Link
                href={item.href}
                className="group inline-flex items-center gap-3 text-[12px] font-medium tracking-[0.16em] text-[var(--text-primary)]"
              >
                <span className="border-b border-[rgba(31,28,25,0.18)] pb-1 transition-colors duration-300 group-hover:border-[rgba(122,135,108,0.52)] group-hover:text-[var(--accent-strong)]">
                  記事へ
                </span>
                <span
                  aria-hidden="true"
                  className="text-[var(--text-tertiary)] transition-colors duration-300 group-hover:text-[var(--accent-strong)]"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
