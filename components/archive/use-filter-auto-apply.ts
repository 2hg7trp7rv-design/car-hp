"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ApplySource = "debounce" | "change" | "submit" | "reset";

function formUrl(form: HTMLFormElement, pathname: string): string {
  const params = new URLSearchParams();
  for (const [key, entry] of new FormData(form)) {
    const value = String(entry).trim();
    if (value && key !== "page") params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Restore Back / clear-link state without replacing the focused form elements. */
function syncFilterFields(form: HTMLFormElement, values: Record<string, string>) {
  for (const field of Array.from(form.elements)) {
    if (field instanceof HTMLSelectElement) {
      const value = values[field.name] ?? "";
      field.value = Array.from(field.options).some((option) => option.value === value) ? value : "";
    } else if (field instanceof HTMLInputElement && ["text", "search", "number"].includes(field.type)) {
      const value = values[field.name] ?? "";
      if (field.value !== value) field.value = value;
    }
    // Hidden fields are server-controlled navigation settings, not editable filters.
  }
}

export function useFilterAutoApply({
  formId,
  filterValues,
  debounceMs = 450,
  onApply,
}: {
  formId: string;
  filterValues: Record<string, string>;
  debounceMs?: number;
  onApply?: (_form: HTMLFormElement, _source: ApplySource) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const currentUrl = query ? `${pathname}?${query}` : pathname;
  const canonicalValues = JSON.stringify(filterValues);
  const observedUrlRef = useRef<string | null>(null);
  const preserveDraftRef = useRef(false);
  const submittedUrlsRef = useRef<string[]>([]);
  const composingRef = useRef(false);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;

    let timer: number | undefined;
    const clearTimer = () => window.clearTimeout(timer);

    const apply = (source: ApplySource) => {
      const next = formUrl(form, pathname);
      if (next === currentUrl) return;
      submittedUrlsRef.current.push(next);
      try {
        onApply?.(form, source);
      } catch {
        // Optional analytics must not prevent filtering.
      }
      try {
        router.push(next, { scroll: false });
      } catch {
        window.location.href = next;
      }
    };
    const schedule = () => {
      clearTimer();
      if (!composingRef.current) timer = window.setTimeout(() => apply("debounce"), debounceMs);
    };

    if (observedUrlRef.current !== currentUrl) {
      const ownNavigation = submittedUrlsRef.current.lastIndexOf(currentUrl);
      observedUrlRef.current = currentUrl;
      preserveDraftRef.current = ownNavigation !== -1;
      if (ownNavigation === -1) {
        submittedUrlsRef.current = [];
      } else {
        submittedUrlsRef.current.splice(0, ownNavigation + 1);
      }
    }
    if (!preserveDraftRef.current) {
      // Back can update the URL before the server component payload arrives.
      // Re-run when its canonical props arrive, not just when the URL changes.
      syncFilterFields(form, JSON.parse(canonicalValues));
    } else if (formUrl(form, pathname) !== currentUrl) {
      // An earlier request may finish while the reader types the next query.
      schedule();
    }

    const onInput = (event: Event) => {
      if (!(event.target instanceof HTMLSelectElement)) schedule();
    };
    const onChange = (event: Event) => {
      if (event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLInputElement && event.target.type === "number")) {
        clearTimer();
        if (!composingRef.current) apply("change");
      }
    };
    const onSubmit = (event: Event) => {
      event.preventDefault();
      clearTimer();
      if (!composingRef.current) apply("submit");
    };
    const onReset = () => {
      clearTimer();
      // The native reset action runs after the reset event.
      timer = window.setTimeout(() => apply("reset"), 0);
    };
    const onCompositionStart = () => {
      composingRef.current = true;
      clearTimer();
    };
    const onCompositionEnd = () => {
      composingRef.current = false;
      schedule();
    };

    form.addEventListener("input", onInput);
    form.addEventListener("change", onChange);
    form.addEventListener("submit", onSubmit);
    form.addEventListener("reset", onReset);
    form.addEventListener("compositionstart", onCompositionStart);
    form.addEventListener("compositionend", onCompositionEnd);
    return () => {
      clearTimer();
      form.removeEventListener("input", onInput);
      form.removeEventListener("change", onChange);
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("reset", onReset);
      form.removeEventListener("compositionstart", onCompositionStart);
      form.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [formId, debounceMs, router, pathname, currentUrl, canonicalValues, onApply]);
}
