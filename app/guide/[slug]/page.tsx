import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideEditorialArticlePage } from "@/components/guide/detail/GuideEditorialArticlePage";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { getAllGuides, getGuideBySlug, getRelatedGuidesV12 } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";
import { resolveOgImageUrl } from "@/lib/public-assets";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";
import { isIndexableGuide } from "@/lib/seo/indexability";
import { INDEX_ROBOTS, NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { hasSubstantiveArticleContent } from "@/lib/content/discoverability";
type PageProps = {
  params: Promise<{ slug: string }>;
};

// Only Registry-approved public slugs are emitted by generateStaticParams.
// Reject every other slug at the router boundary to avoid streamed soft-404s.
// Next.js currently logs a false-positive NoFallbackError for rejected params
// (vercel/next.js#90537), but the strict 404 boundary remains the safer policy.
export const dynamicParams = false;

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "ガイドが見つかりません",
      description: "指定されたガイドページが見つかりませんでした。",
      robots: NOINDEX_ROBOTS,
    };
  }

  const titleBase = buildGuideTitleBase(guide);
  const titleFull = withBrand(titleBase);
  const description = buildGuideDescription(guide);
  const url = `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`;
  const rawImage = guide.ogImageUrl ?? guide.heroImage ?? guide.thumbnail ?? null;
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

  return {
    title: titleBase,
    description,
    alternates: { canonical: url },
    openGraph: { title: titleFull, description, type: "article", url, images: [image] },
    twitter: { card: "summary_large_image", title: titleFull, description, images: [image] },
    robots: isIndexableGuide(guide) ? INDEX_ROBOTS : NOINDEX_ROBOTS,
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const titleOnly = !hasSubstantiveArticleContent(guide);
  const related = titleOnly ? [] : await getRelatedGuidesV12(guide, 3);
  const linkIndex = titleOnly ? {} : await getInternalLinkIndex();

  return <GuideEditorialArticlePage guide={guide} related={related} linkIndex={linkIndex} />;
}
