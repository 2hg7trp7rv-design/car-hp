import { notFound } from "next/navigation";

import { ColumnEditorialArticlePage } from "@/components/column/detail/ColumnEditorialArticlePage";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { getColumnBySlug, getRelatedColumnsV12 } from "@/lib/columns";

const DESIGN_PREVIEW_SLUG = "modern-car-custom-regret-reason-column";

export default async function Home() {
  const item = await getColumnBySlug(DESIGN_PREVIEW_SLUG);
  if (!item) notFound();

  const related = await getRelatedColumnsV12(item, 3);
  const linkIndex = await getInternalLinkIndex();

  return (
    <ColumnEditorialArticlePage
      item={item}
      related={related}
      linkIndex={linkIndex}
    />
  );
}
