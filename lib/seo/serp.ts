// lib/seo/serp.ts

/**
 * SERP（検索結果）向けの title / description を安定して生成するユーティリティ。
 *
 * 目的:
 * - title の重複（例: "... | CAR BOUTIQUE | CAR BOUTIQUE"）を防ぐ
 * - description が空/弱いページを減らす
 * - “データ側に seoTitle/seoDescription が無い” 期間も、一定品質のメタを維持する
 */

import type {
  CarItem,
  ColumnItem,
  GuideItem,
  HeritageItem,
  NewsItem,
} from "@/lib/content-types";

const BRAND = "CAR BOUTIQUE";

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
  s = s.replace(/!\[[^\]]*\]\([^\)]*\)/g, " ");
  // links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^\)]*\)/g, "$1");
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

  // 末尾: "... | CAR BOUTIQUE" / "...｜CAR BOUTIQUE"
  const tail = new RegExp(`(?:\\s*[|｜]\\s*${BRAND})+$`, "i");
  let out = t.replace(tail, "");

  // 先頭: "CAR BOUTIQUE | ..." / "CAR BOUTIQUE｜..."
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

export function buildCarTitleBase(car: Pick<CarItem, "seoTitle" | "title" | "maker" | "name" | "grade">): string {
  const explicit = stripBrand((car.seoTitle ?? "").trim());
  if (explicit) return explicit;

  const maker = (car.maker ?? "").trim();
  const name = (car.name ?? "").trim();
  const grade = (car.grade ?? "").trim();
  const display = normalizeSpaces(`${maker} ${name} ${grade}`.trim());
  const base = display || stripBrand((car.title ?? "").trim()) || "車種";

  // “買ってからの現実” を前面に（維持費/相場/弱点）
  return `${base}｜維持費・中古相場・弱点`;
}

export function buildCarDescription(car: Pick<CarItem, "seoDescription" | "summaryLong" | "summary" | "maker" | "name" | "grade">): string {
  const display = normalizeSpaces(
    `${(car.maker ?? "").trim()} ${(car.name ?? "").trim()} ${(car.grade ?? "").trim()}`.trim(),
  );

  const fallback =
    display
      ? `${display}の特徴・維持費・中古相場・故障/弱点の要点を、購入前の判断材料として整理します。`
      : "車種の特徴・維持費・中古相場・弱点の要点を、購入前の判断材料として整理します。";

  return (
    buildDescriptionFromCandidates([
      car.seoDescription ?? null,
      car.summaryLong ?? null,
      car.summary ?? null,
      fallback,
    ]) || fallback
  );
}

export function buildColumnTitleBase(item: Pick<ColumnItem, "seoTitle" | "title" | "category" | "targetKeyword">): string {
  const explicit = stripBrand((item.seoTitle ?? "").trim());
  if (explicit) return explicit;

  const base = stripBrand((item.targetKeyword ?? item.title ?? "").trim()) || "コラム";

  const troubleCategories = new Set(["MAINTENANCE", "TROUBLE", "TECHNICAL"]);
  if (!troubleCategories.has(String(item.category ?? ""))) return base;

  // すでに “原因/対策/費用” が入っているなら足さない
  if (/(原因|対処|対策|費用|修理費|見積|症状|直し方)/.test(base)) return base;

  const suffix = base.length <= 26 ? "原因・対処・費用" : "原因と対策";
  return `${base}｜${suffix}`;
}

export function buildColumnDescription(item: Pick<ColumnItem, "seoDescription" | "summary" | "body" | "targetKeyword" | "title">): string {
  const keyword = stripBrand((item.targetKeyword ?? item.title ?? "").trim());
  const fallback = keyword
    ? `この記事では「${keyword}」の原因・対処・費用目安・放置リスクを整理します。`
    : "原因・対処・費用目安・放置リスクを整理します。";

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

  // GUIDE は “結論” を出したいが、記事タイトル自体が長いことも多い。
  // ここでは過剰に付け足さず、データ側(=seoTitle)で最適化できる余地を残す。
  return base;
}

export function buildGuideDescription(guide: Pick<GuideItem, "seoDescription" | "summary" | "lead" | "body" | "title">): string {
  const baseFallback =
    guide.title && guide.title.trim().length > 0
      ? `${stripBrand(guide.title)}の結論・手順・注意点を、迷わない順番で整理します。`
      : "結論・手順・注意点を、迷わない順番で整理します。";

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

export function buildHeritageTitleBase(item: Pick<HeritageItem, "seoTitle" | "title" | "titleJa" | "maker">): string {
  const explicit = stripBrand((item.seoTitle ?? "").trim());
  if (explicit) return explicit;

  const base =
    stripBrand((item.title ?? "").trim()) ||
    stripBrand((item.titleJa ?? "").trim()) ||
    (item.maker ? `${item.maker}｜HERITAGE` : "HERITAGE");

  if (/(歴史|系譜|名車|背景|ストーリー|年代)/.test(base)) return base;
  return `${base}｜歴史と名車の系譜`;
}

export function buildHeritageDescription(item: Pick<HeritageItem, "seoDescription" | "summary" | "lead" | "subtitle" | "body" | "title" | "titleJa" | "maker">): string {
  const title = stripBrand((item.title ?? item.titleJa ?? "").trim());
  const fallback =
    title
      ? `${title}の背景・時代・代表車を、一次情報と定番論点で整理します。`
      : "ブランド/時代の背景と代表車を、一次情報と定番論点で整理します。";

  return (
    buildDescriptionFromCandidates([
      item.seoDescription ?? null,
      item.summary ?? null,
      item.lead ?? null,
      item.subtitle ?? null,
      item.body ?? null,
      fallback,
    ]) || fallback
  );
}

export function buildNewsTitleBase(news: Pick<NewsItem, "seoTitle" | "title" | "titleJa">): string {
  const explicit = stripBrand((news.seoTitle ?? "").trim());
  if (explicit) return explicit;
  return stripBrand((news.titleJa ?? news.title ?? "").trim()) || "ニュース";
}

export function buildNewsDescription(news: Pick<NewsItem, "seoDescription" | "excerpt" | "commentJa">): string {
  return (
    buildDescriptionFromCandidates([
      news.seoDescription ?? null,
      (news as any).excerpt ?? null,
      (news as any).commentJa ?? null,
      "メーカー公式サイト等の一次情報リンクを要点整理したニュースです。",
    ]) || "メーカー公式サイト等の一次情報リンクを要点整理したニュースです。"
  );
}
