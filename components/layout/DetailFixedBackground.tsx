import { pickExhibitKvPaths } from "@/lib/exhibit/kv";
import { isExistingLocalPublicAssetPath } from "@/lib/public-assets";

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
  const safeDesktop = isExistingLocalPublicAssetPath(desktopRaw) ? desktopRaw : "";
  const safeMobile = isExistingLocalPublicAssetPath(mobileRaw) ? mobileRaw : "";

  const seed = String(props.seed ?? "").trim();
  const kv = seed ? pickExhibitKvPaths(seed) : null;

  // As a last resort, use an existing exhibit KV (avoid accidental 404s).
  const fallbackDesktop = "/images/exhibit/kv-01.webp";
  const fallbackMobile = "/images/exhibit/kv-01-m.webp";

  const desktopSrc = safeDesktop || safeMobile || kv?.desktop || fallbackDesktop;
  const mobileSrc = safeMobile || safeDesktop || kv?.mobile || fallbackMobile;
  const isCustom = Boolean(safeDesktop || safeMobile || kv);
  const noUpscale = Boolean(props.noUpscale);

  const fitClass = noUpscale ? "object-scale-down" : "object-cover";
  const posClass = noUpscale
    ? "object-center"
    : isCustom
      ? "object-center"
      : "object-[55%_35%]";

  return (
    <div
      className="cb-fixed-kv pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-mono-bg
      aria-hidden="true"
    >
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
              ? "opacity-45 saturate-80 brightness-85 contrast-110"
              : "opacity-55 saturate-50 brightness-90 contrast-110")
          }
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      {/* Readability layers */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/80" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.50)_70%,rgba(0,0,0,0.82)_100%)]" />

      {/* Grain (very subtle) */}
      <div className="absolute -inset-[20%] opacity-[0.10] mix-blend-overlay pointer-events-none [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0_1px,rgba(0,0,0,0)_1px_2px),repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0_1px,rgba(0,0,0,0)_1px_3px)] [transform:rotate(7deg)]" />
    </div>
  );
}
