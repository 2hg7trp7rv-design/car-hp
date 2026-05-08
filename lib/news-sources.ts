import sourcesRaw from "@/data/news-sources.json";

export type NewsSource = {
  id: string;
  name: string;
  maker?: string;
  category?: string;
  baseUrl: string;
  /**
   * RSS/Atom feed URL.
   *
   * Some official media sites do not expose a feed URL directly.
   * In that case you can omit this and rely on feed discovery.
   */
  feedUrl?: string;

  /**
   * When true, try to discover RSS/Atom endpoints from HTML (link rel="alternate").
   * Falls back to discovery when feedUrl is missing or fails.
   */
  discoverFeed?: boolean;

  /**
   * Optional URL to fetch for feed discovery (defaults to baseUrl).
   */
  discoverUrl?: string;

  lang?: string;
  tags?: string[];
};

function normalizeSource(raw: any): NewsSource | null {
  const id = typeof raw?.id === "string" ? raw.id.trim() : "";
  const name = typeof raw?.name === "string" ? raw.name.trim() : "";
  const baseUrl = typeof raw?.baseUrl === "string" ? raw.baseUrl.trim() : "";
  const feedUrlRaw = typeof raw?.feedUrl === "string" ? raw.feedUrl.trim() : "";
  const discoverUrlRaw =
    typeof raw?.discoverUrl === "string" ? raw.discoverUrl.trim() : "";
  const discoverFeedRaw =
    typeof raw?.discoverFeed === "boolean" ? raw.discoverFeed : undefined;

  if (!id || !name || !baseUrl) return null;

  const maker = typeof raw?.maker === "string" ? raw.maker.trim() : undefined;
  const category = typeof raw?.category === "string" ? raw.category.trim() : undefined;
  const lang = typeof raw?.lang === "string" ? raw.lang.trim() : undefined;

  const tags = Array.isArray(raw?.tags)
    ? raw.tags.map((t: any) => (typeof t === "string" ? t.trim() : "")).filter(Boolean)
    : undefined;

  // Default: enable discovery as a fallback (keeps things resilient across vendors)
  const discoverFeed = discoverFeedRaw ?? true;
  const feedUrl = feedUrlRaw || undefined;
  const discoverUrl = discoverUrlRaw || undefined;

  return {
    id,
    name,
    maker,
    category,
    baseUrl,
    feedUrl,
    discoverFeed,
    discoverUrl,
    lang,
    tags,
  };
}

export const NEWS_SOURCES: NewsSource[] = (Array.isArray(sourcesRaw) ? sourcesRaw : [])
  .map(normalizeSource)
  .filter((s): s is NewsSource => Boolean(s));


export function getNewsSourceBaseUrls(): string[] {
  return NEWS_SOURCES.map((s) => s.baseUrl).filter(Boolean);
}

export function getAllowedNewsHostnames(): string[] {
  const set = new Set<string>();
  for (const s of NEWS_SOURCES) {
    try {
      set.add(new URL(s.baseUrl).hostname);
    } catch {
      // ignore
    }
  }
  return Array.from(set);
}

export function isAllowedNewsUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    const allowed = getAllowedNewsHostnames();
    return allowed.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}
