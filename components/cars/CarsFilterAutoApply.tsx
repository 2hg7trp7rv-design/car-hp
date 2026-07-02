"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { usePageContext } from "@/lib/analytics/pageContext";
import { trackCarsFilterApply } from "@/lib/analytics/events";

type Props = {
  formId: string;
  debounceMs?: number;
};

function safeString(v: FormDataEntryValue | null): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

export function CarsFilterAutoApply({ formId, debounceMs = 450 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ctx = usePageContext();

  const timerRef = useRef<number | null>(null);
  const lastPushedRef = useRef<string>("");

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const currentUrl = () => {
      const qs = searchParams?.toString?.() ?? "";
      return qs ? `${pathname}?${qs}` : pathname;
    };

    const buildUrlFromForm = () => {
      const fd = new FormData(form);
      const params = new URLSearchParams();

      for (const [k, v] of fd.entries()) {
        const value = String(v ?? "").trim();
        if (!value) continue;
        params.set(k, value);
      }
      // フィルタ変更時はページをリセット（pageがURLに残っても意味がないので削除）
      params.delete("page");

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    };

    const track = (source: string) => {
      try {
        const fd = new FormData(form);
        trackCarsFilterApply({
          page_type: ctx.page_type === "cars" ? "cars_index" : (ctx.page_type as any),
          content_id: ctx.content_id,
          q: safeString(fd.get("q")),
          maker: safeString(fd.get("maker")),
          bodyType: safeString(fd.get("bodyType")),
          segment: safeString(fd.get("segment")),
          sort: safeString(fd.get("sort")),
          minYear: safeString(fd.get("minYear")),
          maxYear: safeString(fd.get("maxYear")),
          minPrice: safeString(fd.get("minPrice")),
          maxPrice: safeString(fd.get("maxPrice")),
          priceBand: safeString(fd.get("priceBand")),
          perPage: safeString(fd.get("perPage")),
          view: safeString(fd.get("view")),
          source,
        });
      } catch {
        // ignore
      }
    };

    const applyNow = (source: string) => {
      const next = buildUrlFromForm();
      const cur = currentUrl();
      if (next === cur) return;
      if (lastPushedRef.current === next) return;
      lastPushedRef.current = next;

      track(source);
      try {
        router.push(next, { scroll: false });
      } catch {
        // 万一 router が使えない環境ではハード遷移でフォールバック
        window.location.href = next;
      }
    };

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const schedule = (source: string) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => applyNow(source), debounceMs);
    };

    const onInput = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName.toLowerCase();
      if (tag === "select") return; // select は change で即時

      const type = (target as HTMLInputElement).getAttribute("type")?.toLowerCase() ?? "";
      if (type === "search" || type === "number") {
        schedule("debounce");
        return;
      }

      schedule("debounce");
    };

    const onChange = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName.toLowerCase();
      if (tag === "select") {
        clearTimer();
        applyNow("change");
        return;
      }

      // number は change（=blur）でも反映したい
      const type = (target as HTMLInputElement).getAttribute("type")?.toLowerCase() ?? "";
      if (type === "number") {
        clearTimer();
        applyNow("change");
      }
    };

    const onSubmit = (e: Event) => {
      e.preventDefault();
      clearTimer();
      applyNow("submit");
    };

    form.addEventListener("input", onInput);
    form.addEventListener("change", onChange);
    form.addEventListener("submit", onSubmit);

    return () => {
      clearTimer();
      form.removeEventListener("input", onInput);
      form.removeEventListener("change", onChange);
      form.removeEventListener("submit", onSubmit);
    };
  }, [formId, debounceMs, router, pathname, searchParams, ctx.page_type, ctx.content_id]);

  return null;
}
