import type { ColumnItem } from "@/lib/columns";
import { ColumnCard } from "@/components/column/ColumnCard";

type Props = {
  columns: ColumnItem[];
  className?: string;
};

export function RelatedColumnsGrid({ columns, className }: Props) {
  if (!columns || columns.length === 0) return null;

  return (
    <div className={className ?? "grid gap-4 md:grid-cols-2"}>
      {columns.map((col, i) => (
        <ColumnCard key={col.slug} column={col} delay={80 + i * 40} />
      ))}
    </div>
  );
}
