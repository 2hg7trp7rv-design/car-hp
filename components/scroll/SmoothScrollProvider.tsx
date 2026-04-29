// components/scroll/SmoothScrollProvider.tsx
"use client";

import Lenis from "@studio-freight/lenis";
import { useEffect, type ReactNode } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let frameId = 0;
    let lenis: Lenis | null = null;

    try {
      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.15,
        gestureOrientation: "vertical",
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frameId = window.requestAnimationFrame(raf);
      };

      frameId = window.requestAnimationFrame(raf);
    } catch {
      return;
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
