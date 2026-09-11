export function stripLeadingDisplayNumber(text?: string | null): string {
  return String(text ?? "")
    .replace(
      /^\s*(?:第?\d{1,2}(?:章|話|部|項)|[①②③④⑤⑥⑦⑧⑨⑩])\s*[\).）．.、:：-]?\s*/u,
      "",
    )
    // Strip explicit list markers, preserving values such as 10万円, 2.0L and 0-100km/h.
    .replace(/^\s*\d{1,2}(?:[).）．.、:：](?!\d)\s*|\s+[-–—]\s+)/u, "")
    .trim();
}

export function formatArticleDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10).replaceAll("-", ".");
}
