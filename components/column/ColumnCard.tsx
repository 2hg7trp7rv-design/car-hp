import { Reveal } from "@/components/animation/Reveal";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import type { ColumnItem } from "@/lib/columns";
import { resolveColumnDisplayTag } from "@/lib/display-tags";
import { resolveColumnCardImage } from "@/lib/display-tag-media";

type Props = {
  column: ColumnItem;
  delay?: number;
  layout?: "feature" | "standard";
};

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function ColumnCard({ column, delay = 0, layout = "standard" }: Props) {
  return (
    <Reveal delay={delay}>
      <ContentGridCard
        href={`/column/${encodeURIComponent(column.slug)}`}
        title={column.title}
        date={formatDate(column.publishedAt ?? column.updatedAt ?? null)}
        imageSrc={resolveColumnCardImage(column)}
        eyebrow={resolveColumnDisplayTag(column)}
        excerpt={column.summary || column.description || undefined}
        aspect={layout === "feature" ? "portrait" : "landscape"}
        seedKey={column.slug}
        posterVariant="column"
      />
    </Reveal>
  );
}
