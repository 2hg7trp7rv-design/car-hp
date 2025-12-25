// lib/viewmodel/text.ts

/**
 * Normalize long text into paragraphs.
 * - Prefer double-newline blocks.
 * - If single block, split by Japanese period and group into pairs.
 */
export function splitIntoParagraphs(text: string): string[] {
  const normalized = (text ?? "").trim();
  if (!normalized) return [];

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (rawBlocks.length > 1) return rawBlocks;

  const sentences = normalized
    .split(/。/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return [normalized];

  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join("。");
    paras.push(`${chunk}。`);
  }

  return paras;
}

export function normalizeBullets(
  items: unknown,
  fallback: string[],
  opts?: { min?: number; max?: number },
): string[] {
  const min = typeof opts?.min === "number" ? opts!.min! : 3;
  const max = typeof opts?.max === "number" ? opts!.max! : 3;

  const cleaned = Array.isArray(items)
    ? items
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (cleaned.length === 0) return fallback.slice(0, max);
  if (cleaned.length >= min) return cleaned.slice(0, max);

  return [...cleaned, ...fallback].slice(0, max);
}
