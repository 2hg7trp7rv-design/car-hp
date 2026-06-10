"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  formId: string;
  debounceMs?: number;
};

/**
 * Generic filter auto-apply helper.
 * - Debounces text/number inputs.
 * - Applies select changes immediately.
 * - Prevents full-page reload by using next/router push.
 */
export function ArchiveFilterAutoApply({ formId, debounceMs = 450 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

      // フィルタ変更時はページをリセット
      params.delete("page");

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    };

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const applyNow = () => {
      const next = buildUrlFromForm();
      const cur = currentUrl();
      if (next === cur) return;
      if (lastPushedRef.current === next) return;
      lastPushedRef.current = next;

      try {
        router.push(next, { scroll: false });
      } catch {
        window.location.href = next;
      }
    };

    const schedule = () => {
      clearTimer();
      timerRef.current = window.setTimeout(() => applyNow(), debounceMs);
    };

    const onInput = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName.toLowerCase();
      if (tag === "select") return;

      const type = (target as HTMLInputElement).getAttribute("type")?.toLowerCase() ?? "";
      if (type === "search" || type === "number") {
        schedule();
        return;
      }

      schedule();
    };

    const onChange = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName.toLowerCase();
      if (tag === "select") {
        clearTimer();
        applyNow();
        return;
      }

      const type = (target as HTMLInputElement).getAttribute("type")?.toLowerCase() ?? "";
      if (type === "number") {
        clearTimer();
        applyNow();
      }
    };

    const onSubmit = (e: Event) => {
      e.preventDefault();
      clearTimer();
      applyNow();
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
  }, [formId, debounceMs, router, pathname, searchParams]);

  return null;
}
