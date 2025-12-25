"use client";

import { getGuideBySlug } from "@/lib/guides";
import { GuideCard } from "@/components/guide/GuideCard";

interface GuideCardListProps {
  guideSlugs: string[];
}

export function GuideCardList({ guideSlugs }: GuideCardListProps) {
  const guides = guideSlugs
    .map((slug) => getGuideBySlug(slug))
    .filter((g): g is NonNullable<ReturnType<typeof getGuideBySlug>> => Boolean(g));

  if (guides.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {guides.map((guide, index) => (
        <GuideCard key={guide.slug} guide={guide} delay={index * 100} />
      ))}
    </div>
  );
}
