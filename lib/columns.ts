// lib/columns.ts

export type ColumnCategory =
  | "technical"
  | "ownership"
  | "guide"
  | "history";

export type ColumnMeta = {
  slug: string;
  title: string;
  subTitle?: string;
  category: ColumnCategory;
  tags: string[];
  publishedAt: string; // ISO形式 "2025-11-24"
  readingTimeMinutes: number;
  summary: string;
};

// コラム一覧
const COLUMNS: ColumnMeta[] = [
  {
    slug: "b48-vanos-longlife",
    title: "BMW B48エンジン×VANOSと長く付き合うための基礎知識",
    subTitle: "530i G30オーナー視点で見る「強み」と「気をつけたいポイント」",
    category: "technical",
    tags: ["BMW", "B48", "VANOS", "メンテナンス"],
    publishedAt: "2025-11-24",
    readingTimeMinutes: 18,
    summary:
      "BMWのモジュラー4気筒B48エンジンと可変バルブタイミング機構VANOSについて、「どんな仕組みか」「どこが強みか」「どのあたりがトラブルになりやすいのか」を、530i G30オーナー目線も交えながら整理したロングコラム。購入検討時のチェックポイントや、長く乗るためのメンテ戦略までを一気に俯瞰します。",
  },
];

export function getAllColumns(): ColumnMeta[] {
  return [...COLUMNS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getColumnBySlug(slug: string): ColumnMeta | undefined {
  return COLUMNS.find((c) => c.slug === slug);
}
