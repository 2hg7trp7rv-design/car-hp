// lib/linking/related.ts
/**
 * related* を “手入力 + 自動抽出(章単位)” の両方で扱うためのユーティリティ。
 * - まずは「重複排除」「null安全」「最大件数制限」だけやる薄い層にしておく
 * - 既存の Domain 層/型と衝突させないため、any で受けて安全に処理する
 */

export function uniqStrings(list: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const v of list) {
    if (!v) continue;
    const s = String(v).trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function clampList<T>(list: T[], limit: number): T[] {
  if (!Array.isArray(list)) return [];
  if (limit <= 0) return [];
  return list.slice(0, limit);
}

/**
 * Heritage.sections[].carSlugs / guideSlugs から “章で登場した関連” を抽出する
 */
export function extractRelatedFromHeritageSections(heritage: any): {
  carSlugs: string[];
  guideSlugs: string[];
} {
  const sections = Array.isArray(heritage?.sections) ? heritage.sections : [];

  const carSlugs: Array<string | null | undefined> = [];
  const guideSlugs: Array<string | null | undefined> = [];

  for (const sec of sections) {
    const cs = Array.isArray(sec?.carSlugs) ? sec.carSlugs : [];
    const gs = Array.isArray(sec?.guideSlugs) ? sec.guideSlugs : [];
    for (const s of cs) carSlugs.push(s);
    for (const s of gs) guideSlugs.push(s);
  }

  return {
    carSlugs: uniqStrings(carSlugs),
    guideSlugs: uniqStrings(guideSlugs),
  };
}

/**
 * 手入力 relatedCarSlugs / relatedGuideSlugs と、章抽出をマージする
 * - 章で出たものを優先して前に出す（自然な導線のため）
 */
export function mergeHeritageRelated(heritage: any, opts?: { limit?: number }) {
  const limit = typeof opts?.limit === "number" ? opts!.limit! : 12;

  const manualCars = Array.isArray(heritage?.relatedCarSlugs)
    ? heritage.relatedCarSlugs
    : [];
  const manualGuides = Array.isArray(heritage?.relatedGuideSlugs)
    ? heritage.relatedGuideSlugs
    : [];

  const extracted = extractRelatedFromHeritageSections(heritage);

  const mergedCars = uniqStrings([...extracted.carSlugs, ...manualCars]);
  const mergedGuides = uniqStrings([...extracted.guideSlugs, ...manualGuides]);

  return {
    relatedCarSlugs: clampList(mergedCars, limit),
    relatedGuideSlugs: clampList(mergedGuides, limit),
  };
}
