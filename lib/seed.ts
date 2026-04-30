// lib/seed.ts
/**
 * Deterministic tiny hash utilities for UI seeds.
 * - No crypto deps
 * - Stable across builds
 */

export function hashStringToUint32(input: string): number {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619 (with uint32 overflow)
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h >>> 0;
}

export function seedToUnit(seed: number, salt: number): number {
  // xorshift-ish mix
  let x = (seed ^ (salt * 0x9e3779b1)) >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // map to [0,1)
  return (x >>> 0) / 4294967296;
}
