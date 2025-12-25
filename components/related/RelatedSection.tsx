import type { ReactNode } from "react";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

type Props = {
  eyebrow?: string;
  title: string;
  hrefAll?: string;
  hrefLabel?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

function toneClasses(tone: Tone) {
  if (tone === "dark") {
    return {
      eyebrow: "text-slate-400",
      title: "text-slate-50",
      link: "text-slate-300 hover:text-tiffany-200",
    };
  }

  return {
    eyebrow: "text-tiffany-600",
    title: "text-slate-900",
    link: "text-slate-500 hover:text-tiffany-600",
  };
}

/**
 * 関連コンテンツの見出し（eyebrow + title + 右側の一覧リンク）を共通化する。
 * - レイアウト差分を減らす目的
 * - グリッドやカードは children 側で組み立てる
 */
export function RelatedSection({
  eyebrow,
  title,
  hrefAll,
  hrefLabel,
  tone = "light",
  className,
  children,
}: Props) {
  const t = toneClasses(tone);

  return (
    <section className={cn("mb-10", className)}>
      <Reveal>
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            {eyebrow && (
              <p className={cn("text-[10px] font-semibold tracking-[0.22em]", t.eyebrow)}>
                {eyebrow}
              </p>
            )}
            <h2 className={cn("serif-heading mt-2 text-xl font-semibold", t.title)}>
              {title}
            </h2>
          </div>

          {hrefAll && (
            <Link
              href={hrefAll}
              className={cn(
                "text-[12px] font-semibold underline-offset-4 transition hover:underline",
                t.link,
              )}
            >
              {hrefLabel ?? "一覧へ →"}
            </Link>
          )}
        </div>
      </Reveal>

      {children}
    </section>
  );
}
