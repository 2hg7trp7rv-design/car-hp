// components/analytics/ScrollDepthTracker.tsx
"use client";

import { useEffect, useRef } from "react";

import { usePageContext } from "@/lib/analytics/pageContext";
import { trackScrollDepth } from "@/lib/analytics/events";

function isValidContentId(v: unknown): v is string {
  return (
    typeof v === "string" &&
    v.trim().length > 0 &&
    v !== "unknown" &&
    v !== "top"
  );
}

function isTrackablePageType(
  v: unknown,
): v is "heritage" | "cars" | "column" | "guide" | "hub" {
  return (
    v === "heritage" ||
    v === "cars" ||
    v === "column" ||
    v === "guide" ||
    v === "hub"
  );
}

export function ScrollDepthTracker() {
  const { page_type, content_id } = usePageContext();

  const trackedRefs = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);

  // ページ（識別子）が変わったら、到達済みマイルストーンをリセット
  useEffect(() => {
    trackedRefs.current = new Set();
  }, [page_type, content_id]);

  useEffect(() => {
    // ★ここで型ガードを直接踏む（canTrack boolean では型が絞れないため）
    if (!isTrackablePageType(page_type)) return;
    if (!isValidContentId(content_id)) return;

    // ここ以降は型が確定しているので、安全に送れる
    const pageType = page_type;
    const contentId = content_id;

    const milestones = [25, 50, 75, 90];

    const calcPercent = (): number => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return 0;

      const scrollTop = window.scrollY;
      const percent = Math.round((scrollTop / scrollHeight) * 100);
      return Math.max(0, Math.min(100, percent));
    };

    const fireIfNeeded = () => {
      const percent = calcPercent();

      for (const m of milestones) {
        if (percent >= m && !trackedRefs.current.has(m)) {
          trackedRefs.current.add(m);

          trackScrollDepth({
            percent: m,
            page_type: pageType,
            content_id: contentId,
          });
        }
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        fireIfNeeded();
      });
    };

    // 初回もチェック（例：短いページで早めに到達するケースの補助）
    fireIfNeeded();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [page_type, content_id]);

  return null;
}
