// components/ui/magnetic-area.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MagneticAreaProps = {
  children: React.ReactElement;
  /**
   * 磁力の強さ。数値を上げるほどカーソルに吸い付く距離が伸びます。
   */
  strength?: number;
  className?: string;
};

/**
 * MagneticArea
 * ----------------------------------------
 * - ホバー中にカーソル方向へ少しだけ吸い付くインタラクション。
 * - Button以外にも、Cardやサムネイルなどに使い回し可能。
 * - transformを直接当てるので、childrenは1要素想定。
 *
 * パフォーマンス最適化:
 * - mousemove毎にsetStateしない（rAFでstyle.transformを直接更新）
 * - prefers-reduced-motion / coarse pointer では自動的に無効化
 */
export function MagneticArea({
  children,
  strength = 14,
  className,
}: MagneticAreaProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const rafIdRef = React.useRef<number | null>(null);
  const pendingTransformRef = React.useRef<string>("translate3d(0,0,0)");

  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    // SSRガード
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setEnabled(!(reduceMotion.matches || coarsePointer.matches));
    };

    update();

    // SafariなどでaddEventListener未対応のケースは fallback
    const add = (mq: MediaQueryList) => {
      if (typeof mq.addEventListener === "function") mq.addEventListener("change", update);
      else if (typeof mq.addListener === "function") mq.addListener(update);
    };

    const remove = (mq: MediaQueryList) => {
      if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", update);
      else if (typeof mq.removeListener === "function") mq.removeListener(update);
    };

    add(reduceMotion);
    add(coarsePointer);

    return () => {
      remove(reduceMotion);
      remove(coarsePointer);
    };
  }, []);

  const commitTransform = React.useCallback(() => {
    rafIdRef.current = null;
    const el = ref.current;
    if (!el) return;
    el.style.transform = pendingTransformRef.current;
  }, []);

  const scheduleCommit = React.useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = window.requestAnimationFrame(commitTransform);
  }, [commitTransform]);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const relX = event.clientX - rect.left;
      const relY = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = relX - centerX;
      const deltaY = relY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
      const maxDistance = Math.max(centerX, centerY) || 1;
      const ratio = Math.min(distance / maxDistance, 1);

      const moveX = (deltaX / distance) * strength * ratio;
      const moveY = (deltaY / distance) * strength * ratio;

      pendingTransformRef.current = `translate3d(${moveX}px, ${moveY}px, 0)`;
      scheduleCommit();
    },
    [enabled, strength, scheduleCommit],
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!ref.current) return;
    pendingTransformRef.current = "translate3d(0,0,0)";

    if (rafIdRef.current != null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    ref.current.style.transform = pendingTransformRef.current;
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex will-change-transform transition-transform duration-300 ease-magnetic",
        className,
      )}
      style={{ transform: "translate3d(0,0,0)" }}
      onMouseMove={enabled ? handleMouseMove : undefined}
      onMouseLeave={enabled ? handleMouseLeave : undefined}
    >
      {children}
    </div>
  );
}
