// lib/repository/columns-repository.ts

/**
 * COLUMN DataSource層
 *
 * 役割
 * - data/columns.jsonの「生データ」を読み込み、ColumnItemに正規化して提供する
 * - 物理ファイル構成やJSONの揺れをこの層で吸収し、上位層(lib/columns.tsなど)から隠蔽する
 *
 * 非役割
 * - UI都合のフィルターやページネーション
 * - Markdownのパースや目次生成
 * - ルーティングやパス生成
 *
 * 拡張方針メモ
 * - 将来columns1.json columns2.jsonのように分割した場合も、このモジュールの中で統合する
 * - 外部CMS(API)に切り替える場合も、この層の実装を差し替えればlib/columns.tsやページ側を極力触らずに済む
 */

import columnsRaw from "@/data/columns.json";
import type {
  ColumnItem,
  ColumnCategory,
  ContentStatus,
} from "@/lib/content-types";

/**
 * JSONの生データ型
 * columns.jsonの1レコード分をそのまま表現する
 */
export type RawColumnRecord = {
  id?: string;
  slug?: string;
  type?: string;
  status?: ContentStatus;

  title?: string;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  category?: ColumnCategory;

  readMinutes?: number | null;
  heroImage?: string | null;

  body?: string;

  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];
  relatedCarSlugs?: string[];
};

// 便利なキー型
export type ColumnId = ColumnItem["id"];
export type ColumnSlug = ColumnItem["slug"];
export type ColumnTag = ColumnItem["tags"] extends (infer T)[]
  ? T
  : string;

/**
 * data/columns.jsonを配列にそろえる
 * 将来的に単一オブジェクト形式と混在してもこの関数で吸収する
 */
function toArray(data: unknown): RawColumnRecord[] {
  if (Array.isArray(data)) return data as RawColumnRecord[];
  if (data && typeof data === "object") {
    return [data as RawColumnRecord];
  }
  return [];
}

/**
 * 生レコードからColumnItemへ正規化
 *
 * ポイント
 * - idやslugが無い場合はインデックスベースで自動採番
 * - categoryやstatusが未定義のときはデフォルト値を入れる
 * - tagsやrelatedCarSlugsは配列かどうかのチェックを挟む
 */
function normalizeColumn(
  raw: RawColumnRecord,
  index: number,
): ColumnItem {
  const id = (raw.id ?? `column-${index + 1}`).trim();
  const slug = (raw.slug ?? id).trim();

  const status: ContentStatus =
    (raw.status as ContentStatus) ?? "published";

  const title = (raw.title ?? slug).trim();

  const summary = raw.summary ?? null;
  const seoTitle = raw.seoTitle ?? null;
  const seoDescription = raw.seoDescription ?? summary ?? null;

  const category: ColumnCategory =
    (raw.category as ColumnCategory) ?? "TECHNICAL";

  const readMinutes =
    typeof raw.readMinutes === "number" ? raw.readMinutes : null;

  const heroImage =
    typeof raw.heroImage === "string" && raw.heroImage.trim().length > 0
      ? raw.heroImage
      : null;

  const body = raw.body ?? "";

  const publishedAt = raw.publishedAt ?? null;
  const updatedAt = raw.updatedAt ?? null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : [];

  const relatedCarSlugs = Array.isArray(raw.relatedCarSlugs)
    ? raw.relatedCarSlugs.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
    : [];

  return {
    id,
    slug,
    type: "COLUMN",
    status,
    title,
    summary,
    seoTitle,
    seoDescription,
    category,
    readMinutes,
    heroImage,
    body,
    publishedAt,
    updatedAt,
    tags,
    relatedCarSlugs,
  };
}

// 生データ配列
const RAW_COLUMNS: RawColumnRecord[] = toArray(columnsRaw);

// ビルド時に一度だけ正規化
const ALL_COLUMNS_INTERNAL: ColumnItem[] = RAW_COLUMNS.map(
  normalizeColumn,
);

// ----------------------------------------
// Repository API 基本
// ----------------------------------------

/**
 * すべてのCOLUMN(ステータス問わず)を返す
 * 並び順は元のJSON定義順
 */
export function findAllColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL;
}

/**
 * slugで1件取得(ステータスは問わない)
 */
export function findColumnBySlug(
  slug: ColumnSlug,
): ColumnItem | undefined {
  return ALL_COLUMNS_INTERNAL.find((c) => c.slug === slug);
}

/**
 * idで1件取得(ステータスは問わない)
 */
export function findColumnById(id: ColumnId): ColumnItem | undefined {
  return ALL_COLUMNS_INTERNAL.find((c) => c.id === id);
}

// ----------------------------------------
// Repository API ステータス/カテゴリ/タグ別
// ----------------------------------------

/**
 * 指定ステータスのCOLUMN一覧を返す
 * デフォルトはpublishedのみ
 */
export function findColumnsByStatus(
  status: ContentStatus = "published",
): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL.filter((c) => c.status === status);
}

/**
 * 公開状態(published)のみを返す
 */
export function findPublishedColumns(): ColumnItem[] {
  return findColumnsByStatus("published");
}

/**
 * カテゴリ+ステータスで絞り込む
 * (ガイドや一覧のセクション別リスト用)
 */
export function findColumnsByCategory(
  category: ColumnCategory,
  opts?: { status?: ContentStatus },
): ColumnItem[] {
  const targetStatus = opts?.status ?? "published";
  return ALL_COLUMNS_INTERNAL.filter(
    (c) => c.category === category && c.status === targetStatus,
  );
}

/**
 * 指定タグを含むCOLUMNを返す
 * ステータスはデフォルトでpublishedに限定
 */
export function findColumnsByTag(
  tag: string,
  opts?: { status?: ContentStatus },
): ColumnItem[] {
  const targetStatus = opts?.status ?? "published";
  const normalized = tag.trim().toLowerCase();

  if (!normalized) return [];

  return ALL_COLUMNS_INTERNAL.filter((c) => {
    if (c.status !== targetStatus) return false;
    if (!c.tags || c.tags.length === 0) return false;
    return c.tags.some(
      (t) => t.trim().toLowerCase() === normalized,
    );
  });
}

/**
 * 指定車種slugと関連付けられているCOLUMNを返す
 */
export function findColumnsByRelatedCarSlug(
  carSlug: string,
  opts?: { status?: ContentStatus },
): ColumnItem[] {
  const targetStatus = opts?.status ?? "published";
  const normalized = carSlug.trim();

  if (!normalized) return [];

  return ALL_COLUMNS_INTERNAL.filter((c) => {
    if (c.status !== targetStatus) return false;
    if (!c.relatedCarSlugs || c.relatedCarSlugs.length === 0) {
      return false;
    }
    return c.relatedCarSlugs.includes(normalized);
  });
}

// ----------------------------------------
// Repository API メタ情報/インデックス
// ----------------------------------------

/**
 * 総件数(ステータス問わず)
 */
export function getColumnsCount(): number {
  return ALL_COLUMNS_INTERNAL.length;
}

/**
 * 公開状態の件数(publishedのみ)
 */
export function getPublishedColumnsCount(): number {
  return ALL_COLUMNS_INTERNAL.filter(
    (c) => c.status === "published",
  ).length;
}

/**
 * 利用されているカテゴリ一覧(重複排除)
 */
export function listAllColumnCategories(): ColumnCategory[] {
  const set = new Set<ColumnCategory>();
  for (const c of ALL_COLUMNS_INTERNAL) {
    if (c.category) {
      set.add(c.category);
    }
  }
  return Array.from(set);
}

/**
 * 利用されているタグ一覧(重複排除)
 */
export function listAllColumnTags(): ColumnTag[] {
  const set = new Set<string>();
  for (const c of ALL_COLUMNS_INTERNAL) {
    if (!c.tags) continue;
    for (const tag of c.tags) {
      if (typeof tag === "string" && tag.trim().length > 0) {
        set.add(tag.trim());
      }
    }
  }
  return Array.from(set);
}

/**
 * 日付付きのCOLUMNを公開日の新しい順にソートして返す
 * limitを指定すると先頭からlimit件に絞り込む
 */
export function findLatestColumns(
  opts?: {
    status?: ContentStatus;
    limit?: number;
  },
): ColumnItem[] {
  const targetStatus = opts?.status ?? "published";
  const limit = opts?.limit;

  const sortable = ALL_COLUMNS_INTERNAL.filter(
    (c) => c.status === targetStatus && c.publishedAt,
  );

  sortable.sort((a, b) => {
    const ta = a.publishedAt
      ? new Date(a.publishedAt).getTime()
      : 0;
    const tb = b.publishedAt
      ? new Date(b.publishedAt).getTime()
      : 0;
    return tb - ta;
  });

  if (typeof limit === "number" && limit > 0) {
    return sortable.slice(0, limit);
  }
  return sortable;
}

/**
 * 最終更新日時(updatedAt)ベースでの最新順
 * リストアップや管理用に使うことを想定
 */
export function findRecentlyUpdatedColumns(
  opts?: { status?: ContentStatus; limit?: number },
): ColumnItem[] {
  const targetStatus = opts?.status ?? "published";
  const limit = opts?.limit;

  const sortable = ALL_COLUMNS_INTERNAL.filter(
    (c) => c.status === targetStatus && c.updatedAt,
  );

  sortable.sort((a, b) => {
    const ta = a.updatedAt
      ? new Date(a.updatedAt).getTime()
      : 0;
    const tb = b.updatedAt
      ? new Date(b.updatedAt).getTime()
      : 0;
    return tb - ta;
  });

  if (typeof limit === "number" && limit > 0) {
    return sortable.slice(0, limit);
  }
  return sortable;
}

// ----------------------------------------
// 今後の拡張メモ
// ----------------------------------------
/*
将来的に行いたい拡張の候補

- バリデーション
  - idやslugの重複チェック
  - publishedステータスだがbodyが空のレコードがあれば警告
  - publishedAtが未来日のものを別扱いにするなど

- 物理ファイル分割
  - columns-technical.json columns-maintenance.jsonのように分割し
    RAW_COLUMNSにスプレッドで統合するだけで対応できる形を維持する

- 外部CMS連携
  - columnsRawの代わりにビルド時取得の静的JSONを読む形にしても
    上位層のAPI(findAllColumnsなど)は変えずに済むようにする
*/
