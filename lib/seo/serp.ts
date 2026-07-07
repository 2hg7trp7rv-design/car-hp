// lib/seo/serp.ts

/**
 * SERP（検索結果）向けの title / description を安定して生成するユーティリティ。
 *
 * 目的:
 * - title の重複（例: "... | CAR BOUTIQUE JOURNAL | CAR BOUTIQUE JOURNAL"）を防ぐ
 * - description が空/弱いページを減らす
 * - “データ側に seoTitle/seoDescription が無い” 期間も、一定品質のメタを維持する
 */

import type { ColumnItem, GuideItem } from "@/lib/content-types";

const BRAND = "CAR BOUTIQUE JOURNAL";

function normalizeSpaces(input: string): string {
  return (input ?? "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Markdown/記号を “それっぽく” プレーンテキストへ寄せる。
 * 完璧な Markdown パーサは不要（メタ description 用の軽量整形が目的）。
 */
export function toPlainText(input: string): string {
  let s = String(input ?? "");

  // code block
  s = s.replace(/```[\s\S]*?```/g, " ");
  // inline code
  s = s.replace(/`[^`]*`/g, " ");
  // images ![alt](url)
  s = s.replace(/!\[[^\]]*\]\([^)]+\)/g, " ");
  // links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // headings / blockquotes
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  s = s.replace(/^\s{0,3}>\s?/gm, "");
  // list markers
  s = s.replace(/^\s{0,3}[-*+]\s+/gm, "");
  s = s.replace(/^\s{0,3}\d+\.\s+/gm, "");
  // emphasis markers
  s = s.replace(/[*_]{1,3}/g, "");
  // html tags
  s = s.replace(/<[^>]+>/g, " ");

  return normalizeSpaces(s);
}

/**
 * タイトル末尾/先頭に入っているブランド表記を安全側で除去する。
 */
export function stripBrand(rawTitle: string): string {
  const t = normalizeSpaces(rawTitle);
  if (!t) return "";

  // 末尾: "... | CAR BOUTIQUE JOURNAL" / "...｜CAR BOUTIQUE JOURNAL"
  const tail = new RegExp(`(?:\\s*[|｜]\\s*${BRAND})+$`, "i");
  let out = t.replace(tail, "");

  // 先頭: "CAR BOUTIQUE JOURNAL | ..." / "CAR BOUTIQUE JOURNAL｜..."
  const head = new RegExp(`^${BRAND}(?:\\s*[|｜]\\s*)+`, "i");
  out = out.replace(head, "");

  return normalizeSpaces(out);
}

/**
 * OGP/Twitter 用など “絶対タイトル” としてブランドを 1回だけ付与。
 * （layout の title.template と二重にならないよう、ページ title では使わない）
 */
export function withBrand(titleBase: string): string {
  const base = stripBrand(titleBase);
  if (!base) return BRAND;
  return `${base} | ${BRAND}`;
}

export function clampText(raw: string, maxChars: number): string {
  const t = normalizeSpaces(raw);
  if (!t) return "";
  if (t.length <= maxChars) return t;
  const sliced = t.slice(0, Math.max(0, maxChars - 1)).replace(/[、。,. ]+$/g, "");
  return `${sliced}…`;
}

export function buildDescriptionFromCandidates(
  candidates: Array<string | null | undefined>,
  opts?: { maxChars?: number },
): string {
  const maxChars = Math.max(80, opts?.maxChars ?? 155);

  for (const c of candidates) {
    if (!c) continue;
    const plain = toPlainText(String(c));
    if (plain.length < 40) continue;
    return clampText(plain, maxChars);
  }

  return "";
}

// ----------------------------------------
// Content-type specific builders
// ----------------------------------------

export function buildColumnTitleBase(item: Pick<ColumnItem, "seoTitle" | "title" | "category" | "targetKeyword">): string {
  const explicit = stripBrand((item.seoTitle ?? "").trim());
  if (explicit) return explicit;

  const base = stripBrand((item.targetKeyword ?? item.title ?? "").trim()) || "コラム";

  const troubleCategories = new Set(["MAINTENANCE", "TROUBLE", "TECHNICAL"]);
  if (!troubleCategories.has(String(item.category ?? ""))) return base;

  if (/(原因|対処|対策|費用|修理費|見積|症状|直し方)/.test(base)) return base;

  const suffix = base.length <= 26 ? "原因・対処・費用" : "原因と対策";
  return `${base}｜${suffix}`;
}

export function buildColumnDescription(item: Pick<ColumnItem, "seoDescription" | "summary" | "body" | "targetKeyword" | "title">): string {
  const keyword = stripBrand((item.targetKeyword ?? item.title ?? "").trim());
  const fallback = keyword
    ? `この記事では「${keyword}」の原因・対処・費用目安・放置リスクを見ます。`
    : "原因・対処・費用目安・放置リスクを見ます。";

  return (
    buildDescriptionFromCandidates([
      item.seoDescription ?? null,
      item.summary ?? null,
      item.body ?? null,
      fallback,
    ]) || fallback
  );
}

export function buildGuideTitleBase(guide: Pick<GuideItem, "seoTitle" | "title" | "category">): string {
  const explicit = stripBrand((guide.seoTitle ?? "").trim());
  if (explicit) return explicit;

  const base = stripBrand((guide.title ?? "").trim()) || "ガイド";
  return base;
}

export function buildGuideDescription(guide: Pick<GuideItem, "seoDescription" | "summary" | "lead" | "body" | "title">): string {
  const baseFallback =
    guide.title && guide.title.trim().length > 0
      ? `${stripBrand(guide.title)}の結論・手順・注意点を、迷わない順番で見ます。`
      : "結論・手順・注意点を、迷わない順番で見ます。";

  return (
    buildDescriptionFromCandidates([
      guide.seoDescription ?? null,
      guide.summary ?? null,
      guide.lead ?? null,
      guide.body ?? null,
      baseFallback,
    ]) || baseFallback
  );
}
