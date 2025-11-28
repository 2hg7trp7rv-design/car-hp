// lib/columns.ts
import columnsRaw from "@/data/columns.json";

// もう OWNER_STORY は扱わないので型からも削除
export type ColumnCategory = "MAINTENANCE" | "TECHNICAL";

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

  const rawCategory =
    typeof raw.category === "string" ? raw.category.toUpperCase() : "";

  // MAINTENANCE / TECHNICAL 以外は一旦 TECHNICAL に寄せる
  const category: ColumnCategory =
    rawCategory === "MAINTENANCE" ? "MAINTENANCE" : "TECHNICAL";

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
const allColumns: ColumnItem[] = Array.isArray(columnsRaw)
  ? (columnsRaw as any[])
      .filter((raw) => {
        const cat =
          typeof raw?.category === "string"
            ? raw.category.toUpperCase()
            : "";
        // カテゴリ未設定は許容、OWNER_STORY だけ除外
        if (!cat) return true;
        return cat !== "OWNER_STORY";
      })
      .map(normalizeColumnItem)
      .sort((a, b) => {
        const aDate = a.publishedAt ?? "";
        const bDate = b.publishedAt ?? "";
        return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
      })
  : [];

export async function getAllColumns(): Promise<ColumnItem[]> {
  return allColumns;
}

export async function getColumnBySlug(
  slug: string,
): Promise<ColumnItem | null> {
  const item = allColumns.find((c) => c.slug === slug);
  return item ?? null;
}
