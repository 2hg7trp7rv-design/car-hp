import { getHeritagePreviewText, type HeritageItem } from "@/lib/heritage";
import { HeritageMiniCard } from "@/components/heritage/HeritageMiniCard";

function formatDateLabel(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

type Props = {
  heritage: HeritageItem[];
  className?: string;
  maxChars?: number;
};

export function RelatedHeritageGrid({ heritage, className, maxChars = 160 }: Props) {
  if (!heritage || heritage.length === 0) return null;

  return (
    <div className={className ?? "grid gap-4 md:grid-cols-2"}>
      {heritage.map((h, i) => {
        const title = (h as any).heroTitle ?? (h as any).titleJa ?? h.title;
        const preview = getHeritagePreviewText(h, { maxChars });
        const dateLabel = formatDateLabel(h.publishedAt ?? h.updatedAt ?? null);
        return (
          <HeritageMiniCard
            key={h.slug}
            slug={h.slug}
            title={title}
            preview={preview}
            dateLabel={dateLabel}
            delay={80 + i * 40}
          />
        );
      })}
    </div>
  );
}
