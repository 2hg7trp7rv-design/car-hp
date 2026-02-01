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
          className="absolute inset-0 h-full w-full object-cover object-center opacity-60 saturate-50 brightness-110"
          loading="eager"
        />
      </picture>

      {/* Readability layers */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.46)_70%,rgba(0,0,0,0.70)_100%)]" />
    </div>
  );
}
