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
 */
export function MagneticArea({
  children,
  strength = 14,
  className,
}: MagneticAreaProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = React.useState<string>(
    "translate3d(0,0,0)",
  );

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
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
      const maxDistance = Math.max(centerX, centerY);
      const ratio = Math.min(distance / maxDistance, 1);

      const moveX = (deltaX / distance) * strength * ratio;
      const moveY = (deltaY / distance) * strength * ratio;

      setTransform(`translate3d(${moveX}px, ${moveY}px, 0)`);
    },
    [strength],
  );

  const handleMouseLeave = React.useCallback(() => {
    setTransform("translate3d(0,0,0)");
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex will-change-transform transition-transform duration-300 ease-magnetic",
        className,
      )}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
