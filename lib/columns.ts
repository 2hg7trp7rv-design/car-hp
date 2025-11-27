// lib/columns.ts
import columnsRaw from "@/data/columns.json";

export type ColumnCategory = "OWNER_STORY" | "MAINTENANCE" | "TECHNICAL";

export type ColumnItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ColumnCategory;
  tags?: string[];
  publishedAt?: string; // ISO文字列
  readMinutes?: number; // 読了目安
  heroImage?: string;
  body: string; // Markdownライクなテキスト

  /**
   * このコラムが特に関連する車種の slug 一覧。
   * 例: ["bmw-530i-g30", "toyota-harrier-80"]
   * app/cars/[slug]/page.tsx から利用される想定。
   */
  relatedCarSlugs?: string[];
};

function normalizeColumnItem(raw: any): ColumnItem {
  const slug: string = raw.slug ?? raw.id ?? "";
  const id: string = raw.id ?? slug;

  const rawCategory = typeof raw.category === "string" ? raw.category : "";
  const category: ColumnCategory =
    rawCategory === "MAINTENANCE" || rawCategory === "TECHNICAL"
      ? (rawCategory as ColumnCategory)
      : "TECHNICAL";

  return {
    id,
    slug,
    title: raw.title ?? "(タイトル未設定)",
    summary: raw.summary ?? "",
    category,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    publishedAt: raw.publishedAt ?? undefined,
    readMinutes:
      typeof raw.readMinutes === "number" ? raw.readMinutes : undefined,
    heroImage: raw.heroImage ?? undefined,
    body: raw.body ?? "",
    relatedCarSlugs: Array.isArray(raw.relatedCarSlugs)
      ? raw.relatedCarSlugs
      : undefined,
  };
}

// OWNER_STORY カテゴリの記事はここで除外する
const filteredRaw: any[] = Array.isArray(columnsRaw)
  ? (columnsRaw as any[]).filter((raw) => {
      const cat = typeof raw?.category === "string" ? raw.category : "";
      // MAINTENANCE / TECHNICAL 以外は原則除外（カテゴリ未設定は許容）
      if (!cat) return true;
      return cat !== "OWNER_STORY";
    })
  : [];

const allColumns: ColumnItem[] = filteredRaw
  .map(normalizeColumnItem)
  .sort((a, b) => {
    const aDate = a.publishedAt ?? "";
    const bDate = b.publishedAt ?? "";
    return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
  });

export async function getAllColumns(): Promise<ColumnItem[]> {
  return allColumns;
}

export async function getColumnBySlug(
  slug: string,
): Promise<ColumnItem | null> {
  const item = allColumns.find((c) => c.slug === slug);
  return item ?? null;
}
