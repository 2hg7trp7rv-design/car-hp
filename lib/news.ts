// lib/news.ts
import newsRaw from "@/data/news-latest.json";

export type NewsItem = {
  id: string;
  /** 元記事のURL */
  url: string;
  /** Next.js の Link 用エイリアス */
  link: string;
  /** 元の記事タイトル */
  title: string;
  /** 自動翻訳や手動翻訳した日本語タイトル */
  titleJa?: string | null;
  /** 要約・リード文 */
  excerpt?: string | null;
  /** カテゴリー（"EV" / "SPORTS" など任意文字列） */
  category?: string | null;
  /** メーカー（"BMW" / "TOYOTA" / "OTHER" など） */
  maker?: string | null;
  /** タグ一覧 */
  tags?: string[];
  /** 媒体名（"Response", "CarWatch" など） */
  sourceName?: string | null;
  /** 公開日時（ISO文字列） */
  publishedAt?: string | null;
  /** データ生成日時（ISO文字列） */
  createdAt?: string | null;
  /** 編集部コメント（生データ） */
  editorNote?: string | null;
  /** 日本語コメント（画面表示用・editorNoteの別名） */
  commentJa?: string | null;
  /** 公開日時の日本語整形（例: "2025年1月1日"） */
  publishedAtJa?: string | null;
};

type RawNewsItem = {
  [key: string]: unknown;
};

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

  const id =
    safeString((raw as any).id) ??
    `news-${index}`;

  const url =
    safeString((raw as any).url) ??
    "#";

  const title =
    safeString((raw as any).title) ??
    "タイトル未設定";

  const titleJa = safeString((raw as any).titleJa);
  const excerpt = safeString((raw as any).excerpt);
  const category = safeString((raw as any).category);
  const maker = safeString((raw as any).maker);
  const sourceName = safeString((raw as any).sourceName);
  const editorNote = safeString((raw as any).editorNote);
  const commentJa =
    safeString((raw as any).commentJa) ??
    editorNote ??
    undefined;

  let tags: string[] | undefined;
  const rawTags = (raw as any).tags;
  if (Array.isArray(rawTags)) {
    tags = rawTags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0);
    if (tags.length === 0) tags = undefined;
  }

  const publishedAt = safeString((raw as any).publishedAt);
  const createdAt = safeString((raw as any).createdAt);
  const publishedAtJa = formatDateJa(publishedAt ?? createdAt ?? undefined);

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

const rawItems = (newsRaw as RawNewsItem[]) ?? [];

const allNews: NewsItem[] = rawItems
  .map(toNewsItem)
  .filter((item): item is NewsItem => item !== null)
  .sort((a, b) => {
    const ad = parseDate(a.publishedAt ?? a.createdAt ?? undefined);
    const bd = parseDate(b.publishedAt ?? b.createdAt ?? undefined);
    if (ad && bd) return bd.getTime() - ad.getTime();
    if (bd && !ad) return 1;
    if (ad && !bd) return -1;
    return 0;
  });

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
  return allNews;
}

/**
 * 最新ニュースをlimit件取得
 */
export async function getLatestNews(limit = 80): Promise<NewsItem[]> {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return allNews.slice(0, limit);
}

/**
 * IDからニュースを1件取得
 *
 * Next.js の動的ルート [id] は URL デコードされた値を渡すため、
 * JSON上の id（URLエンコード済み）とのズレをここで吸収する。
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  if (!id) return null;

  const candidates = buildIdVariants(id);
  const found = allNews.find((item) =>
    candidates.includes(item.id),
  );

  return found ?? null;
}
