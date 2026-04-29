import { Reveal } from "@/components/animation/Reveal";
import { ContentGridCard } from "@/components/content/ContentGridCard";

import type { GuideItem } from "@/lib/guides";
import { resolveGuideDisplayTag } from "@/lib/display-tags";
import { resolveGuideCardImage } from "@/lib/display-tag-media";

type Props = {
  guide: GuideItem;
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

export function GuideCard({ guide, delay = 0, layout = "standard" }: Props) {
  return (
    <Reveal delay={delay}>
      <ContentGridCard
        href={`/guide/${encodeURIComponent(guide.slug)}`}
        title={guide.title}
        date={formatDate(guide.publishedAt ?? guide.updatedAt ?? null)}
        imageSrc={resolveGuideCardImage(guide)}
        eyebrow={resolveGuideDisplayTag(guide)}
        excerpt={guide.summary || guide.lead || undefined}
        aspect={layout === "feature" ? "portrait" : "landscape"}
        seedKey={guide.slug}
        posterVariant="guide"
        className={layout === "feature" ? "lg:h-full" : undefined}
      />
    </Reveal>
  );
}
