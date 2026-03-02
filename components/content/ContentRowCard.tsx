import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { pickExhibitKvFromHref } from "@/lib/exhibit/kv";
import { isExistingLocalPublicAssetPath } from "@/lib/public-assets";

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
  /**
   * サムネイル枠ごと非表示にしたい場合に使う。
   * 例: cars の「画像は無し」運用。
   */
  hideImage?: boolean;
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
  hideImage = false,
  badge,
  badgeTone = "accent",
  date,
  size = "md",
  className,
}: Props) {
  const thumbW = size === "sm" ? 80 : 112;
  const thumbH = size === "sm" ? 56 : 76;

  // NOTE:
  // next/image は remotePatterns 未設定の外部URLを描画できず、
  // 「白い空欄」に見えるケースがある（作品として致命傷）。
  // まずはローカルアセット（"/"始まり）のみ画像として扱い、
  // それ以外はプレースホルダーに落とす。
  const safeImageSrc =
    typeof imageSrc === "string" && isExistingLocalPublicAssetPath(imageSrc.trim())
      ? imageSrc.trim()
      : null;

  const fallbackKv = pickExhibitKvFromHref(href, "mobile");
  const resolvedImageSrc = safeImageSrc || fallbackKv;

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
        {!hideImage ? (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-xl",
              "bg-[linear-gradient(135deg,rgba(34,34,34,0.06)_0%,rgba(34,34,34,0.02)_55%,rgba(10,186,181,0.06)_100%)]",
              size === "sm" ? "shadow-none" : "shadow-soft",
            )}
            style={{ width: thumbW, height: thumbH }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[20%] opacity-[0.10] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,rgba(0,0,0,0.06)_0_1px,rgba(0,0,0,0)_1px_2px),repeating-linear-gradient(90deg,rgba(0,0,0,0.05)_0_1px,rgba(0,0,0,0)_1px_3px)] [transform:rotate(7deg)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_30%_20%,rgba(10,186,181,0.10)_0%,rgba(0,0,0,0)_55%)]"
            />

            {resolvedImageSrc ? (
              <Image
                src={resolvedImageSrc}
                alt=""
                fill
                sizes={size === "sm" ? "80px" : "112px"}
                className="object-cover saturate-90 contrast-105"
              />
            ) : (
              <div className="absolute inset-0" />
            )}
          </div>
        ) : null}

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
