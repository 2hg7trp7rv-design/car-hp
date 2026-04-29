import { pickEditorialFallbackImage, pickEditorialImage } from "@/lib/editorial-media";

// components/layout/DetailFixedBackground.tsx
//
// All “detail” pages (CARS / HERITAGE / GUIDE / COLUMN) share one fixed hero
// background to unify the visual language across the site.
//
// We intentionally use <picture> + <img> here (instead of next/image) because
// this is a fixed, full-viewport background and we want predictable rendering.

export function DetailFixedBackground(
  props: {
    /**
     * ページ単位でKVを割り当てるためのseed（例: slug）。
     * imageSrc が安全なローカル画像の場合はそちらを優先する。
     */
    seed?: string | null;

    /**
     * ローカルアセット（"/"始まり）のみ許可。
     * 外部URLは next/image の制約や読み込み失敗で“白い空欄”に見えることがあるため、
     * まずは作品の一貫性を優先してフォールバックする。
     */
    imageSrc?: string | null;

    /**
     * デスクトップ/モバイルで別KVを使いたい場合。
     * 未指定なら imageSrc を共通値として利用する。
     */
    imageSrcDesktop?: string | null;
    imageSrcMobile?: string | null;

    /**
     * 画像を「拡大して」見せない（= scale-down）。
     * KVの構図を崩さず、そのまま置きたい時に使う。
     */
    noUpscale?: boolean;
  } = {},
) {
  const desktopRaw = (props.imageSrcDesktop ?? props.imageSrc ?? "").trim();
  const mobileRaw = (props.imageSrcMobile ?? props.imageSrc ?? "").trim();

  // NOTE:
  // content JSON には将来的な画像パスが入っていることがある。
  // ここで public/ に実在するものだけを許可し、404を発生させない。
  const fallbackDesktop = pickEditorialFallbackImage("generic", "desktop");
  const fallbackMobile = pickEditorialFallbackImage("generic", "mobile");

  const desktopSrc =
    desktopRaw || mobileRaw
      ? pickEditorialImage(desktopRaw || mobileRaw, "generic", "desktop")
      : fallbackDesktop;
  const mobileSrc =
    mobileRaw || desktopRaw
      ? pickEditorialImage(mobileRaw || desktopRaw, "generic", "mobile")
      : fallbackMobile;
  const isCustom = Boolean((desktopRaw || mobileRaw).trim());
  const noUpscale = Boolean(props.noUpscale);

  const fitClass = noUpscale ? "object-scale-down" : "object-cover";
  const posClass = noUpscale
    ? "object-center"
    : isCustom
      ? "object-center"
      : "object-[55%_35%]";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrc} />
        <img
          src={mobileSrc}
          alt=""
          className={
            "absolute inset-0 h-full w-full " +
            fitClass +
            " " +
            posClass +
            " " +
            (isCustom
              ? "opacity-[0.18] saturate-[0.82] brightness-[1.02] contrast-[0.96]"
              : "opacity-[0.16] saturate-[0.72] brightness-[1.04] contrast-[0.94]")
          }
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      {/* Readability layers */}
      <div className="absolute inset-0 bg-[rgba(246,242,235,0.76)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,243,0.52)_0%,rgba(246,242,235,0.88)_28%,rgba(246,242,235,0.97)_100%)]" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0)_52%),radial-gradient(ellipse_at_bottom_right,rgba(217,209,199,0.22)_0%,rgba(217,209,199,0)_56%)]" />

      {/* Grain (very subtle) */}
      <div className="absolute -inset-[18%] opacity-[0.04] mix-blend-multiply pointer-events-none [background-image:repeating-linear-gradient(0deg,rgba(14,12,10,0.035)_0_1px,rgba(0,0,0,0)_1px_3px),repeating-linear-gradient(90deg,rgba(14,12,10,0.025)_0_1px,rgba(0,0,0,0)_1px_4px)] [transform:rotate(6deg)]" />
    </div>
  );
}
