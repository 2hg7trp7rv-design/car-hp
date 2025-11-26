// components/animation/Reveal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * スクロールイン時にふわっと表示させる共通コンポーネント
 * ・IntersectionObserverで一度だけ表示状態にする
 * ・モバイルでも負担が大きくならないように、処理は最小限
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const baseClass =
    "transform-gpu transition-all duration-700 ease-out will-change-transform";
  const stateClass = visible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-3";

  const mergedClassName = [baseClass, stateClass, className]
    .filter(Boolean)
    .join(" ");

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div ref={ref} className={mergedClassName} style={style}>
      {children}
    </div>
  );
}
