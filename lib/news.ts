// lib/news.ts
import { findAllNews, type NewsRecord } from "@/lib/repository/news-repository";

/**
 * Domain層で扱うニュース型
 */
export type NewsItem = {
  id: string;
  /** 元記事のURL */
  url: string;
  /** Next.jsのLink用エイリアス */
  link: string;
  /** 元の記事タイトル */
  title: string;
  /** 自動翻訳や手動翻訳した日本語タイトル */
  titleJa?: string | null;
  /** 要約・リード文 */
  excerpt?: string | null;
  /** カテゴリー（"EV"/"SPORTS"など任意文字列） */
  category?: string | null;
  /** メーカー（"BMW"/"TOYOTA"/"OTHER"など） */
  maker?: string | null;
  /** タグ一覧 */
  tags?: string[];
  /** 媒体名（"Response","CarWatch"など） */
  sourceName?: string | null;
  /** 公開日時（ISO文字列） */
  publishedAt?: string | null;
  /** データ生成日時（ISO文字列） */
  createdAt?: string | null;
  /** 編集部コメント（生データ） */
  editorNote?: string | null;
  /** 日本語コメント（画面表示用・editorNoteの別名） */
  commentJa?: string | null;
  /** 公開日時の日本語整形（例:"2025年1月1日"） */
  publishedAtJa?: string | null;
};

// Data Source層から上がってくる生データ
type RawNewsItem = NewsRecord;

function safeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateJa(iso?: string | null): string | undefined {
  const d = parseDate(iso ?? undefined);
  if (!d) return undefined;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toNewsItem(raw: RawNewsItem, index: number): NewsItem | null {
  if (!raw || typeof raw !== "object") return null;

  const anyRaw = raw as any;

  const id = safeString(anyRaw.id) ?? `news-${index}`;
  const url = safeString(anyRaw.url) ?? "#";
  const title = safeString(anyRaw.title) ?? "タイトル未設定";

  const titleJa = safeString(anyRaw.titleJa) ?? null;
  const excerpt = safeString(anyRaw.excerpt) ?? null;
  const category = safeString(anyRaw.category) ?? null;
  const maker = safeString(anyRaw.maker) ?? null;
  const sourceName = safeString(anyRaw.sourceName) ?? null;
  const editorNote = safeString(anyRaw.editorNote) ?? null;

  const rawTags = anyRaw.tags;
  let tags: string[] | undefined;
  if (Array.isArray(rawTags)) {
    const cleaned = rawTags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0);
    if (cleaned.length > 0) {
      tags = cleaned;
    }
  }

  const publishedAt = safeString(anyRaw.publishedAt) ?? null;
  const createdAt = safeString(anyRaw.createdAt) ?? null;
  const publishedAtJa =
    formatDateJa(publishedAt ?? createdAt ?? undefined) ?? null;

  const commentJa =
    safeString(anyRaw.commentJa) ??
    editorNote ??
    null;

  return {
    id,
    url,
    link: url,
    title,
    titleJa,
    excerpt,
    category,
    maker,
    tags,
    sourceName,
    publishedAt,
    createdAt,
    editorNote,
    commentJa,
    publishedAtJa,
  };
}

// 生データ→Domain型への変換＋ソート
function buildNewsCache(): NewsItem[] {
  const rawItems = findAllNews() as RawNewsItem[];
  const mapped = rawItems
    .map((raw, index) => toNewsItem(raw, index))
    .filter((item): item is NewsItem => item !== null)
    .sort((a, b) => {
      const ad = parseDate(a.publishedAt ?? a.createdAt ?? undefined);
      const bd = parseDate(b.publishedAt ?? b.createdAt ?? undefined);
      if (ad && bd) return bd.getTime() - ad.getTime();
      if (bd && !ad) return 1;
      if (ad && !bd) return -1;
      return 0;
    });

  return mapped;
}

// モジュール内キャッシュ（SSR/ISR前提なのでこれで十分）
let cachedAllNews: NewsItem[] | null = null;

function getAllNewsSync(): NewsItem[] {
  if (!cachedAllNews) {
    cachedAllNews = buildNewsCache();
  }
  return cachedAllNews;
}

function buildIdVariants(id: string): string[] {
  const set = new Set<string>();
  if (!id) return [];
  set.add(id);

  try {
    const decoded = decodeURIComponent(id);
    set.add(decoded);
  } catch {
    // ignore
  }

  try {
    const encoded = encodeURIComponent(id);
    set.add(encoded);
  } catch {
    // ignore
  }

  return Array.from(set);
}

/**
 * 全ニュース一覧（ソート済み）
 */
export async function getAllNews(): Promise<NewsItem[]> {
  return getAllNewsSync();
}

/**
 * 最新ニュースをlimit件取得
 */
export async function getLatestNews(limit = 80): Promise<NewsItem[]> {
  const all = getAllNewsSync();
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return all.slice(0, limit);
}

/**
 * IDからニュースを1件取得
 *
 * Next.jsの動的ルート[id]はURLデコードされた値を渡すため、
 * JSON上のid（URLエンコード済み）とのズレをここで吸収する。
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  if (!id) return null;
  const candidates = buildIdVariants(id);
  const all = getAllNewsSync();
  const found = all.find((item) => candidates.includes(item.id));
  return found ?? null;
}
