// lib/content-types.ts
// CAR BOUTIQUE 共通のコンテンツ型定義

// ----------------------------------------
// 基本ステータス
// ----------------------------------------

export type ContentStatus = "draft" | "published" | "archived";

// ----------------------------------------
// 共通メタ(BaseContentMeta)
// data/*.json で扱う全コンテンツの土台
// ----------------------------------------

/**
 * 共通メタ情報(SEO・一覧・シリーズ管理用)
 * GUIDE/COLUMN/NEWS/HERITAGE 全部ここをベースにする想定
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

  // --- タイトル/要約 ---

  /** 記事タイトル */
  title: string;

  /** 一覧用の短い要約 */
  summary?: string | null;

  /** SEOタイトル(指定がなければtitleを使う) */
  seoTitle?: string | null;

  /** SEOディスクリプション(指定がなければsummaryを使う) */
  seoDescription?: string | null;

  // --- 日付系 ---

  /** 作成日時(下書き保存などのタイミング) */
  createdAt?: string | null;

  /** 公開日時(ISO文字列) */
  publishedAt?: string | null;

  /** 最終更新日時(ISO文字列) */
  updatedAt?: string | null;

  // --- タグ/車種ひも付け ---

  /** タグ */
  tags?: string[];

  /** 関連する車種(slug) */
  relatedCarSlugs?: string[];

  // --- 表示制御(一覧・ピックアップ用) ---

  /** 特集・トップピックアップ用のフラグ */
  isFeatured?: boolean;

  /** 一覧の上部固定などに使うピン留めフラグ */
  isPinned?: boolean;

  /** 優先度(数値が小さいほど上位に出すなどのスコア用) */
  priority?: number | null;

  // --- シリーズ/連載 ---

  /** 連載やシリーズのID(同じシリーズで共通に持たせる) */
  seriesId?: string | null;

  /** シリーズ名(例:G30オーナーが語る修理記録) */
  seriesTitle?: string | null;

  /** シリーズ内での並び順(1,2,3...) */
  seriesOrder?: number | null;

  // --- SEO/OG関連 ---

  /** 正規URL(canonical) */
  canonicalUrl?: string | null;

  /** OG画像のURL */
  ogImageUrl?: string | null;

  /** 検索エンジンにインデックスさせない場合のフラグ */
  noindex?: boolean;
};

// ----------------------------------------
// Monetize（GUIDE用）
// ----------------------------------------

/**
 * GUIDEごとの「稼ぎどころ」を指定するキー
 * - JSONの1フィールドでテンプレ&CTAを切替するためのロジックキー
 */
export type MonetizeKey =
  // Aピラー（売却）
  | "sell_basic_checklist"
  | "sell_import_highclass"
  | "sell_timing"
  | "sell_loan_remain"
  | "sell_ikkatsu_phone"
  // Bピラー（保険・車検）
  | "insurance_compare_core"
  | "insurance_saving"
  | "insurance_after_accident"
  | "shaken_rakuten"
  | "insurance_corporate"
  | "lease_sompo_noru"
  // Cピラー（カー用品 Amazon）
  | "goods_drive_recorder"
  | "goods_child_seat"
  | "goods_car_wash_coating"
  | "goods_interior_clean"
  | "goods_jump_starter";

// ----------------------------------------
// GUIDE
// ----------------------------------------

/**
 * GUIDEカテゴリ
 * よく使いそうなものをプリセットで用意しつつ、自由入力も許可
 */
export type GuideCategory =
  | "MONEY" // 税金・保険・ローンなど
  | "BUY" // 買い方・選び方
  | "SELL" // 手放し方
  | "MAINTENANCE" // メンテナンス系
  | "TROUBLE" // トラブル対策
  | "LIFE" // 暮らし・ライフハック寄り
  | "BEGINNER" // 初心者向け
  | "ADVANCED" // 玄人向け
  | string;

export type GuideItem = BaseContentMeta & {
  type: "GUIDE";

  /** ガイドのカテゴリ(MONEY,MAINTENANCEなど/自由入力も可) */
  category?: GuideCategory | null;

  /** 読了目安時間(分) */
  readMinutes?: number | null;

  /** ヒーロー画像パス(任意) */
  heroImage?: string | null;

  /** Markdown本文 */
  body: string;

  /** 目次用に見出しを事前計算して持つ場合のTOC */
  toc?: {
    id: string;
    text: string;
    level: 2 | 3 | 4;
  }[] | null;

  // --- monetize layer ---

  /**
   * GUIDEごとの「稼ぎどころ」キー
   * - null/未設定: ブロック非表示
   */
  monetizeKey?: MonetizeKey | null;

  /**
   * 例外的に「このGUIDEだけURLを上書きしたい」時の逃げ道（将来/運用用）
   * - AffiliateLinksMap のキー（lib/affiliate.ts）と同じキーを想定
   */
  affiliateLinks?: Record<string, string> | null;

  /**
   * 関連GUIDEの内部リンク(slug)
   * - app/guide/[slug]/page.tsx で使用
   */
  internalLinks?: string[] | null;
};

// ----------------------------------------
// COLUMN
// ----------------------------------------

// COLUMNカテゴリはプリセット+自由拡張
export type ColumnCategory =
  | "OWNER_STORY" // オーナー体験記
  | "MAINTENANCE" // 整備・メンテナンス
  | "TECHNICAL" // 技術解説
  | "MONEY" // お金・費用の話
  | "LIFESTYLE" // 暮らし・趣味寄り
  | "TROUBLE" // トラブル事例
  | "HISTORY" // 歴史・背景
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

  /** 目次用に見出しを事前計算して持つ場合のTOC */
  toc?: {
    id: string;
    text: string;
    level: 2 | 3 | 4;
  }[] | null;
};

// ----------------------------------------
// NEWS
// news-latest.json 用の型
// ----------------------------------------

export type NewsItem = BaseContentMeta & {
  type: "NEWS";

  /** メーカー公式など一次情報のURL */
  url: string;

  /** サイト内での詳細ページへのリンク(/news/[slug]など) */
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

  /** 日本語表記済みの公開日(例:2025年3月12日) */
  publishedAtJa?: string | null;

  /** 元データの作成日時(公開日と同じでも可) */
  createdAt?: string | null;

  /** 編集注記など */
  editorNote?: string | null;

  /** サムネイル画像など */
  imageUrl?: string | null;

  /** 元記事の言語(en,jaなど) */
  sourceLang?: string | null;

  /** 元記事のタイトル(英語など) */
  originalTitle?: string | null;
};

// ----------------------------------------
// HERITAGE
// ブランド史・車種史など
// ----------------------------------------

export type HeritageKind = "ERA" | "BRAND" | "CAR";

export type HeritageItem = BaseContentMeta & {
  type: "HERITAGE";

  /** 時代全体/ブランド/車種のどれか */
  kind: HeritageKind;

  /** サブタイトル */
  subtitle?: string | null;

  /** リード文(導入) */
  lead?: string | null;

  /** 時代ラベル(例:1990s,2000〜2010年代など) */
  eraLabel?: string | null;

  /** ブランド名(BMW,Ferrariなど) */
  brandName?: string | null;

  /** モデル名(3 Series,911など) */
  modelName?: string | null;

  /** 型式・世代コード(G30,E46など) */
  generationCode?: string | null;

  /** 年式レンジ(例:2017〜2020) */
  years?: string | null;

  /** ヒーロー画像パス */
  heroImage?: string | null;

  /** ヒーローのトーン(white,black,vintageなど任意) */
  heroTone?: string | null;

  /** ヒーローのレイアウト種別(wide,portrait,squareなど任意) */
  heroLayout?: "wide" | "portrait" | "square" | string | null;

  /** 本文(Markdownやプレーンテキスト) */
  body: string;

  /** ハイライト箇条書き */
  highlights?: string[] | null;

  /** タグ(BaseContentMeta.tagsと合わせて使う想定) */
  tags?: string[] | null;

  /** 関連する車種IDなど(将来CARSと結びつける用) */
  relatedCarIds?: string[] | null;

  /** 関連するHERITAGE記事(slug) */
  relatedHeritageSlugs?: string[] | null;

  /** 年表表示などで使う並び順(小さいほど古い/上に出すなど) */
  timelineOrder?: number | null;
};

// ----------------------------------------
// ヘルパー的な共通Union
// ----------------------------------------

export type ArticleLike = GuideItem | ColumnItem | NewsItem;
export type AnyContentItem = GuideItem | ColumnItem | NewsItem | HeritageItem;
