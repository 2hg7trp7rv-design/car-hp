"use client";

// components/compare/compareStore.ts
// ローカル比較（最大3台）の状態管理

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cbj_compare_slugs";
const EVENT_NAME = "cbj_compare_updated";

function uniqKeepOrder(items: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    const v = (raw ?? "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export function readCompareSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return uniqKeepOrder(parsed.filter((v) => typeof v === "string"));
  } catch {
    return [];
  }
}

export function writeCompareSlugs(slugs: string[]): string[] {
  if (typeof window === "undefined") return [];
  const normalized = uniqKeepOrder(slugs).slice(0, 3);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // ignore
  }

  window.dispatchEvent(new CustomEvent(EVENT_NAME));
  return normalized;
}

export function addCompareSlug(slug: string): string[] {
  const s = (slug ?? "").trim();
  if (!s) return readCompareSlugs();

  const current = readCompareSlugs();
  // 既にある場合は最後に移動（MRU）
  const next = uniqKeepOrder([...current.filter((x) => x !== s), s]);

  // 最大3台
  const limited = next.length > 3 ? next.slice(next.length - 3) : next;
  return writeCompareSlugs(limited);
}

export function removeCompareSlug(slug: string): string[] {
  const s = (slug ?? "").trim();
  const current = readCompareSlugs();
  const next = current.filter((x) => x !== s);
  return writeCompareSlugs(next);
}

export function clearCompareSlugs(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function buildCompareUrl(slugs: string[]): string {
  const cleaned = uniqKeepOrder(slugs).slice(0, 3);
  if (cleaned.length === 0) return "/compare";
  const param = cleaned.map(encodeURIComponent).join(",");
  return `/compare?cars=${param}`;
}

export function useCompareSlugs(): {
  slugs: string[];
  url: string;
  count: number;
} {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSlugs(readCompareSlugs());

    sync();
    const onCustom = () => sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync();
    };

    window.addEventListener(EVENT_NAME, onCustom as any);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onCustom as any);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const url = useMemo(() => buildCompareUrl(slugs), [slugs]);
  const count = slugs.length;

  return { slugs, url, count };
}
