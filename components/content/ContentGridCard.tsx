import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { pickExhibitKvFromHref } from "@/lib/exhibit/kv";
import { isExistingLocalPublicAssetPath } from "@/lib/public-assets";

type Props = {
  href: string;
  title: string;
  date?: string | null;
  imageSrc?: string | null;
  className?: string;
};

export function ContentGridCard({ href, title, date, imageSrc, className }: Props) {
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
        "group block overflow-hidden rounded-2xl border border-[#222222]/10 bg-white shadow-soft transition",
        "hover:-translate-y-[1px] hover:border-[#0ABAB5]/35 hover:shadow-soft-card",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[linear-gradient(135deg,rgba(34,34,34,0.06)_0%,rgba(34,34,34,0.02)_55%,rgba(10,186,181,0.06)_100%)]">
        {/* Subtle paper grain (works even when image is missing) */}
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
            sizes="(max-width: 768px) 50vw, 260px"
            className="object-cover saturate-90 contrast-105"
          />
        ) : (
          <div className="absolute inset-0" />
        )}
      </div>

      <div className="p-4">
        {date ? (
          <p className="text-[10px] tracking-[0.18em] text-[#222222]/45">{date}</p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#222222] group-hover:text-[#0ABAB5]">
          {title}
        </p>
      </div>
    </Link>
  );
}
