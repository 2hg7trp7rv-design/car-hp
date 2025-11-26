"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** アニメーション開始までの遅延時間（ms）。スタッガー効果に使用 */
  delay?: number;
  className?: string;
  /** IntersectionObserverの閾値 (0.0 ~ 1.0) */
  threshold?: number;
  /** 出現方向: 'up'（下から） | 'fade'（その場） */
  direction?: "up" | "fade";
};

/**
 * Phase 3 Reveal Component
 * 物理的な質量を感じさせるイージングと、Bento Grid用の遅延表示をサポート
 */
export function Reveal({ 
  children, 
  delay = 0, 
  className = "",
  threshold = 0.15,
  direction = "up"
}: RevealProps) {
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
      { rootMargin: "0px 0px -50px 0px", threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  // 重厚感のあるカスタムイージング (cubic-bezier)
  const baseClass = "transform-gpu transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform";
  
  let stateClass = "";
  if (direction === "up") {
    stateClass = visible 
     ? "opacity-100 translate-y-0" 
      : "opacity-0 translate-y-8"; 
  } else {
    stateClass = visible? "opacity-100" : "opacity-0";
  }

  // style属性でdelayを直接制御
  const style: CSSProperties = { transitionDelay: `${delay}ms` };

  return (
    <div ref={ref} className={[baseClass, stateClass, className].join(" ")} style={style}>
      {children}
    </div>
  );
}
