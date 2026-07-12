// lib/content/internal-link-index.ts
// Internal link title index used to render URL-like references as article cards.

import { getAllColumns } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";
import type { GuideActionBox } from "@/lib/content-types";

export type InternalLinkKind = "GUIDE" | "COLUMN" | "PAGE";

export type InternalLinkMeta = {
  title: string;
  kind: InternalLinkKind;
};

const STATIC_INTERNAL_LINKS: Record<string, InternalLinkMeta> = {
  "/guide": { title: "ガイド一覧", kind: "GUIDE" },
  "/column": { title: "コラム一覧", kind: "COLUMN" },
  "/search": { title: "検索", kind: "PAGE" },
  "/site-map": { title: "サイトマップ", kind: "PAGE" },
};

let cache: Record<string, InternalLinkMeta> | null = null;

function firstNonEmpty(...candidates: Array<string | null | undefined>): string {
  for (const c of candidates) {
    const v = (c ?? "").toString().trim();
    if (v) return v;
  }
  return "";
}

export async function getInternalLinkIndex(): Promise<Record<string, InternalLinkMeta>> {
  if (cache) return cache;

  const [columns, guides] = await Promise.all([getAllColumns(), getAllGuides()]);
  const idx: Record<string, InternalLinkMeta> = { ...STATIC_INTERNAL_LINKS };

  for (const c of columns) {
    const title = firstNonEmpty(c.titleJa, c.title);
    idx[`/column/${c.slug}`] = { title, kind: "COLUMN" };
  }

  for (const g of guides) {
    const title = firstNonEmpty(g.titleJa, g.title);
    idx[`/guide/${g.slug}`] = { title, kind: "GUIDE" };
  }

  cache = idx;
  return idx;
}

export function inferKindFromHref(href: string): InternalLinkKind {
  const h = (href ?? "").toString();
  if (h.startsWith("/guide")) return "GUIDE";
  if (h.startsWith("/column")) return "COLUMN";
  return "PAGE";
}

function normalizedArticleDetailHref(raw: string): string | null {
  const href = String(raw ?? "").trim().split("#")[0]?.split("?")[0] ?? "";
  if (!/^\/(guide|column)\/[^/]+\/?$/u.test(href)) return null;
  return href.replace(/\/+$/u, "");
}

export function isDiscoverableArticleHref(
  href: string,
  linkIndex: Record<string, InternalLinkMeta>,
): boolean {
  const articleHref = normalizedArticleDetailHref(href);
  return !articleHref || Boolean(linkIndex[articleHref]);
}

/** Defense in depth for data-driven NEXT ACTION links. */
export function filterActionBoxForDiscovery(
  actionBox: GuideActionBox | null | undefined,
  linkIndex: Record<string, InternalLinkMeta>,
): GuideActionBox | null {
  if (!actionBox) return null;
  const actions = actionBox.actions.filter(
    (action) => action.external === true || isDiscoverableArticleHref(action.href, linkIndex),
  );
  if (actions.length === 0) return null;
  return { ...actionBox, actions };
}
