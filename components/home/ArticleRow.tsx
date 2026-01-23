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
 * - PC/スマホで“同じレイアウト”を崩さない（常に横2カラム）
 * - 背景にセクション番号（stickyで固定っぽく見せる）
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
    <article className="relative overflow-hidden py-16 sm:py-20">
      {/* 背景：セクション番号（stickyで“固定配置”の見え方を作る） */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          isEven ? "text-right" : "text-left",
        )}
      >
        <div className="sticky top-[18vh] px-4 sm:px-6 lg:px-8">
          <span className={cn("home-section-no select-none", isEven ? "pr-2" : "pl-2")}>
            {sectionNo}
          </span>
        </div>
      </div>

      {/* 本体 */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex flex-row items-start gap-6 sm:gap-10",
            isEven && "flex-row-reverse",
          )}
        >
          {/* Image */}
          <Link
            href={item.href}
            className="group block basis-[46%] shrink-0"
            aria-label={item.title}
          >
            <div
              className={cn(
                "relative aspect-[3/2] w-full overflow-hidden",
                "border border-[#222222]/10 bg-white",
                "transition-colors duration-300",
                "group-hover:border-[#0ABAB5]",
              )}
            >
              <Image
                src={imageSrc}
                alt={item.title}
                fill
                sizes="46vw"
                className="object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
              />
              {/* 右側の余白に溶ける、薄い紙のレイヤー */}
              <div className="absolute inset-0 bg-gradient-to-l from-white/18 via-transparent to-transparent" />
            </div>
          </Link>

          {/* Text */}
          <div className="min-w-0 basis-[54%]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.32em] text-[#222222]/60">
              {labelParts.length > 0 && (
                <p className="flex flex-wrap items-center gap-3">
                  <span className="inline-block h-[1px] w-10 bg-[#222222]/20" />
                  <span className="uppercase">{labelParts.join(" / ")}</span>
                </p>
              )}
              {item.dateLabel && (
                <p className="ml-auto text-[10px] tracking-[0.26em] text-[#222222]/45">
                  {item.dateLabel}
                </p>
              )}
            </div>

            <h3 className="mt-5 text-[clamp(16px,2.2vw,30px)] font-medium leading-[1.55] tracking-[0.10em] text-[#222222]">
              <Link
                href={item.href}
                className="inline-block transition-colors hover:text-[#0ABAB5]"
              >
                {item.title}
              </Link>
            </h3>

            {item.excerpt && (
              <p className="mt-5 text-[12px] leading-[2.0] tracking-[0.04em] text-[#222222]/70 sm:text-[13px]">
                {item.excerpt}
              </p>
            )}

            <div className="mt-8">
              <Link
                href={item.href}
                className="group inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.34em] text-[#222222]"
              >
                <span
                  className={cn(
                    "border-b border-[#222222]/20 pb-1",
                    "transition-colors duration-300",
                    "group-hover:border-[#0ABAB5]",
                    "group-hover:text-[#0ABAB5]",
                  )}
                >
                  READ
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-[#222222]/35",
                    "transition-colors duration-300",
                    "group-hover:text-[#0ABAB5]",
                  )}
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
