import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  type EditorialVariant,
  resolveEditorialImage,
} from "@/lib/editorial-media";

type Tone = "accent" | "dark" | "light";

function toneClass(tone: Tone) {
  switch (tone) {
    case "dark":
      return "bg-[var(--text-primary)] text-[var(--surface-1)] border border-[var(--text-primary)]";
    case "light":
      return "bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[rgba(14,12,10,0.08)]";
    default:
      return "bg-[var(--accent-subtle)] text-[var(--accent-strong)] border border-[rgba(27,63,229,0.18)]";
  }
}

type Props = {
  href: string;
  title: string;
  excerpt?: string | null;
  imageSrc?: string | null;
  hideImage?: boolean;
  /**
   * Small label shown above the title (e.g. category / tag).
   *
   * NOTE: `eyebrow` is the preferred prop name (matches ContentGridCard).
   * `badge` is kept for backward compatibility.
   */
  eyebrow?: string | null;
  eyebrowTone?: Tone;
  badge?: string | null;
  badgeTone?: Tone;
  date?: string | null;
  size?: "md" | "sm";
  seedKey?: string | null;
  posterVariant?: EditorialVariant;
  className?: string;
};

export function ContentRowCard({
  href,
  title,
  excerpt,
  imageSrc,
  hideImage = false,
  eyebrow,
  eyebrowTone,
  badge,
  badgeTone = "accent",
  date,
  size = "md",
  seedKey,
  posterVariant = "generic",
  className,
}: Props) {
  const displayBadge = (eyebrow ?? badge)?.trim() || null;
  const displayTone: Tone = eyebrowTone ?? badgeTone;
  const thumbW = size === "sm" ? 92 : 128;
  const thumbH = size === "sm" ? 68 : 92;
  const resolvedImage = resolveEditorialImage(imageSrc ?? null, posterVariant, "card", seedKey ?? href ?? title);

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.9)] transition",
        "hover:-translate-y-[2px] hover:border-[rgba(27,63,229,0.35)]",
        className,
      )}
    >
      <div className="flex items-stretch">
        {!hideImage ? (
          <div
            className={cn(
              "relative shrink-0 bg-[var(--surface-2)]",
              "border-r border-[var(--border-default)]",
            )}
            style={{ width: thumbW, minHeight: thumbH }}
          >
            <Image
              src={resolvedImage.src}
              alt={title}
              fill
              sizes={size === "sm" ? "92px" : "128px"}
              className={cn(
                "object-cover transition duration-500 group-hover:scale-[1.03]",
                resolvedImage.hasRealImage ? "saturate-[0.92]" : "opacity-[0.74] saturate-[0.82]",
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                resolvedImage.hasRealImage
                  ? "bg-[linear-gradient(180deg,rgba(251,248,243,0.02),rgba(14,12,10,0.16))]"
                  : "bg-[linear-gradient(180deg,rgba(251,248,243,0.28),rgba(251,248,243,0.12),rgba(14,12,10,0.1))]",
              )}
            />
          </div>
        ) : null}

        <div className={cn("min-w-0 flex-1", size === "sm" ? "p-3 sm:p-4" : "p-4 sm:p-5")}>
          <div className="flex flex-wrap items-center gap-2">
            {displayBadge ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em]",
                  toneClass(displayTone),
                )}
              >
                {displayBadge}
              </span>
            ) : null}
            {date ? (
              <span className="text-[10px] tracking-[0.14em] text-[var(--text-tertiary)]">
                {date}
              </span>
            ) : null}
          </div>

          <p
            className={cn(
              "mt-3 line-clamp-2 font-semibold leading-[1.55] tracking-[-0.02em] text-[var(--text-primary)] transition group-hover:text-[var(--accent-strong)]",
              size === "sm" ? "text-[15px]" : "text-[18px]",
            )}
          >
            {title}
          </p>

          {excerpt ? (
            <p
              className={cn(
                "mt-2 line-clamp-2 leading-[1.85] text-[var(--text-secondary)]",
                size === "sm" ? "text-[12px]" : "text-[13px]",
              )}
            >
              {excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
