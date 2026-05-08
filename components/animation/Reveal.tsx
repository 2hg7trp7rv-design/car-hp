// components/animation/Reveal.tsx
"use client";

import type { ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "scale";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  direction?: RevealDirection;
  duration?: number;
  disabled?: boolean;
  forceVisible?: boolean;
};

/**
 * Reveal
 * スクロール連動の出現演出は使わず、常時そのまま描画する。
 * 既存呼び出しとの互換のため props は残す。
 */
export function Reveal({ children, className = "" }: RevealProps) {
  return <div className={className}>{children}</div>;
}
