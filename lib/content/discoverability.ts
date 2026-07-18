import type { ArticleLike } from "@/lib/content-types";
import {
  evaluatePublicationContract,
  hasSubstantivePublicationContent,
} from "@/lib/content/publication-contract";

type DiscoveryCandidate = Pick<
  ArticleLike,
  "slug" | "title" | "status" | "publicState" | "noindex" | "body" | "detailSections"
>;

/**
 * Returns true only when an article contains an actual readable body.
 * Metadata, a lead, FAQ, sources, and a title alone do not make a page
 * discoverable. Repositories normally build `body` from structured sections,
 * while the section check keeps this safe for partially normalised fixtures.
 */
export function hasSubstantiveArticleContent(
  item: Pick<DiscoveryCandidate, "body" | "detailSections"> | null | undefined,
): boolean {
  return hasSubstantivePublicationContent(item);
}

/**
 * Compatibility predicate. The actual decision belongs to the shared
 * publication contract; archives, search and related content consume Registry
 * output, while this remains for SEO diagnostics and legacy call sites.
 */
export function isArticleDiscoverable(
  item: DiscoveryCandidate | null | undefined,
): boolean {
  return evaluatePublicationContract(item).disposition === "public";
}
