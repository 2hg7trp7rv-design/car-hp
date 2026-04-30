import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  type EditorialVariant,
  resolveEditorialImage,
} from "@/lib/editorial-media";

type Aspect = "landscape" | "portrait" | "square";

function aspectClass(aspect: Aspect) {
  switch (aspect) {
    case "portrait":
      return "aspect-[4/5]";
    case "square":
      return "aspect-square";
    default:
      return "aspect-[4/3]";
  }
}

const VARIANT_LABEL: Record<EditorialVariant, string> = {
  guide: "ガイド",
  column: "視点",
  car: "車種",
  heritage: "系譜",
  generic: "読みもの",
};

type Props = {
  href: string;
  title: string;
  date?: string | null;
  imageSrc?: string | null;
  eyebrow?: string | null;
  excerpt?: string | null;
  aspect?: Aspect;
  seedKey?: string | null;
  posterVariant?: EditorialVariant;
  className?: string;
};

export function ContentGridCard({
  href,
  title,
  date,
  imageSrc,
  eyebrow,
  excerpt,
  aspect = "landscape",
  seedKey,
  posterVariant = "generic",
  className,
}: Props) {
  const resolvedImage = resolveEditorialImage(imageSrc ?? null, posterVariant, "card", seedKey ?? href ?? title);
  const displayEyebrow = eyebrow?.trim() || VARIANT_LABEL[posterVariant];

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] transition",
        "hover:-translate-y-[2px] hover:border-[rgba(27,63,229,0.35)]",
        className,
      )}
    >
      <div className={cn("relative bg-[var(--surface-2)]", aspectClass(aspect))}>
        <Image
          src={resolvedImage.src}
          alt={title}
          fill
          sizes={
            aspect === "portrait"
              ? "(max-width: 1024px) 100vw, 32vw"
              : "(max-width: 1024px) 100vw, 40vw"
          }
          className={cn(
            "object-cover transition duration-500 group-hover:scale-[1.02]",
            resolvedImage.hasRealImage ? "saturate-[0.92]" : "opacity-[0.72] saturate-[0.8]",
          )}
        />

        <div
          className={cn(
            "absolute inset-0",
            resolvedImage.hasRealImage
              ? "bg-[linear-gradient(180deg,rgba(251,248,243,0.02),rgba(14,12,10,0.18))]"
              : "bg-[linear-gradient(180deg,rgba(251,248,243,0.3),rgba(251,248,243,0.12),rgba(14,12,10,0.12))]",
          )}
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <span className="rounded-full border border-[rgba(251,248,243,0.52)] bg-[rgba(251,248,243,0.72)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--text-secondary)] backdrop-blur-sm">
            {displayEyebrow}
          </span>
          {!resolvedImage.hasRealImage ? (
            <span className="text-[10px] tracking-[0.16em] text-[rgba(14,12,10,0.56)]">イメージ</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {date ? (
          <div className="text-[10px] tracking-[0.16em] text-[var(--text-tertiary)]">{date}</div>
        ) : null}

        <h3 className="mt-2 text-[20px] font-semibold leading-[1.35] tracking-[-0.03em] text-[var(--text-primary)] transition group-hover:text-[var(--accent-strong)]">
          {title}
        </h3>

        {excerpt ? (
          <p className="mt-3 line-clamp-3 text-[14px] leading-[1.85] text-[var(--text-secondary)]">
            {excerpt}
          </p>
        ) : null}

        <p className="mt-auto pt-5 text-[11px] font-medium tracking-[0.14em] text-[var(--text-tertiary)] transition group-hover:text-[var(--accent-strong)]">
          読む →
        </p>
      </div>
    </Link>
  );
}
