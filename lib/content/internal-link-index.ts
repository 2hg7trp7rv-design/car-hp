// lib/content/internal-link-index.ts
//
// Internal link title index (used to render "URL as cards" in article bodies)
//
// This index intentionally covers:
// - Dynamic pages: /column/:slug, /guide/:slug, /cars/:slug, /heritage/:slug
// - Static guide hubs/pages: /guide/hub-*, /guide/insurance, etc.
// - List pages: /guide, /column, /cars, /heritage

import { getAllColumns } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";
import { getAllCars, getIndexCars } from "@/lib/cars";
import { getAllHeritage } from "@/lib/heritage";
import { buildBodyTypeInfos } from "@/lib/taxonomy/body-type-hubs";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export type InternalLinkKind = "GUIDE" | "COLUMN" | "CARS" | "HERITAGE" | "PAGE";

export type InternalLinkMeta = {
  title: string;
  kind: InternalLinkKind;
};

const STATIC_INTERNAL_LINKS: Record<string, InternalLinkMeta> = {
  "/guide/hub-consumables": { title: "タイヤ・バッテリー・消耗品HUB", kind: "GUIDE" },
  "/guide/hub-import-trouble": { title: "輸入車のトラブル対応ガイド", kind: "GUIDE" },
  "/guide/hub-loan": { title: "ローン・支払い方法ガイド", kind: "GUIDE" },
  "/guide/hub-paperwork": { title: "名義変更・必要書類HUB", kind: "GUIDE" },
  "/guide/hub-sell-compare": { title: "比較の前提を整理する", kind: "GUIDE" },
  "/guide/hub-sell-loan": { title: "残債ありの手放しガイド", kind: "GUIDE" },
  "/guide/hub-sell-prepare": { title: "査定準備HUB", kind: "GUIDE" },
  "/guide/hub-sell-price": { title: "売却相場HUB", kind: "GUIDE" },
  "/guide/hub-sell": { title: "売却HUB", kind: "GUIDE" },
  "/guide/hub-shaken": { title: "車検HUB", kind: "GUIDE" },
  "/guide/hub-usedcar": { title: "中古車検索HUB", kind: "GUIDE" },
  "/guide/insurance": { title: "自動車保険の見直し", kind: "GUIDE" },
  "/guide/lease": { title: "定額カーリースの選び方（条件の読み方）", kind: "GUIDE" },
  "/guide/maintenance": { title: "メンテ用品の選び方", kind: "GUIDE" },
  "/guide": { title: "実用の一覧", kind: "GUIDE" },
  "/column": { title: "視点の一覧", kind: "COLUMN" },
  "/cars": { title: "車種一覧", kind: "CARS" },
  "/cars/makers": { title: "メーカー別 車種一覧", kind: "CARS" },
  "/cars/body-types": { title: "ボディタイプ別 車種一覧", kind: "CARS" },
  "/cars/segments": { title: "セグメント別 車種一覧", kind: "CARS" },
  "/heritage": { title: "系譜の一覧", kind: "HERITAGE" },
};

let cache: Record<string, InternalLinkMeta> | null = null;

function firstNonEmpty(...candidates: Array<string | null | undefined>): string {
  for (const c of candidates) {
    const v = (c ?? "").toString().trim();
    if (v) return v;
  }
  return "";
}

export async function getInternalLinkIndex(): Promise<Record<string, InternalLinkMeta>> {
  if (cache) return cache;

  const [columns, guides, cars, indexCars, heritage] = await Promise.all([
    getAllColumns(),
    getAllGuides(),
    getAllCars(),
    getIndexCars(),
    getAllHeritage(),
  ]);

  const idx: Record<string, InternalLinkMeta> = {
    ...STATIC_INTERNAL_LINKS,
  };

  for (const c of columns) {
    const title = firstNonEmpty((c as any).titleJa, c.title);
    idx[`/column/${c.slug}`] = { title, kind: "COLUMN" };
  }

  for (const g of guides) {
    const title = firstNonEmpty((g as any).titleJa, g.title);
    idx[`/guide/${g.slug}`] = { title, kind: "GUIDE" };
  }

  for (const car of cars) {
    const title = firstNonEmpty((car as any).titleJa, car.name, (car as any).title, car.slug);
    idx[`/cars/${car.slug}`] = { title, kind: "CARS" };
  }

  // Maker hub pages: /cars/makers/:makerKey
  const makerMap = new Map<string, string>();
  for (const car of indexCars) {
    const key = (car as any).makerKey?.toString().trim();
    const maker = (car as any).maker?.toString().trim();
    if (key && maker && !makerMap.has(key)) makerMap.set(key, maker);
  }

  for (const [key, maker] of makerMap.entries()) {
    idx[`/cars/makers/${key}`] = { title: `${maker}の車種一覧`, kind: "CARS" };
  }

  // Body type hub pages: /cars/body-types/:bodyTypeKey
  const bodyTypeInfos = buildBodyTypeInfos(indexCars);
  for (const b of bodyTypeInfos) {
    idx[`/cars/body-types/${b.key}`] = { title: `${b.label}の車種一覧`, kind: "CARS" };
  }

  // Segment hub pages: /cars/segments/:segmentKey
  const segmentInfos = buildSegmentInfos(indexCars);
  for (const s of segmentInfos) {
    idx[`/cars/segments/${s.key}`] = { title: `${s.label}の車種一覧`, kind: "CARS" };
  }


  for (const h of heritage) {
    const title = firstNonEmpty((h as any).titleJa, h.title, h.slug);
    idx[`/heritage/${h.slug}`] = { title, kind: "HERITAGE" };
  }

  cache = idx;
  return idx;
}

export function inferKindFromHref(href: string): InternalLinkKind {
  const h = (href ?? "").toString();
  if (h.startsWith("/guide")) return "GUIDE";
  if (h.startsWith("/column")) return "COLUMN";
  if (h.startsWith("/cars")) return "CARS";
  if (h.startsWith("/heritage")) return "HERITAGE";
  return "PAGE";
}
