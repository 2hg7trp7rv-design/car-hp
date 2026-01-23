import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Tone = "accent" | "dark" | "light";

function toneClass(tone: Tone) {
  switch (tone) {
    case "dark":
      return "bg-[#222222] text-white";
    case "light":
      return "bg-white text-[#222222] border border-[#222222]/10";
    default:
      return "bg-[#0ABAB5]/10 text-[#0ABAB5] border border-[#0ABAB5]/20";
  }
}

type Props = {
  href: string;
  title: string;
  excerpt?: string | null;
  imageSrc?: string | null;
  badge?: string | null;
  badgeTone?: Tone;
  date?: string | null;
  size?: "md" | "sm";
  className?: string;
};

export function ContentRowCard({
  href,
  title,
  excerpt,
  imageSrc,
  badge,
  badgeTone = "accent",
  date,
  size = "md",
  className,
}: Props) {
  const thumbW = size === "sm" ? 80 : 112;
  const thumbH = size === "sm" ? 56 : 76;

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-2xl border border-[#222222]/10 bg-white shadow-soft transition",
        "hover:-translate-y-[1px] hover:border-[#0ABAB5]/35 hover:shadow-soft-card",
        className,
      )}
    >
      <div className={cn("flex gap-4", size === "sm" ? "p-3" : "p-4")}> 
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6]",
            size === "sm" ? "shadow-none" : "shadow-soft",
          )}
          style={{ width: thumbW, height: thumbH }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes={size === "sm" ? "80px" : "112px"}
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {badge ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em]",
                  toneClass(badgeTone),
                )}
              >
                {badge}
              </span>
            ) : null}
            {date ? (
              <span className="text-[10px] tracking-[0.18em] text-[#222222]/45">
                {date}
              </span>
            ) : null}
          </div>

          <p
            className={cn(
              "mt-2 line-clamp-2 font-medium leading-relaxed text-[#222222]",
              size === "sm" ? "text-[12px]" : "text-[13px]",
              "group-hover:text-[#0ABAB5]",
            )}
          >
            {title}
          </p>

          {excerpt ? (
            <p
              className={cn(
                "mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#222222]/65",
                size === "sm" && "hidden sm:block",
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
