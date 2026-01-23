// lib/content-types.ts

// ----------------------------------------
// 基本ステータス
// ----------------------------------------
export type ContentStatus = "draft" | "published" | "archived";

// ----------------------------------------
// Content Type
// ----------------------------------------
export type ContentType = "GUIDE" | "COLUMN" | "NEWS" | "HERITAGE" | "CAR" | string;

// ----------------------------------------
// 共通メタ(BaseContentMeta)
// ----------------------------------------
export type BaseContentMeta = {
  id: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;

  title: string;

  /**
   * 日本語タイトル（任意）
   */
  titleJa?: string | null;

  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];

  /**
   * 関連コンテンツ (回遊設計用 / 仕様書v1.2)
   */
  relatedCarSlugs?: string[]; // 関連車種
  relatedGuideSlugs?: string[]; // 関連ガイド
  relatedColumnSlugs?: string[]; // 関連コラム
  relatedHeritageSlugs?: string[]; // 関連HERITAGE

  /**
   * ユーザー意図タグ (仕様書v1.2)
   */
  intentTags?: string[];

  isFeatured?: boolean;
  isPinned?: boolean;
  priority?: number | null;

  seriesId?: string | null;
  seriesTitle?: string | null;
  seriesOrder?: number | null;

  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  noindex?: boolean;
};

// ----------------------------------------
// Monetize
// ----------------------------------------
export type MonetizeKey =
  | "sell_basic_checklist"
  | "sell_import_highclass"
  | "sell_timing"
  | "sell_loan_remain"
  | "sell_ikkatsu_phone"
  | "insurance_compare_core"
  | "insurance_saving"
  | "insurance_after_accident"
  | "shaken_rakuten"
  | "insurance_corporate"
  | "lease_sompo_noru"
  | "goods_drive_recorder"
  | "goods_child_seat"
  | "goods_car_wash_coating"
  | "goods_interior_clean"
  | "goods_jump_starter"
  // --- ★新規: 仕様書v1.2追加分 ---
  | "car_search_conditions"
  | "car_search_price"
  | "loan_estimate"
  | "loan_precheck"
  | "sell_price_check"
  | "sell_prepare"
  | string; // 拡張性を確保

export type MonetizeType = "direct" | "indirect" | "ad";

export type CtaVariant = {
  id: string;
  monetizeKey?: MonetizeKey | null;
  title?: string | null;
  lead?: string | null;
  ctaLabel?: string | null;
  whenIntentTagsAny?: string[] | null;
  priority?: number | null;
};

// ----------------------------------------
// GUIDE
// ----------------------------------------
export type GuideCategory =
  | "MONEY"
  | "BUY"
  | "SELL"
  | "MAINTENANCE"
  | "TROUBLE"
  | "LIFE"
  | "BEGINNER"
  | "ADVANCED"
  | "MAINTENANCE_COST"
  | "KNOWLEDGE"
  | string;

export type GuideItem = BaseContentMeta & {
  type: "GUIDE";
  category?: GuideCategory | null;
  readMinutes?: number | null;
  heroImage?: string | null;

  lead?: string | null;

  body: string;

  toc?:
    | {
        id: string;
        text: string;
        level: 2 | 3 | 4;
      }[]
    | null;

  monetizeKey?: MonetizeKey | null;
  monetizeType?: MonetizeType | null;

  ctaVariants?: CtaVariant[] | null;

  affiliateLinks?: Record<string, string> | null;
  internalLinks?: string[] | null;
};

// ----------------------------------------
// CARS
// ----------------------------------------
export type CarItem = BaseContentMeta & {
  type: "CAR";
  
  name: string;
  maker: string;
  /**
   * メーカーの正規化キー（URL/フィルタ用）
   * 例: "BMW" -> "bmw"
   */
  makerKey?: string;
  
  releaseYear?: number;
  
  // スペック・特徴
  difficulty?: string; // basic | intermediate | advanced など
  bodyType?: string;
  segment?: string;
  grade?: string;
  engine?: string;
  drive?: string;
  transmission?: string;
  fuel?: string;
  powerPs?: number;
  torqueNm?: number;
  fuelEconomy?: string;
  
  // テキスト
  summaryLong?: string;
  costImpression?: string; // 維持費の印象など
  
  heroImage?: string | null;
  mainImage?: string | null; // 互換性のため
  
  // 外部連携
  relatedNewsIds?: string[];
  
  // 特徴リスト
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  bestFor?: string[];
  notFor?: string[];
  maintenanceNotes?: string[];

  // サイズ
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;

  // 価格情報
  priceNew?: string;
  priceUsed?: string;
  zeroTo100?: number;
};

// ----------------------------------------
// COLUMN
// ----------------------------------------
export type ColumnCategory =
  | "OWNER_STORY"
  | "MAINTENANCE"
  | "TECHNICAL"
  | "MONEY"
  | "LIFESTYLE"
  | "TROUBLE"
  | "HISTORY"
  | "MARKET"
  | "EVENT"
  | string;

export type ColumnItem = BaseContentMeta & {
  type: "COLUMN";
  category: ColumnCategory;
  readMinutes?: number | null;
  heroImage?: string | null;

  body: string;

  toc?:
    | {
        id: string;
        text: string;
        level: 2 | 3 | 4;
      }[]
    | null;

  // 編集・SEO用メタデータ
  ctaType?: string | null;
  ctaNote?: string | null;
  searchIntent?: string | null;
  targetKeyword?: string | null;
  targetStep?: string | number | null;
  articleType?: string | null;
};

// ----------------------------------------
// NEWS
// ----------------------------------------
export type NewsItem = BaseContentMeta & {
  type: "NEWS";

  url: string;
  link: string;

  excerpt?: string | null;
  commentJa?: string | null;
  maker?: string | null;
  category?: string | null;

  sourceName?: string | null;
  sourceUrl?: string | null;
  rssId?: string | null;

  publishedAtJa?: string | null;

  editorNote?: string | null;

  imageUrl?: string | null;

  sourceLang?: string | null;
  originalTitle?: string | null;
};

// ----------------------------------------
// HERITAGE
// ----------------------------------------
export type HeritageKind = "ERA" | "BRAND" | "CAR";

export type HeritageSection = {
  id: string;
  /**
   * UI側では null を扱わず、欠損は undefined に統一する。
   * JSONの生データに null が混ざる可能性があるため、Repository/Domain 層で正規化してから利用する。
   */
  title?: string;
  summary?: string;
  image?: string; // ★ 追加

  carSlugs?: string[];
  guideSlugs?: string[];
  columnSlugs?: string[];
  stockCarQuery?: string; // ★ 追加: 在庫検索用のクエリキーワード
};

export type HeritageItem = BaseContentMeta & {
  type: "HERITAGE";
  kind: HeritageKind;

  subtitle?: string | null;
  lead?: string | null;

  eraLabel?: string | null;

  brandName?: string | null;
  maker?: string | null;
  modelName?: string | null;

  generationCode?: string | null;
  years?: string | null;

  heroImage?: string | null;
  heroTone?: string | null;
  heroLayout?: "wide" | "portrait" | "square" | string | null;

  heroTitle?: string | null;
  heroCaption?: string | null;
  heroImageCredit?: string | null;

  body: string;

  sections?: HeritageSection[] | null;

  highlights?: string[] | null;
  keyModels?: string[] | null;

  // 互換性のため残す
  relatedCarIds?: string[] | null;
  relatedHeritageSlugs?: string[] | null;
  relatedNewsIds?: string[] | null;

  timelineOrder?: number | null;
  readingTimeMinutes?: number | null;

  sourceName?: string | null;
  sourceUrl?: string | null;
  
  // 本文分割用（簡易）
  bodySections?: { title?: string; text: string; image?: string }[];
};

// ----------------------------------------
// ヘルパー
// ----------------------------------------
export type ArticleLike = GuideItem | ColumnItem | NewsItem;
export type AnyContentItem = GuideItem | ColumnItem | NewsItem | HeritageItem | CarItem;
