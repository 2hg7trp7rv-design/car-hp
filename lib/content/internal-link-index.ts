// lib/content/internal-link-index.ts
// Internal link title index used to render URL-like references as article cards.

import { getAllColumns } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";

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
