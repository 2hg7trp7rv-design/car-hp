// components/scroll/SmoothScrollProvider.tsx
"use client";

import type { ReactNode } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

/**
 * サイト全体は通常スクロールのまま使う。
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>;
}
