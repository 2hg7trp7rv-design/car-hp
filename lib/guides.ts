// lib/guides.ts

import type {
  GuideItem as GuideItemBase,
  GuideCategory as GuideCategoryBase,
  ContentStatus,
} from "@/lib/content-types";
import {
  findAllGuides,
  findGuideBySlug as repoFindGuideBySlug,
} from "@/lib/repository/guides-repository";
import { isRedirectSourcePath } from "@/lib/seo/redirects";

// 既存インポート互換用エクスポート
export type GuideItem = GuideItemBase;
export type GuideCategory = GuideCategoryBase;

// ----------------------------------------
// 内部ユーティリティ
// ----------------------------------------

function isPublished(status: ContentStatus): boolean {
  return status === "published";
}

function toTime(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function compareByPublishedDesc(a: GuideItem, b: GuideItem): number {
  const aTime = toTime(a.publishedAt ?? a.updatedAt ?? null);
  const bTime = toTime(b.publishedAt ?? b.updatedAt ?? null);

  if (aTime === bTime) {
    // 日付が同じ場合はタイトルで安定ソート
    const at = a.title.toLowerCase();
    const bt = b.title.toLowerCase();
    if (at < bt) return -1;
    if (at > bt) return 1;
    return 0;
  }

  return aTime < bTime ? 1 : -1;
}

type GuideIndex = {
  allSorted: GuideItem[];
  allPublishedSorted: GuideItem[];
  bySlug: Map<string, GuideItem>;
  byCategory: Map<GuideCategory, GuideItem[]>;
};

let guideIndexCache: GuideIndex | null = null;

function buildGuideIndex(): GuideIndex {
  const rawAll = findAllGuides().filter((g) => !isRedirectSourcePath("/guide/" + g.slug));

  const allSorted = [...rawAll].sort(compareByPublishedDesc);

  const published = rawAll.filter((g) => isPublished(g.status));
  const publishedSorted = [...published].sort(compareByPublishedDesc);

  const bySlug = new Map<string, GuideItem>();
  const byCategory = new Map<GuideCategory, GuideItem[]>();

  for (const g of publishedSorted) {
    bySlug.set(g.slug, g);

    if (g.category) {
      const key = g.category as GuideCategory;
      const list = byCategory.get(key);
      if (list) list.push(g);
      else byCategory.set(key, [g]);
    }
  }

  return {
    allSorted,
    allPublishedSorted: publishedSorted,
    bySlug,
    byCategory,
  };
}

function ensureGuideIndex(): GuideIndex {
  if (!guideIndexCache) {
    guideIndexCache = buildGuideIndex();
  }
  return guideIndexCache;
}

// App Routerのホットリロードなどで再構築したい場合に備えたリセット関数(今は未使用)
export function __resetGuideCacheForTest(): void {
  guideIndexCache = null;
}

// ----------------------------------------
// v1.2: 関連ランキング（単一の“棚ロジック”入口）
// ----------------------------------------

type RankInputs = {
  explicitSlugs?: string[]; // 明示関連（最優先）
  intentTags?: string[]; // 第2優先
  tags?: string[]; // 第3優先
  limit: number;
  excludeSlug?: string;
};

function uniqBySlug(items: GuideItem[]): GuideItem[] {
  const seen = new Set<string>();
  const out: GuideItem[] = [];
  for (const it of items) {
    if (!it?.slug) continue;
    if (seen.has(it.slug)) continue;
    seen.add(it.slug);
    out.push(it);
  }
  return out;
}

function intersectionCount(a: string[] | undefined, b: string[] | undefined): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const set = new Set(a);
  let c = 0;
  for (const x of b) if (set.has(x)) c += 1;
  return c;
}

/**
 * v1.2の優先順位
 * 1) explicitSlugs（入力順尊重）
 * 2) intentTags一致（intersection > 0）
 * 3) tags一致（intersection > 0）
 * 4) フォールバック（新着）
 */
function rankRelatedGuidesFromPool(pool: GuideItem[], input: RankInputs): GuideItem[] {
  const limit = input.limit;
  const excludeSlug = input.excludeSlug;

  const picked: GuideItem[] = [];
  const seen = new Set<string>();

  const push = (g: GuideItem) => {
    if (!g?.slug) return;
    if (excludeSlug && g.slug === excludeSlug) return;
    if (seen.has(g.slug)) return;
    seen.add(g.slug);
    picked.push(g);
  };

  // 1) 明示関連（順序を尊重）
  const explicit = input.explicitSlugs ?? [];
  if (explicit.length > 0) {
    const map = new Map(pool.map((g) => [g.slug, g] as const));
    for (const slug of explicit) {
      const g = map.get(slug);
      if (!g) continue;
      push(g);
      if (picked.length >= limit) return picked.slice(0, limit);
    }
  }

  // 2) intentTags一致
  const intent = input.intentTags ?? [];
  if (intent.length > 0) {
    const scored = pool
      .filter((g) => !seen.has(g.slug))
      .map((g) => ({
        g,
        score: intersectionCount(intent, g.intentTags ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareByPublishedDesc(a.g, b.g);
      });

    for (const x of scored) {
      push(x.g);
      if (picked.length >= limit) return picked.slice(0, limit);
    }
  }

  // 3) tags一致
  const tags = input.tags ?? [];
  if (tags.length > 0) {
    const scored = pool
      .filter((g) => !seen.has(g.slug))
      .map((g) => ({
        g,
        score: intersectionCount(tags, g.tags ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareByPublishedDesc(a.g, b.g);
      });

    for (const x of scored) {
      push(x.g);
      if (picked.length >= limit) return picked.slice(0, limit);
    }
  }

  // 4) フォールバック（新着）
  for (const g of pool) {
    if (picked.length >= limit) break;
    if (excludeSlug && g.slug === excludeSlug) continue;
    if (seen.has(g.slug)) continue;
    push(g);
  }

  return picked.slice(0, limit);
}

// ----------------------------------------
// 公開API(Domain層)
// ----------------------------------------

// 全GUIDE一覧(公開済みのみ/公開日降順)
export async function getAllGuides(): Promise<GuideItem[]> {
  return ensureGuideIndex().allPublishedSorted;
}

// 全GUIDE（ステータス問わず）
// ※Hubの下書き確認や検証用途。通常UIでは使わない。
export async function getAllGuidesIncludingNonPublished(): Promise<GuideItem[]> {
  return ensureGuideIndex().allSorted;
}

// slug指定で1件取得(公開済みのみ)
export async function getGuideBySlug(slug: string): Promise<GuideItem | null> {
  const index = ensureGuideIndex();
  const guide = index.bySlug.get(slug) ?? repoFindGuideBySlug(slug);
  if (!guide) return null;
  if (!isPublished(guide.status)) return null;
  return guide;
}

// slug指定で1件取得（非公開も許可）
export async function getGuideBySlugIncludingNonPublished(
  slug: string,
): Promise<GuideItem | null> {
  const g = repoFindGuideBySlug(slug);
  return g ?? null;
}

// 最新n件
export async function getLatestGuides(limit: number): Promise<GuideItem[]> {
  const all = ensureGuideIndex().allPublishedSorted;
  return all.slice(0, limit);
}

// カテゴリ別
export async function getGuidesByCategory(
  category: GuideCategory,
  limit?: number,
): Promise<GuideItem[]> {
  const index = ensureGuideIndex();
  const list = index.byCategory.get(category) ?? [];
  if (typeof limit === "number") {
    return list.slice(0, limit);
  }
  return list;
}

/**
 * v1.2: 関連GUIDE
 * - 明示関連（base.relatedGuideSlugs）を最優先
 * - 次に intentTags
 * - 次に tags
 * - 最後に新着で埋める（0件禁止）
 */
export async function getRelatedGuidesV12(
  base: GuideItem,
  limit = 4,
): Promise<GuideItem[]> {
  const { allPublishedSorted } = ensureGuideIndex();
  const pool = allPublishedSorted.filter((g) => g.slug !== base.slug);

  const result = rankRelatedGuidesFromPool(pool, {
    explicitSlugs: base.relatedGuideSlugs ?? [],
    intentTags: base.intentTags ?? [],
    tags: base.tags ?? [],
    limit,
    excludeSlug: base.slug,
  });

  return uniqBySlug(result).slice(0, limit);
}

/**
 * 既存互換: 関連GUIDE(タグ＋カテゴリベースの簡易レコメンド)
 * - 旧実装を残すが、今後は getRelatedGuidesV12 を使用推奨
 */
export async function getRelatedGuides(
  base: GuideItem,
  limit = 4,
): Promise<GuideItem[]> {
  const { allPublishedSorted } = ensureGuideIndex();

  const baseTags = base.tags ?? [];
  const baseCategory = base.category ?? null;

  const scored = allPublishedSorted
    .filter((g) => g.id !== base.id)
    .map((g) => {
      let score = 0;

      const tags = g.tags ?? [];
      for (const tag of tags) {
        if (baseTags.includes(tag)) score += 2;
      }

      if (baseCategory && g.category === baseCategory) {
        score += 1;
      }

      return { item: g, score };
    });

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return compareByPublishedDesc(a.item, b.item);
  });

  return scored
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.item);
}

/**
 * v1.2: slug配列からGuideを引く（棚の部品）
 * - 入力順を尊重
 * - 見つからないslugは無視
 * - 重複排除
 */
export async function getGuidesBySlugs(
  slugs: string[],
  limit?: number,
): Promise<GuideItem[]> {
  const { allPublishedSorted } = ensureGuideIndex();
  const map = new Map(allPublishedSorted.map((g) => [g.slug, g] as const));

  const out: GuideItem[] = [];
  const seen = new Set<string>();

  for (const s of slugs) {
    const slug = s?.trim();
    if (!slug) continue;
    const g = map.get(slug);
    if (!g) continue;
    if (seen.has(g.slug)) continue;
    seen.add(g.slug);
    out.push(g);
    if (typeof limit === "number" && out.length >= limit) break;
  }

  return out;
}


// ----------------------------------------
// v1.2: HUBページ用のGuide集合
// ----------------------------------------
export type HubKind = "usedcar" | "loan" | "sell";

type HubGuideInputs = {
  kind: HubKind;
  limit?: number;
};

function scoreByKeywords(g: GuideItem, keywords: string[]): number {
  if (!keywords.length) return 0;
  const hay = `${g.title} ${g.summary ?? ""} ${(g.tags ?? []).join(" ")} ${(g.intentTags ?? []).join(" ")}`;
  let score = 0;
  for (const k of keywords) {
    if (!k) continue;
    if (hay.includes(k)) score += 1;
  }
  return score;
}

/**
 * HUB 用 Guide リスト
 * - kind ごとに、monetizeKey / category / tags / intentTags からスコアリング
 * - 公開済みのみ対象
 */
export async function getGuidesForHub(
  inputs: HubGuideInputs,
): Promise<GuideItem[]> {
  const { allPublishedSorted } = ensureGuideIndex();
  const limit = Math.max(1, Math.min(24, inputs.limit ?? 12));

  const kind = inputs.kind;

  // kind ごとの「狙いタグ」
  const keywordsByKind: Record<HubKind, string[]> = {
    usedcar: ["中古車", "購入", "見積もり", "諸費用", "税金", "相場", "査定", "予算"],
    loan: ["ローン", "金利", "審査", "残価", "支払い", "予算", "年収"],
    sell: ["売却", "査定", "買取", "下取り", "リセール", "手放す", "車検", "モデルチェンジ"],
  };

  const preferredCategoriesByKind: Record<HubKind, GuideCategory[]> = {
    usedcar: ["BUY", "MONEY", "MAINTENANCE_COST", "SELL"],
    loan: ["MONEY", "BUY"],
    sell: ["SELL", "MONEY"],
  };

  const preferredMonetizeKeyByKind: Record<HubKind, string[]> = {
    usedcar: ["car_search_conditions", "car_search_price"],
    loan: ["loan_estimate", "lease_sompo_noru"],
    sell: ["sell_basic_checklist", "sell_import_checklist", "sell_loan_remain_checklist"],
  };

  const keywords = keywordsByKind[kind];
  const preferCats = new Set(preferredCategoriesByKind[kind]);
  const preferKeys = new Set(preferredMonetizeKeyByKind[kind]);

  const scored = allPublishedSorted.map((g) => {
    let score = 0;

    if (g.category && preferCats.has(g.category as any)) score += 2;
    if (g.monetizeKey && preferKeys.has(g.monetizeKey)) score += 3;

    // intentTags
    if (Array.isArray((g as any).intentTags)) {
      const intents = (g as any).intentTags as string[];
      if (kind === "loan" && intents.includes("money")) score += 1;
      if (kind === "sell" && intents.includes("sell")) score += 1;
    }

    score += scoreByKeywords(g, keywords);

    return { g, score };
  });

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return compareByPublishedDesc(a.g, b.g);
  });

  return scored
    .filter((x) => x.score > 0)
    .slice(0, limit)
    .map((x) => x.g);
}
