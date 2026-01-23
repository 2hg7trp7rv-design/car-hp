import { useEffect, useRef, useState } from "react";

export function useImpressionOnce(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasImpression, setHasImpression] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasImpression) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasImpression(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasImpression, options]);

  return { ref, hasImpression };
}
