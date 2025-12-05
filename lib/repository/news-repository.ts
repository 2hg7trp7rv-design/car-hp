// lib/repository/news-repository.ts

import newsRaw from "@/data/news-latest.json";

/**
 * data/news-latest.json の1件分の生データ
 *
 * 例:
 * {
 *   "id": "2025-toyota-solid-state-ev-flagship",
 *   "sourceUrl": "https://...",
 *   "title": "...",
 *   "titleJa": "...",
 *   "excerpt": "...",
 *   "comment": "...",
 *   "maker": "TOYOTA",
 *   "category": "NEW_MODEL",
 *   "tags": [...],
 *   "publishedAt": "2025-04-01T09:00:00+09:00",
 *   "imageUrl": "/images/news/..."
 * }
 */
export type RawNewsRecord = {
  id?: string;
  sourceUrl?: string;
  title?: string;
  titleJa?: string;
  excerpt?: string;
  comment?: string;
  maker?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  imageUrl?: string;
  // 将来拡張用に余白を残しておく
  [key: string]: unknown;
};

/**
 * 画面やドメイン層で扱う正規化済みニュース
 *
 * 既存のlib/news.tsで使っていた型をベースにしている
 */
export type NewsItem = {
  id: string;

  /** 元記事のURL */
  url: string;
  /** Next.jsのLink用エイリアス(/news/[id]) */
  link: string;

  /** 元の記事タイトル */
  title: string;
  /** 自動翻訳や手動翻訳した日本語タイトル */
  titleJa?: string | null;
  /** 要約・リード文 */
  excerpt?: string | null;

  /** カテゴリー("EV""SPORTS"など任意文字列) */
  category?: string | null;
  /** メーカー("BMW""TOYOTA""OTHER"など) */
  maker?: string | null;
  /** タグ一覧 */
  tags?: string[];

  /** 媒体名("Response""CarWatch"など) */
  sourceName?: string | null;

  /** 公開日時(ISO文字列) */
  publishedAt?: string | null;
  /** データ生成日時(ISO文字列) */
  createdAt?: string | null;

  /** 編集部コメント(生データ) */
  editorNote?: string | null;
  /** 日本語コメント(画面表示用) */
  commentJa?: string | null;

  /** 公開日時の日本語整形(例:"2025年1月1日") */
  publishedAtJa?: string | null;

  /** サムネイル画像URL */
  imageUrl?: string | null;
};

// ---------- 内部ユーティリティ ----------

function safeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateJa(iso?: string | null): string | undefined {
  const d = parseDate(iso ?? undefined);
  if (!d) return undefined;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * data/news-latest.json → NewsItem への正規化
 *
 * ここで
 * sourceUrl → url
 * comment → editorNote,commentJa
 * publishedAt → publishedAt,publishedAtJa
 * をまとめて吸収する
 */
function normalizeNews(
  raw: RawNewsRecord,
  index: number,
): NewsItem | null {
  const id =
    safeString(raw.id) ??
    `news-${index}`;

  const url =
    safeString(raw.sourceUrl) ??
    "#";

  const title =
    safeString(raw.title) ??
    "タイトル未設定";

  const titleJa = safeString(raw.titleJa);
  const excerpt = safeString(raw.excerpt);

  const maker = safeString(raw.maker) ?? null;
  const category = safeString(raw.category) ?? null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const publishedAt = safeString(raw.publishedAt) ?? null;
  const createdAt = publishedAt;

  const editorNote = safeString(raw.comment) ?? null;
  const commentJa = editorNote;

  const publishedAtJa =
    formatDateJa(publishedAt) ?? null;

  const imageUrl =
    safeString(raw.imageUrl) ?? null;

  // 最低限idとtitleだけあれば採用する
  if (!id || !title) return null;

  const link = `/news/${encodeURIComponent(id)}`;

  const item: NewsItem = {
    id,
    url,
    link,
    title,
    titleJa: titleJa ?? null,
    excerpt: excerpt ?? null,
    category,
    maker,
    tags,
    sourceName: null, // 現状JSONにないので空欄
    publishedAt,
    createdAt,
    editorNote,
    commentJa,
    publishedAtJa,
    imageUrl,
  };

  return item;
}

// ---------- 永続化層:全件読み込み ----------

const RAW_ITEMS: RawNewsRecord[] = Array.isArray(newsRaw)
  ? (newsRaw as RawNewsRecord[])
  : [];

const ALL_NEWS: NewsItem[] = RAW_ITEMS
  .map(normalizeNews)
  .filter((item): item is NewsItem => item !== null);

// ---------- Repository公開関数 ----------

export function findAllNews(): NewsItem[] {
  return ALL_NEWS;
}

/**
 * id完全一致で1件取得
 * エンコードの揺れなどはドメイン層で吸収する
 */
export function findNewsByIdExact(
  id: string,
): NewsItem | undefined {
  if (!id) return undefined;
  return ALL_NEWS.find((item) => item.id === id);
}
