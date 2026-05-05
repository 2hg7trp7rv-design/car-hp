// lib/seo/redirects.ts

/**
 * Data-driven redirects (B: 統合) helper.
 *
 * - Source of truth: data/redirects.json
 * - Used to avoid emitting internal links / sitemap URLs that immediately redirect.
 */

import redirectsJson from "@/data/redirects.json";

export type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
};

const RULES: RedirectRule[] = Array.isArray(redirectsJson)
  ? (redirectsJson as RedirectRule[])
  : [];

const SOURCE_SET = new Set(
  RULES.map((r) => (typeof r?.source === "string" ? r.source : "")).filter(Boolean),
);

export function isRedirectSourcePath(path: string): boolean {
  const p = typeof path === "string" ? path : "";
  return SOURCE_SET.has(p);
}

export function getRedirectDestination(path: string): string | null {
  const p = typeof path === "string" ? path : "";
  for (const r of RULES) {
    if (r?.source === p) return typeof r?.destination === "string" ? r.destination : null;
  }
  return null;
}

export function listRedirectSources(): string[] {
  return Array.from(SOURCE_SET);
}

export function listRedirectRules(): RedirectRule[] {
  return [...RULES];
}
