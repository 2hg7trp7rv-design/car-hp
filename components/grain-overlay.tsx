"use client";

import { useEffect } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export default function GrainOverlay() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let raf = 0;
    let lastY = -1;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (Math.abs(y - lastY) < 6) return;
        lastY = y;

        const gx = ((y * 0.18) % 24) - 12;
        const gy = ((y * 0.12) % 24) - 12;
        document.documentElement.style.setProperty("--grain-x", `${gx.toFixed(2)}px`);
        document.documentElement.style.setProperty("--grain-y", `${gy.toFixed(2)}px`);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="cbj-vignette" />
      <div className="cbj-grain" />
    </>
  );
}
