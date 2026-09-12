import type { PublicState } from "@/lib/content-types";

export type PublicationFields = {
  status?: string | null;
  publicState?: unknown;
  noindex?: boolean | null;
};

/** Missing status/state retains the legacy published default. Explicit privacy wins. */
export function publicationPolicy(item: PublicationFields | null | undefined) {
  const published = Boolean(item) && (!item?.status || item.status === "published");
  const raw = typeof item?.publicState === "string" ? item.publicState.trim().toLowerCase() : "";
  const explicitState: PublicState | null =
    raw === "index" || raw === "noindex" || raw === "draft" || raw === "redirect" ? raw : null;
  const state = explicitState ?? (published ? "index" : "draft");
  const accessible = published && (state === "index" || state === "noindex");
  return {
    published,
    explicitState,
    state,
    accessible,
    indexable: accessible && state === "index" && item?.noindex !== true,
  };
}

export function isPublicContent(item: PublicationFields): boolean {
  return publicationPolicy(item).accessible;
}
