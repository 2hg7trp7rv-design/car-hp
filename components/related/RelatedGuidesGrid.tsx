import type { GuideItem } from "@/lib/guides";
import { GuideCard } from "@/components/guide/GuideCard";

type Props = {
  guides: GuideItem[];
  className?: string;
};

export function RelatedGuidesGrid({ guides, className }: Props) {
  if (!guides || guides.length === 0) return null;

  return (
    <div className={className ?? "grid gap-4 md:grid-cols-2"}>
      {guides.map((guide, i) => (
        <GuideCard key={guide.slug} guide={guide} delay={80 + i * 40} />
      ))}
    </div>
  );
}
