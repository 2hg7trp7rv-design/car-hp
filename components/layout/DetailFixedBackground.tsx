// components/layout/DetailFixedBackground.tsx
//
// All “detail” pages (CARS / HERITAGE / GUIDE / COLUMN) share one fixed hero
// background to unify the visual language across the site.
//
// We intentionally use <picture> + <img> here (instead of next/image) because
// this is a fixed, full-viewport background and we want predictable rendering.

export function DetailFixedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <picture>
        <source media="(min-width: 768px)" srcSet="/images/hero-top-desktop.jpeg" />
        <img
          src="/images/hero-top-mobile.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[55%_35%] opacity-55 saturate-50 brightness-90 contrast-110"
          loading="eager"
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
