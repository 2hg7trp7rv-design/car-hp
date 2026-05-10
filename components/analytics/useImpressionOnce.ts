"use client";

import { useEffect, useRef, useState } from "react";

export function useImpressionOnce(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasImpression, setHasImpression] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasImpression) return;

    // IntersectionObserver が無い環境（古いブラウザ等）では即時 Impression 扱いにする
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) {
      setHasImpression(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setHasImpression(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasImpression, options]);

  return { ref, hasImpression };
}
