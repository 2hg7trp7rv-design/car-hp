// lib/guides.ts
import guidesRaw from "@/data/guides.json";

export type GuideCategory = "MONEY" | "SELL";

export type GuideItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: GuideCategory;
  tags?: string[];
  publishedAt?: string; // ISO文字列
  readMinutes?: number; // 読了目安（分）
  heroImage?: string;
  body: string; // Markdownライクなテキスト
};

function normalizeGuideItem(raw: any): GuideItem {
  const slug: string = raw.slug ?? raw.id ?? "";
  const id: string = raw.id ?? slug;

  return {
    id,
    slug,
    title: raw.title ?? "(タイトル未設定)",
    summary: raw.summary ?? "",
    category: (raw.category as GuideCategory) ?? "MONEY",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    publishedAt: raw.publishedAt ?? undefined,
    readMinutes:
      typeof raw.readMinutes === "number" ? raw.readMinutes : undefined,
    heroImage: raw.heroImage ?? undefined,
    body: raw.body ?? "",
  };
}

const allGuides: GuideItem[] = Array.isArray(guidesRaw)
  ? (guidesRaw as any[])
      .map(normalizeGuideItem)
      .sort((a, b) => {
        const aDate = a.publishedAt ?? "";
        const bDate = b.publishedAt ?? "";
        return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
      })
  : [];

export async function getAllGuides(): Promise<GuideItem[]> {
  return allGuides;
}

export async function getGuideBySlug(
  slug: string,
): Promise<GuideItem | null> {
  const item = allGuides.find((g) => g.slug === slug);
  return item ?? null;
}
