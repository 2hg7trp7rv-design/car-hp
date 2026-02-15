"use client";

import { usePathname } from "next/navigation";

export type PageType =
  | "top"
  | "heritage"
  | "cars"
  | "column"
  | "guide"
  | "news"
  | "hub"
  | "search"
  | "compare"
  | "unknown";

export type PageContext = {
  page_type: PageType;
  content_id: string; // slug（トップは "top"、一覧は "index"）
  /** @deprecated 互換: 旧実装名（pageType/pageId を参照する古いコード吸収） */
  pageType?: PageType;
  /** @deprecated 互換: 旧実装名（pageType/pageId を参照する古いコード吸収） */
  pageId?: string;
};

const INDEX_ID = "index";

function safeId(value: unknown): string {
  if (typeof value !== "string") return "unknown";
  const s = value.trim();
  return s.length > 0 ? s : "unknown";
}

function isHubSlug(slug: string): boolean {
  // 現状の運用互換：/guide 配下の一部を hub 扱い
  // 例: /guide/hub-xxx, /guide/insurance など
  return (
    slug.startsWith("hub-") ||
    slug === "insurance" ||
    slug === "lease" ||
    slug === "maintenance"
  );
}

/**
 * i18n などで /en/cars/... のような prefix が付く場合に備える
 * - "xx" または "xx-YY" 形式を locale として扱う
 * - ただし次のセグメントが既知セクションの場合のみ剥がす（誤判定を避ける）
 */
function isLocaleSegment(seg: string): boolean {
  return /^[a-z]{2}(?:-[A-Z]{2})?$/.test(seg);
}

function isKnownSection(
  seg: string,
): seg is Exclude<PageType, "top" | "unknown"> {
  return (
    seg === "heritage" ||
    seg === "cars" ||
    seg === "column" ||
    seg === "guide" ||
    seg === "news" ||
    seg === "hub" ||
    seg === "search" ||
    seg === "compare"
  );
}

export function usePageContext(): PageContext {
  const pathname = usePathname();

  // "/" または未取得はトップ扱い
  if (!pathname || pathname === "/") {
    return { page_type: "top", content_id: "top", pageType: "top", pageId: "top" };
  }

  // "/foo/bar/" のような末尾 "/" を含んでもOK
  let parts = pathname.split("/").filter(Boolean);

  // locale prefix を剥がす（例: /en/cars/xxx → /cars/xxx）
  if (parts.length >= 2 && isLocaleSegment(parts[0]) && isKnownSection(parts[1])) {
    parts = parts.slice(1);
  }

  const section = safeId(parts[0]);
  const slug = safeId(parts[parts.length - 1]);

  // セクションのルート（例: /cars, /guide）を slug 扱いしない（データ汚染回避）
  const isSectionRoot = parts.length === 1;

  if (section === "heritage") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "heritage", content_id, pageType: "heritage", pageId: content_id };
  }

  if (section === "cars") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "cars", content_id, pageType: "cars", pageId: content_id };
  }

  if (section === "column") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "column", content_id, pageType: "column", pageId: content_id };
  }

  if (section === "news") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "news", content_id, pageType: "news", pageId: content_id };
  }

  // guide/hub 判定
  if (section === "guide") {
    if (isSectionRoot) {
      return { page_type: "guide", content_id: INDEX_ID, pageType: "guide", pageId: INDEX_ID };
    }
    if (isHubSlug(slug)) {
      return { page_type: "hub", content_id: slug, pageType: "hub", pageId: slug };
    }
    return { page_type: "guide", content_id: slug, pageType: "guide", pageId: slug };
  }

  // 将来 /hub/* を追加した時の保険
  if (section === "hub") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "hub", content_id, pageType: "hub", pageId: content_id };
  }

  if (section === "search") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "search", content_id, pageType: "search", pageId: content_id };
  }

  if (section === "compare") {
    const content_id = isSectionRoot ? INDEX_ID : slug;
    return { page_type: "compare", content_id, pageType: "compare", pageId: content_id };
  }

  // unknown セクションでも、ルートは index として扱う（誤送信防止）
  const content_id = isSectionRoot ? INDEX_ID : slug;
  return { page_type: "unknown", content_id, pageType: "unknown", pageId: content_id };
}
