// lib/related/scoring.ts
// Related-content fallback scoring helpers (NON-BEHAVIORAL).
// Purpose: de-duplicate overlap/count + recency penalty math across viewmodels.
// NOTE: Keep formulas identical to the previous inline implementations.

export function overlapCount(seed: Set<string>, candidate: string[] | null | undefined): number {
  if (!seed || seed.size === 0) return 0;
  if (!Array.isArray(candidate) || candidate.length === 0) return 0;
  let n = 0;
  for (const t of candidate) if (seed.has(t)) n += 1;
  return n;
}

export function intersectionCount(a: string[] | null | undefined, b: string[] | null | undefined): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) return 0;
  const set = new Set(a);
  let n = 0;
  for (const x of b) if (set.has(x)) n += 1;
  return n;
}

/**
 * Keep the legacy formula as-is:
 *   score += Math.min(cap, yearsSincePublished * slopePerYear)
 * where slopePerYear is negative (older => more negative).
 *
 * This function intentionally does NOT clamp the negative side beyond the legacy behavior.
 */
export function recencyScore(publishedAt: string | null | undefined, cap: number, slopePerYear: number): number {
  if (!publishedAt) return 0;
  const t = new Date(publishedAt).getTime();
  if (!t) return 0;
  const years = (Date.now() - t) / (1000 * 60 * 60 * 24 * 365);
  return Math.min(cap, years * slopePerYear);
}
