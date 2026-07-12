import type { ArticleLike } from "@/lib/content-types";

type DiscoveryCandidate = Pick<
  ArticleLike,
  "slug" | "title" | "status" | "publicState" | "noindex" | "body" | "detailSections"
>;

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Returns true only when an article contains an actual readable body.
 * Metadata, a lead, FAQ, sources, and a title alone do not make a page
 * discoverable. Repositories normally build `body` from structured sections,
 * while the section check keeps this safe for partially normalised fixtures.
 */
export function hasSubstantiveArticleContent(
  item: Pick<DiscoveryCandidate, "body" | "detailSections"> | null | undefined,
): boolean {
  if (!item) return false;
  if (hasText(item.body)) return true;

  return (item.detailSections ?? []).some(
    (section) =>
      hasText(section?.title) &&
      Array.isArray(section?.blocks) &&
      section.blocks.some(Boolean),
  );
}

/**
 * Single policy used by archives, search, site maps, recommendations and
 * generated CTA/link indexes. Direct routes intentionally do not use this
 * predicate, so a published noindex placeholder can still be previewed by URL.
 */
export function isArticleDiscoverable(
  item: DiscoveryCandidate | null | undefined,
): boolean {
  if (!item) return false;

  return (
    hasText(item.slug) &&
    hasText(item.title) &&
    item.status === "published" &&
    item.publicState === "index" &&
    item.noindex !== true &&
    hasSubstantiveArticleContent(item)
  );
}
