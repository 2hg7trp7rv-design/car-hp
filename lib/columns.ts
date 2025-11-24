// lib/columns.ts
export type ColumnCategory =
  | "OWNER_STORY"
  | "MAINTENANCE"
  | "TECHNICAL"
  | "MONEY"
  | "USED";

export type ColumnItem = {
  id: string;
  slug: string;
  title: string;
  category: ColumnCategory;
  tags: string[];
  summary: string;
  publishedAt: string; // ISO 形式 "2025-11-24"
};

const columns: ColumnItem[] = [
  {
    id: "b48-vanos-longlife",
    slug: "b48-vanos-longlife",
    title: "B48エンジンのVANOSとロングライフオイルの本当の関係",
    category: "MAINTENANCE",
    tags: ["BMW", "B48", "VANOS", "ロングライフオイル"],
    summary:
      "BMW B48エンジンのVANOS系トラブルは、本当にロングライフオイルだけのせいなのか。実際の構造と使用環境から冷静に整理します。",
    publishedAt: "2025-11-24",
  },
  // 今後ここに別のコラムも増やしていく
];

export async function getAllColumns(): Promise<ColumnItem[]> {
  // 将来CMS連携などに備えて async にしておく
  // 公開日が新しい順でソート
  return [...columns].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getColumnBySlug(
  slug: string,
): Promise<ColumnItem | undefined> {
  const list = await getAllColumns();
  return list.find((c) => c.slug === slug);
}
