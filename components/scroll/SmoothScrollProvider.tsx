// components/scroll/SmoothScrollProvider.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

/**
 * サイト全体にLenisのスムーススクロールを適用するラッパー
 * ・requestAnimationFrameループでLenisを回す
 * ・アンマウント時にはdestroy
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
    });

    let frameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
