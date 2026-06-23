import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ColumnLesson17Page from "@/components/column/lesson17/ColumnLesson17Page";
import { getAllColumns, getColumnBySlug } from "@/lib/columns";
import { getSiteUrl } from "@/lib/site";
import { resolveOgImageUrl } from "@/lib/public-assets";
import { buildColumnDescription, buildColumnTitleBase, withBrand } from "@/lib/seo/serp";
import { isIndexableColumn } from "@/lib/seo/indexability";
import { INDEX_ROBOTS, NOINDEX_ROBOTS } from "@/lib/seo/robots";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const columns = await getAllColumns();
  return columns.map((column) => ({ slug: column.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getColumnBySlug(slug);

  if (!item) {
    return {
      title: "コラムが見つかりません",
      description: "指定されたコラムページが見つかりませんでした。",
      robots: NOINDEX_ROBOTS,
    };
  }

  const titleBase = buildColumnTitleBase(item);
  const titleFull = withBrand(titleBase);
  const description = buildColumnDescription(item);
  const url = `${getSiteUrl()}/column/${encodeURIComponent(item.slug)}`;
  const rawImage = ((item as any).ogImageUrl ?? item.thumbnail ?? item.heroImage ?? null) as string | null;
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

  return {
    title: titleBase,
    description,
    alternates: { canonical: url },
    openGraph: { title: titleFull, description, type: "article", url, images: [image] },
    twitter: { card: "summary_large_image", title: titleFull, description, images: [image] },
    robots: isIndexableColumn(item) ? INDEX_ROBOTS : NOINDEX_ROBOTS,
  };
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getColumnBySlug(slug);
  if (!item) notFound();

  return <ColumnLesson17Page />;
}
