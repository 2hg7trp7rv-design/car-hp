// components/scroll/SmoothScrollProvider.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

/**
 * サイト全体にLenisのスムーススクロールを適用するラッパー
 * requestAnimationFrameでLenisを回し、アンマウント時にdestroyする
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    // Mobile(Lighthouseの測定対象)ではJS/強制リフローの影響が出やすいため無効化
    // - 画面幅が小さい
    // - reduced-motion
    // - touch主体
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 1024;

    if (prefersReducedMotion || isTouch || isSmallScreen) return;

    let lenis: import("@studio-freight/lenis").default | null = null;
    let frameId = 0;
    let cancelled = false;

    const start = async () => {
      if (cancelled) return;

      const { default: Lenis } = await import("@studio-freight/lenis");
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        smoothTouch: false,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frameId = requestAnimationFrame(raf);
      };

      frameId = requestAnimationFrame(raf);
    };

    // 初期描画を優先し、アイドルタイミングで起動
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cancelRic = (window as any).cancelIdleCallback as
      | ((id: number) => void)
      | undefined;

    let idleId: number | null = null;
    if (ric) {
      idleId = ric(start, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(start, 1200);
    }

    return () => {
      cancelled = true;
      if (idleId !== null) {
        if (ric && cancelRic) cancelRic(idleId);
        else clearTimeout(idleId);
      }
      if (frameId) cancelAnimationFrame(frameId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
