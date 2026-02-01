// lib/content/text.ts
//
// Text utilities for article bodies:
// - Remove visible asterisks ("*", "＊") while still allowing **bold** rendering
// - Force "1) 2) 3)" style lists to break lines
// - Extract internal URLs ("/guide/..", "column/..") and return them to be rendered as cards

export function normalizeInternalHref(raw: string): string | null {
  const src = (raw ?? "").toString().trim();
  if (!src) return null;

  // Strip wrapping punctuation (common in Japanese manuscripts)
  let href = src
    .replace(/^[\s　"'“”「『【（(\[]+/, "")
    .replace(/[\s　"'“”」』】）)\].,!?！？。、]+$/, "");

  // Normalize: allow "column/slug" as well as "/column/slug"
  if (!href.startsWith("/")) href = `/${href}`;

  // Collapse duplicate slashes
  href = href.replace(/\/{2,}/g, "/");

  // Drop trailing slash (except root)
  if (href.length > 1) href = href.replace(/\/+$/, "");

  // Allow only internal content routes
  const ok = /^\/(guide|column|cars|heritage|news)(\/|$)/.test(href);
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

/**
 * Insert line breaks before numbered bullets like "1)" "2)" "3)".
 * - If the token is already at line start, keep it as-is.
 * - Works for both half-width and full-width closing paren: ")" / "）"
 */
export function enforceNumberedLineBreaks(input: string): string {
  const src = (input ?? "").toString();
  if (!src) return "";

  return src.replace(/(\d{1,2}[)\）])/g, (m, _p, offset, full) => {
    if (offset === 0) return m;
    const prev = full[offset - 1];
    if (prev === "\n") return m;
    return `\n${m}`;
  });
}

/**
 * Extract internal hrefs from:
 * - raw paths: "/guide/xxx", "column/yyy"
 * - markdown links: "[label](/guide/xxx)"
 *
 * Rule (1): internal URLs are removed from the visible text and rendered as cards below.
 */
export function extractInternalLinksFromText(raw: string): {
  text: string;
  internalHrefs: string[];
} {
  let text = (raw ?? "").toString();

  const hrefs: string[] = [];

  // 1) Markdown links: keep label, extract href if internal
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    const normalized = normalizeInternalHref(href);
    if (normalized) {
      hrefs.push(normalized);
      return (label ?? "").toString();
    }
    return full;
  });

  // 2) Raw internal paths (standalone tokens)
  // Examples:
  // - /guide/hub-paperwork
  // - column/import-car-hidden-costs-paperwork
  const re = /(^|[^A-Za-z0-9_])((?:\/)?(?:guide|column|cars|heritage|news)\/[a-z0-9][a-z0-9\-_\/]*)(?=$|[^A-Za-z0-9\-_\/])/gi;

  text = text.replace(re, (full, prefix, path) => {
    const normalized = normalizeInternalHref(path);
    if (normalized) hrefs.push(normalized);
    return prefix ?? "";
  });

  // Normalize spacing after removals
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/　{2,}/g, "　");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  const internalHrefs = uniqKeepOrder(hrefs);

  // Enforce numbered line breaks after internal link stripping
  text = enforceNumberedLineBreaks(text);

  return { text, internalHrefs };
}
