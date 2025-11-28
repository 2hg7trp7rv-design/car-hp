// lib/heritage.ts
import heritageData from "@/data/heritage.json";

export type HeritageKind = "ERA" | "BRAND" | "CAR";

export type HeritageItem = {
  id: string;
  slug: string;
  kind: HeritageKind;

  title: string;
  subtitle?: string;
  lead?: string;

  /** 時代ラベル（例: "1970s", "Bubble era"） */
  eraLabel?: string | null;
  /** ブランド名（例: "BMW"） */
  brandName?: string | null;
  /** モデル名（例: "3 Series"） */
  modelName?: string | null;
  /** 世代コード（例: "E36", "W124"） */
  generationCode?: string | null;
  /** 年式レンジ（例: "1990–1998"） */
  years?: string | null;

  heroImage?: string | null;
  heroTone?: "tiffany" | "obsidian" | "vapor";

  highlights?: string[];
  tags?: string[];

  /** 系譜チェーンを識別するキー（例: "BMW-3", "Mercedes-E" など） */
  chainKey?: string | null;
  /** 同じ chainKey 内での並び順（世代順など） */
  chainOrder?: number | null;

  /** CARS の slug と紐付けると詳細ページへリンク可能 */
  carSlug?: string | null;

  /** その他メタ情報（任意 key/value） */
  meta?: Record<string, string | number | null | undefined>;

  /** Markdown ライク本文（##, ###, - 箇条書き対応） */
  body: string;
};

function normalizeItem(raw: any): HeritageItem {
  return {
    id: String(raw.id),
    slug: String(raw.slug),
    kind: raw.kind as HeritageKind,

    title: String(raw.title),
    subtitle: raw.subtitle ?? undefined,
    lead: raw.lead ?? undefined,

    eraLabel: raw.eraLabel ?? null,
    brandName: raw.brandName ?? null,
    modelName: raw.modelName ?? null,
    generationCode: raw.generationCode ?? null,
    years: raw.years ?? null,

    heroImage: raw.heroImage ?? null,
    heroTone: raw.heroTone ?? "vapor",

    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],

    chainKey: raw.chainKey ?? null,
    chainOrder:
      typeof raw.chainOrder === "number"
        ? raw.chainOrder
        : raw.chainOrder != null
        ? Number(raw.chainOrder)
        : null,

    carSlug: raw.carSlug ?? null,

    meta: (raw.meta as Record<string, any>) ?? {},

    body: String(raw.body ?? ""),
  };
}

const ALL_HERITAGE_ITEMS: HeritageItem[] = (heritageData as any[]).map(
  normalizeItem,
);

/**
 * 全 HERITAGE 記事を取得。
 * JSON はビルド時にロードされるので同期でもよいが、
 * 他の lib とインターフェイスを揃えて async で返却。
 */
export async function getAllHeritage(): Promise<HeritageItem[]> {
  return ALL_HERITAGE_ITEMS;
}

export async function getHeritageBySlug(
  slug: string,
): Promise<HeritageItem | null> {
  const all = await getAllHeritage();
  return all.find((n) => n.slug === slug) ?? null;
}

export async function getHeritageById(
  id: string,
): Promise<HeritageItem | null> {
  const all = await getAllHeritage();
  return all.find((n) => n.id === id) ?? null;
}

export async function getHeritageByKind(
  kind: HeritageKind,
): Promise<HeritageItem[]> {
  const all = await getAllHeritage();
  return all
    .filter((n) => n.kind === kind)
    .sort((a, b) => {
      const aOrder = a.chainOrder ?? 0;
      const bOrder = b.chainOrder ?? 0;
      if (a.chainKey === b.chainKey) {
        return aOrder - bOrder;
      }
      const aKey = a.chainKey ?? "";
      const bKey = b.chainKey ?? "";
      if (aKey === bKey) return a.title.localeCompare(b.title);
      return aKey.localeCompare(bKey);
    });
}

/**
 * 同じ chainKey を持つノード群を、chainOrder 昇順で返す。
 * chainKey 未設定の場合は空配列。
 */
export async function getHeritageChainForItem(
  item: HeritageItem,
): Promise<HeritageItem[]> {
  if (!item.chainKey) return [];
  const all = await getAllHeritage();

  return all
    .filter((n) => n.chainKey === item.chainKey)
    .sort((a, b) => (a.chainOrder ?? 0) - (b.chainOrder ?? 0));
}

/**
 * 前後の記事（同じ chainKey 内）を取得。
 * 見つからない場合は null。
 */
export async function getHeritageNeighbors(
  item: HeritageItem,
): Promise<{
  previous: HeritageItem | null;
  next: HeritageItem | null;
}> {
  const chain = await getHeritageChainForItem(item);
  if (!item.chainKey || chain.length === 0) {
    return { previous: null, next: null };
  }

  const index = chain.findIndex((n) => n.id === item.id);
  if (index === -1) return { previous: null, next: null };

  const previous = index > 0 ? chain[index - 1] : null;
  const next = index < chain.length - 1 ? chain[index + 1] : null;

  return { previous, next };
}

/**
 * chainKey ごとにグルーピングした系譜一覧。
 * HERITAGE トップで「ブランド別の系譜ビュー」に使用。
 */
export async function getHeritageChains(): Promise<
  { chainKey: string; nodes: HeritageItem[] }[]
> {
  const all = await getAllHeritage();
  const map = new Map<string, HeritageItem[]>();

  for (const item of all) {
    if (!item.chainKey) continue;
    const key = item.chainKey;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  }

  const chains: { chainKey: string; nodes: HeritageItem[] }[] = [];

  for (const [key, nodes] of map.entries()) {
    nodes.sort((a, b) => (a.chainOrder ?? 0) - (b.chainOrder ?? 0));
    chains.push({ chainKey: key, nodes });
  }

  chains.sort((a, b) => a.chainKey.localeCompare(b.chainKey));
  return chains;
}
