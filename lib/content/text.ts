import type { InternalLinkMeta } from "@/lib/content/internal-link-index";

const KNOWN_INLINE_TITLES: Record<string, string> = {
  "/guide": "ガイド一覧",
  "/column": "コラム一覧",
  "/cars": "車種一覧",
  "/heritage": "系譜の一覧",
};

export function normalizeInternalHref(raw: string): string | null {
  const src = (raw ?? "").toString().trim();
  if (!src) return null;

  let href = src
    .replace(/^[\s\u3000"'“”「『【（([]+/, "")
    .replace(/[\s\u3000"'“”」』】）).,!?！？。、\]]+$/, "");

  if (!href.startsWith("/")) href = `/${href}`;
  href = href.replace(/\/{2,}/g, "/");
  if (href.length > 1) href = href.replace(/\/+$/, "");

  const ok = /^\/(guide|column|cars|heritage)(\/|$)/.test(href);
  if (!ok) return null;

  return href;
}

function uniqKeepOrder(list: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of list) {
    const key = v.trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export function enforceNumberedLineBreaks(input: string): string {
  const src = (input ?? "").toString();
  if (!src) return "";

  return src.replace(/(\d{1,2}[)）])/g, (m, _p, offset, full) => {
    if (offset === 0) return m;
    const prev = full[offset - 1];
    if (prev === "\n") return m;
    return `\n${m}`;
  });
}

export function inlineLabelResolver(
  linkIndex: Record<string, InternalLinkMeta> | undefined,
  href: string,
): string {
  const normalized = normalizeInternalHref(href);
  if (!normalized) return "";

  const indexed = linkIndex?.[normalized]?.title?.trim();
  if (indexed) return indexed;

  return KNOWN_INLINE_TITLES[normalized] ?? "";
}

export function cleanupInternalLinkText(input: string): string {
  let text = (input ?? "").toString();

  text = text.replace(/（\s*）/g, "");
  text = text.replace(/\(\s*\)/g, "");
  text = text.replace(/\s+([。、,，])/g, "$1");
  text = text.replace(/([（(])\s+/g, "$1");
  text = text.replace(/\s+([）)])/g, "$1");
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/\u3000{2,}/g, "\u3000");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

export function extractInternalLinksFromText(
  raw: string,
  options?: {
    labelResolver?: (_href: string) => string;
  },
): {
  text: string;
  internalHrefs: string[];
} {
  let text = (raw ?? "").toString();

  const hrefs: string[] = [];
  const resolveLabel = options?.labelResolver;

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    const normalized = normalizeInternalHref(href);
    if (normalized) {
      hrefs.push(normalized);
      return (label ?? "").toString().trim();
    }
    return full;
  });

  const re = /(^|[^A-Za-z0-9_])((?:\/)?(?:guide|column|cars|heritage)(?:\/[a-z0-9][a-z0-9_/-]*)?)(?=$|[^A-Za-z0-9_/-])/gi;

  text = text.replace(re, (full, prefix, path) => {
    const normalized = normalizeInternalHref(path);
    if (!normalized) return full;

    hrefs.push(normalized);
    const label = resolveLabel?.(normalized)?.trim();
    return `${prefix ?? ""}${label || ""}`;
  });

  const internalHrefs = uniqKeepOrder(hrefs);

  text = cleanupInternalLinkText(text);
  text = enforceNumberedLineBreaks(text);

  return { text, internalHrefs };
}
