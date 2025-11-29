// lib/guides.ts
import guidesData from "@/data/guides.json";

// カテゴリは data-model の設計どおり「任意の string 」とする
export type GuideCategory = string;

export type GuideItem = {
  id: string;
  slug: string;
  title: string;
  category?: GuideCategory | null;
  summary: string;
  body: string;
  relatedCarSlugs?: string[];
  publishedAt?: string | null;
};

type RawGuide = (typeof guidesData)[number];

function normalizeSlug(item: Partial<RawGuide>): string {
  if (item.slug && item.slug.length > 0) return item.slug;
  if (item.id && item.id.length > 0) return item.id;
  return "";
}

function normalizeGuide(raw: RawGuide): GuideItem | null {
  const slug = normalizeSlug(raw);
  if (!slug) return null;

  if (!raw.id || !raw.title || !raw.summary || !raw.body) {
    return null;
  }

  const normalized: GuideItem = {
    id: String(raw.id),
    slug,
    title: String(raw.title),
    summary: String(raw.summary),
    body: String(raw.body),
    category: (raw as any).category ?? null,
    relatedCarSlugs: Array.isArray((raw as any).relatedCarSlugs)
      ? ((raw as any).relatedCarSlugs as string[])
      : [],
    publishedAt: (raw as any).publishedAt ?? null,
  };

  return normalized;
}

function buildAllGuides(): GuideItem[] {
  const seen = new Map<string, GuideItem>();

  for (const raw of guidesData) {
    const normalized = normalizeGuide(raw);
    if (!normalized) continue;

    if (seen.has(normalized.slug)) continue;
    seen.set(normalized.slug, normalized);
  }

  const result = Array.from(seen.values());

  result.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    if (ta !== tb) return tb - ta;

    return a.title.localeCompare(b.title, "ja");
  });

  return result;
}

const ALL_GUIDES: GuideItem[] = buildAllGuides();

export async function getAllGuides(): Promise<GuideItem[]> {
  return ALL_GUIDES;
}

export async function getGuideBySlug(
  slug: string,
): Promise<GuideItem | null> {
  return ALL_GUIDES.find((g) => g.slug === slug) ?? null;
}
