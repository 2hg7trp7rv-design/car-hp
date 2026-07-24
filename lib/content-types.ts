// lib/content-types.ts

// ----------------------------------------
// 基本ステータス
// ----------------------------------------
export type ContentStatus = "draft" | "published" | "archived";

// ----------------------------------------
// 公開状態（SEO / インデックス運用）
// ----------------------------------------
export type PublicState = "index" | "noindex" | "draft" | "redirect";

// ----------------------------------------
// Content Type
// ----------------------------------------
export type ContentType = "GUIDE" | "COLUMN" | string;

export type ArticleSource =
  | string
  | {
      url: string;
      title: string;
      publisher?: string | null;
      claim?: string | null;
      accessedAt?: string | null;
    };

// ----------------------------------------
// 共通メタ(BaseContentMeta)
// ----------------------------------------
export type BaseContentMeta = {
  id: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;

  /**
   * 企画書v4: 公開判定（A/B/C/D）をデータで固定する状態。
   * - index: インデックス許可（品質ゲート合格が前提）
   * - noindex: 公開はするがインデックスしない（薄い/補助/ツール系）
   * - draft: 下書き（公開しない/または内部のみ）
   * - redirect: 統合済み（redirects.json で恒久リダイレクト）
   */
  publicState: PublicState;

  /** 親Pillar（HUB）: 例 "/guide/hub-sell" */
  parentPillarId: string;
  /** 関連Cluster（将来拡張） */
  relatedClusterIds: string[];
  /** 主要クエリ（検索意図ラベル） */
  primaryQuery: string;
  /** 更新理由（例: "initial-import" / "pricing-update"） */
  updateReason: string;
  /** 参照元（一次情報URLなど） */
  sources: ArticleSource[];

  title: string;

  /**
   * 日本語タイトル（任意）
   */
  titleJa?: string | null;

  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  /**
   * 汎用 description（JSON-LD / カード表示などの“説明文”用）。
   * - 基本は seoDescription の補助（将来的に分離できる差し込み口）
   * - データに無い場合は Repository で seoDescription 等から補完する
   */
  description?: string | null;

  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];

  /**
   * 一覧カード/絞り込み用の大分類タグ。
   * - 記事本文で使う細かい tags とは分離して運用する
   * - 例: 保険 / 売却 / 中古車 など
   */
  displayTag?: string | null;

  /**
   * 関連コンテンツ (回遊設計用 / 仕様書v1.2)
   */
  relatedGuideSlugs?: string[]; // 関連ガイド
  relatedColumnSlugs?: string[]; // 関連コラム

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
  /**
   * 一覧/OG用のサムネイル（任意）。
   * - heroImage と分けたいケース（一覧は軽い画像、詳細は大きい画像）
   * - 実写が無い場合のポスター生成などの差し込み口
   */
  thumbnail?: string | null;
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

export type GuideLayoutVariant = "editorial-v1" | "decision-v1" | string;
export type ColumnLayoutVariant = "editorial-v1" | "cbj-world-v1" | string;

export type GuideBreadcrumbItem = {
  label: string;
  href?: string | null;
};

export type GuideAuthorProfile = {
  kind?: "person" | "organization" | null;
  name: string;
  credential?: string | null;
};

export type ArticleDesignCharacter = "juna" | "rina";

export type ArticleMotionPreset =
  | "none"
  | "fade-up"
  | "fade-left"
  | "fade-right"
  | "scale-in";

export type ArticleBlockPresentation = {
  /** 同じ意味ブロックから選ぶ見た目。未知値は標準表示へフォールバックする。 */
  variant?: "default" | "soft" | "outline" | "emphasis" | "compact" | string | null;
  /** 本文幅からの広げ方。 */
  width?: "normal" | "wide" | "bleed" | null;
  /** ブロック単位の任意モーション。 */
  motion?: ArticleMotionPreset | null;
};

export type ArticleDesignDialogue = {
  character: ArticleDesignCharacter;
  text: string;
  /** 通常の吹き出し、章導入、一言補足を同じキャラクター世界観から選べる。 */
  variant?: "bubble" | "lead" | "aside" | "compact" | null;
  /** 記事別・表情差分画像を指定する場合の上書き。 */
  image?: string | null;
  label?: string | null;
  motion?: ArticleMotionPreset | null;
};

export type ArticleAnswerFirst = {
  /** 記事全体の結論を120字以内で自己完結する要約にする。 */
  summary: string;
  /** 結論を支える3点の箇条書き（各40字以内）。 */
  points: string[];
};

export type ArticleDesignSpec = {
  version: "cbj-world-v1" | "cbj-world-v2" | string;
  layoutPreset?: "column-renewal-v1" | string | null;
  lessonNumber?: number | null;
  difficulty?: string | null;
  /**
   * v1専用。v2ではJSON側の値を無視し、themeから自動決定する
   * （guide: #0E7C7B→#0A5F5E / column: #E5604C→#C74B39）。
   */
  heroGradient?: [string, string] | null;
  /** v2のテーマ。ヒーローグラデーションとアクセント色を自動決定する。 */
  theme?: "guide" | "column" | string | null;
  /** v2必須。ヒーロー直下に出すAnswer Firstブロック。 */
  answerFirst?: ArticleAnswerFirst | null;
  heroTitle?: string | null;
  heroLead?: string | null;
  /** ヒーロー内で「この記事で判断できること」を1文で示す。 */
  heroPromise?: string | null;
  heroCenterImage?: string | null;
  sectionPalette?: string[] | null;
  introDialogue?: ArticleDesignDialogue[] | null;
  sectionDialogues?: Record<string, ArticleDesignDialogue[]> | null;
  closingDialogue?: ArticleDesignDialogue[] | null;
  /** モック本文の締めブロック。既存のFAQ・著者・出典より前に表示する。 */
  closingBlocks?: GuideDetailBlock[] | null;
};

export type GuideFaqItem = {
  question: string;
  answer: string;
};

export type GuideActionLink = {
  label: string;
  href: string;
  external?: boolean | null;
};

export type GuideActionBox = {
  title: string;
  body?: string | null;
  actions: GuideActionLink[];
};

export type GuideFlowStep = {
  title: string;
  body?: string | null;
  label?: string | null;
};

export type GuideTimelineItem = {
  label: string;
  title?: string | null;
  body?: string | null;
  items?: string[] | null;
};

export type GuideDecisionCard = {
  title: string;
  body?: string | null;
  items?: string[] | null;
  badge?: string | null;
};

export type GuideCaseStudyRow = {
  label: string;
  value: string;
  note?: string | null;
};

export type GuideCaseStudyItem = {
  title: string;
  intro?: string | null;
  rows: GuideCaseStudyRow[];
};

export type GuideEditorialBoardItem = {
  title: string;
  body?: string | null;
  items?: string[] | null;
  badge?: string | null;
  number?: string | null;
};

export type GuideEditorialBoard = {
  title?: string | null;
  eyebrow?: string | null;
  lead?: string | null;
  note?: string | null;
  items: GuideEditorialBoardItem[];
};

type GuideDetailBlockCore =
  | {
      type: "dialogue";
      character: ArticleDesignCharacter;
      text: string;
      variant?: "bubble" | "lead" | "aside" | "compact" | null;
      image?: string | null;
      label?: string | null;
      motion?: ArticleMotionPreset | null;
    }
  | {
      type: "paragraph";
      text: string;
      flow?: "sentence" | "natural" | null;
      highlights?: string[] | null;
    }
  | {
      type: "image";
      src: string;
      /** Optional portrait/mobile composition selected by the picture element. */
      srcMobile?: string | null;
      alt: string;
      label?: string | null;
      fit?: "cover" | "contain" | "bleed" | "articleWide" | null;
      aspectRatio?: string | null;
      /** Intrinsic dimensions prevent layout shift before the image is decoded. */
      width?: number | null;
      height?: number | null;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "subheading";
      title: string;
      level?: 3 | 4 | null;
    }
  | {
      type: "quote";
      text: string;
      caption?: string | null;
    }
  | {
      type: "divider";
    }
  | {
      type: "comparisonTable";
      title?: string | null;
      headers: string[];
      rows: string[][];
      note?: string | null;
      display?: "cards" | "table" | "contrast" | "checklist" | null;
    }
  | {
      type: "callout";
      tone?: "info" | "note" | "warn" | "accent" | null;
      title?: string | null;
      body?: string | null;
      items?: string[] | null;
    }
  | {
      type: "flow";
      title?: string | null;
      steps: GuideFlowStep[];
    }
  | {
      type: "timeline";
      title?: string | null;
      items: GuideTimelineItem[];
    }
  | {
      type: "decisionCards";
      title?: string | null;
      cards: GuideDecisionCard[];
    }
  | {
      type: "editorialBoard";
      title?: string | null;
      eyebrow?: string | null;
      lead?: string | null;
      note?: string | null;
      variant?: "smoke" | "white" | "dark" | null;
      accent?: "orange" | "red" | "green" | "blue" | "gold" | string | null;
      items: GuideEditorialBoardItem[];
    }
  | {
      type: "caseStudy";
      title?: string | null;
      cases: GuideCaseStudyItem[];
    };

export type GuideDetailBlock = GuideDetailBlockCore & {
  /** デザインシステム内の表示候補を記事側で明示選択する。未指定なら標準。 */
  presentation?: ArticleBlockPresentation | null;
};

export type GuideDetailSection = {
  id?: string | null;
  title: string;
  displayTitle?: string | null;
  chapterLabel?: string | null;
  deck?: string | null;
  kind?: string | null;
  blocks: GuideDetailBlock[];
};

export type GuideItem = BaseContentMeta & {
  type: "GUIDE";
  category?: GuideCategory | null;
  readMinutes?: number | null;
  heroImage?: string | null;
  /**
   * 一覧カード/OGPなど“軽い表示”用のサムネイル。
   * heroImageより先に参照したい場合がある。
   * - 画像が用意できない場合は未設定のままでOK（フォールバックでKV等に落とす）
   */
  thumbnail?: string | null;
  subtitle?: string | null;

  lead?: string | null;
  layoutVariant?: GuideLayoutVariant | null;
  eyebrowLabel?: string | null;
  breadcrumbTrail?: GuideBreadcrumbItem[] | null;
  authorProfile?: GuideAuthorProfile | null;
  keyPoints?: string[] | null;
  checkpoints?: string[] | null;
  faq?: GuideFaqItem[] | null;
  actionBox?: GuideActionBox | null;
  detailSections?: GuideDetailSection[] | null;
  articleDesign?: ArticleDesignSpec | null;

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
  subtitle?: string | null;
  lead?: string | null;
  eyebrowLabel?: string | null;
  breadcrumbTrail?: GuideBreadcrumbItem[] | null;
  authorProfile?: GuideAuthorProfile | null;
  keyPoints?: string[] | null;
  checkpoints?: string[] | null;
  faq?: GuideFaqItem[] | null;
  actionBox?: GuideActionBox | null;
  detailSections?: GuideDetailSection[] | null;
  articleDesign?: ArticleDesignSpec | null;

  body: string;

  toc?:
    | {
        id: string;
        text: string;
        level: 2 | 3 | 4;
      }[]
    | null;

  layoutVariant?: ColumnLayoutVariant | null;

  // 運用（編集計画）
  planPriority?: number | null;

  // 編集・SEO用メタデータ
  ctaType?: string | null;
  ctaNote?: string | null;
  searchIntent?: string | null;
  targetKeyword?: string | null;
  targetStep?: string | number | null;
  articleType?: string | null;
};


// ----------------------------------------
// ヘルパー
// ----------------------------------------
export type ArticleLike = GuideItem | ColumnItem;
export type AnyContentItem = GuideItem | ColumnItem;
