// lib/content-types.ts
// CAR BOUTIQUE 共通のコンテンツ型定義

// 記事ステータス
export type ContentStatus = "draft" | "published" | "archived";

/**
 * 共通メタ情報(SEOなど)のベース
 * どのコンテンツタイプでも基本的にはこの形を踏襲する
 */
export type BaseContentMeta = {
  /** 不変の内部ID(JSONやCMSの主キー相当) */
  id: string;

  /** ルーティング用スラッグ(/guide/xxx,/column/yyyなど) */
  slug: string;

  /** コンテンツ種別(GUIDE/COLUMN/NEWS/HERITAGEなど) */
  type: string;

  /** 下書き/公開/アーカイブ */
  status: ContentStatus;

  /** 記事タイトル */
  title: string;

  /** 一覧用の短い要約 */
  summary?: string | null;

  /** SEOタイトル(指定がなければtitleを使う) */
  seoTitle?: string | null;

  /** SEOディスクリプション(指定がなければsummaryを使う) */
  seoDescription?: string | null;

  /** 公開日時(ISO文字列) */
  publishedAt?: string | null;

  /** 最終更新日時(ISO文字列) */
  updatedAt?: string | null;

  /** タグ */
  tags?: string[];

  /** 関連する車種(slug) */
  relatedCarSlugs?: string[];
};

// ----------------------------------------
// GUIDE
// ----------------------------------------

export type GuideCategory = string;

export type GuideItem = BaseContentMeta & {
  type: "GUIDE";

  /** ガイドのカテゴリ(MONEY,MAINTENANCEなど/自由入力) */
  category?: GuideCategory | null;

  /** 読了目安時間(分) */
  readMinutes?: number | null;

  /** ヒーロー画像パス(任意) */
  heroImage?: string | null;

  /** Markdown本文 */
  body: string;
};

// ----------------------------------------
// COLUMN
// ----------------------------------------

// COLUMNカテゴリはある程度固定＋将来拡張のためstringも許可
export type ColumnCategory =
  | "OWNER_STORY"
  | "MAINTENANCE"
  | "TECHNICAL"
  | "MONEY"
  | "LIFESTYLE"
  | string;

export type ColumnItem = BaseContentMeta & {
  type: "COLUMN";

  /** COLUMNカテゴリ */
  category: ColumnCategory;

  /** 読了目安時間(分) */
  readMinutes?: number | null;

  /** ヒーロー画像パス(任意) */
  heroImage?: string | null;

  /** Markdown本文 */
  body: string;
};

// ----------------------------------------
// NEWS(将来のために最低限だけ定義しておく)
// 今回は型だけ用意しておき、Repository/Domainは別フェーズで拡張でもOK
// ----------------------------------------

export type NewsItem = BaseContentMeta & {
  type: "NEWS";

  /** メーカー公式など一次情報のURL */
  url: string;

  /** サイト内での詳細ページへのリンク(/news/[id]など) */
  link: string;

  /** 日本語タイトル(あれば優先的に表示) */
  titleJa?: string | null;

  /** 抄録(元記事要約) */
  excerpt?: string | null;

  /** 編集コメント(日本語) */
  commentJa?: string | null;

  /** メーカー名(BMW,TOYOTAなど) */
  maker?: string | null;

  /** NEWS用カテゴリ(NEW_MODEL,RECALLなど自由入力) */
  category?: string | null;

  /** ソース名(メーカー名,媒体名など) */
  sourceName?: string | null;

  /** RSSフィードIDなど */
  rssId?: string | null;

  /** 日本語表記済みの公開日(任意) */
  publishedAtJa?: string | null;

  /** 元データの作成日時(公開日と同じでも可) */
  createdAt?: string | null;

  /** 編集注記など */
  editorNote?: string | null;

  /** サムネイル画像など */
  imageUrl?: string | null;
};

// ----------------------------------------
// HERITAGE(最低限)
// ----------------------------------------

export type HeritageKind = "ERA" | "BRAND" | "CAR";

export type HeritageItem = {
  id: string;
  slug: string;
  kind: HeritageKind;

  title: string;
  subtitle?: string;
  lead?: string;

  eraLabel?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  generationCode?: string | null;
  years?: string | null;

  heroImage?: string | null;
  heroTone?: string | null;

  /** 本文(Markdownやリッチテキストをプレーンテキストで持たせてもOK) */
  body: string;

  /** ハイライト箇条書き */
  highlights?: string[] | null;

  /** タグ */
  tags?: string[] | null;

  /** 関連する車種IDなど */
  relatedCarIds?: string[] | null;
};
