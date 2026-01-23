import type { NewsSource } from "./news-sources";
import { NEWS_SOURCES } from "./news-sources";
import {
  generateTitleJa,
  generateOverviewJa,
  buildSeoDescriptionJa,
  detectSourceLang,
  type AutoJaKind,
} from "./news-auto-ja";

type ParsedFeedItem = {
  title: string;
  link: string;
  // 解析結果としては常にキーを持つ（値がない場合は undefined / 空文字）
  publishedAt: string | undefined;
  summary: string;
};

type InferredNewsKind =
  | "RECALL"
  | "NEW_MODEL"
  | "UPDATE"
  | "BUSINESS"
  | "MOTORSPORT"
  | "EVENT"
  | "AWARD"
  | "TECH"
  | "OTHER";

// ------------------------------------------------------------
// 運用ルール（B案）
// - 主要カテゴリ: NEW_MODEL / UPDATE / RECALL
// - BUSINESS / OTHER は「買う・維持・売る」に直結する場合のみ UPDATE として残す
// - AWARD / MOTORSPORT / EVENT は原則アーカイブ（一覧に出さない）
// ------------------------------------------------------------

function isImportantBusinessOrOther(title: string, summary: string): boolean {
  const text = `${title}\n${summary}`.toLowerCase();

  // 価格・受注・納期・生産・保証・アップデート等、ユーザーの判断に直結するものだけ残す
  const patterns: RegExp[] = [
    /\bprice\b|pricing|msrp|price revision|price increase|price decrease|値上げ|値下げ|価格|料金/, // 価格
    /\border\b|orders|ordering|order book|order intake|受注|注文|予約|オーダー/, // 受注
    /delivery|deliveries|shipment|lead time|納車|納期|出荷|供給/, // 納期/供給
    /production|manufactur|plant|factory|line|生産|工場|ライン|操業/, // 生産
    /warranty|guarantee|保証|延長保証/, // 保証
    /campaign|special offer|incentive|キャンペーン|特典/, // キャンペーン
    /software|ota|firmware|update|アップデート|改良|仕様変更|リフレッシュ/, // 更新
    /discontinue|end of production|販売終了|生産終了|受注停止|受注再開|販売停止|再開/, // 停止/再開
    /safety|regulation|compliance|法規|安全|規制/, // 規制
    /battery|charging|electric|ev|hybrid|fuel cell|電動|充電|バッテリー|電池|hv|phev/, // 電動
  ];

  return patterns.some((re) => re.test(text));
}

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstMatch(xml: string, re: RegExp): string | null {
  const m = re.exec(xml);
  return m?.[1] ? m[1].trim() : null;
}

function safeToISOString(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function toAbsoluteUrl(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function parseRss(xml: string): ParsedFeedItem[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return items
    .map((block) => {
      const titleRaw =
        firstMatch(block, /<title\b[^>]*>([\s\S]*?)<\/title>/i) ??
        firstMatch(block, /<media:title\b[^>]*>([\s\S]*?)<\/media:title>/i) ??
        "";
      const linkRaw =
        firstMatch(block, /<link\b[^>]*>([\s\S]*?)<\/link>/i) ??
        firstMatch(block, /<guid\b[^>]*>([\s\S]*?)<\/guid>/i) ??
        "";
      const pubRaw =
        firstMatch(block, /<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/i) ??
        firstMatch(block, /<dc:date\b[^>]*>([\s\S]*?)<\/dc:date>/i) ??
        firstMatch(block, /<updated\b[^>]*>([\s\S]*?)<\/updated>/i) ??
        "";
      const descRaw =
        firstMatch(block, /<description\b[^>]*>([\s\S]*?)<\/description>/i) ??
        firstMatch(block, /<content:encoded\b[^>]*>([\s\S]*?)<\/content:encoded>/i) ??
        "";

      const title = stripHtml(decodeBasicEntities(stripCdata(titleRaw)));
      const link = stripCdata(linkRaw).trim();
      const summary = stripHtml(decodeBasicEntities(stripCdata(descRaw)));

      const publishedAt = pubRaw ? safeToISOString(pubRaw) : undefined;
      if (!title || !link) return null;
      return { title, link, publishedAt, summary };
    })
    .filter((x): x is ParsedFeedItem => Boolean(x));
}

function parseAtom(xml: string): ParsedFeedItem[] {
  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return entries
    .map((block) => {
      const titleRaw = firstMatch(block, /<title\b[^>]*>([\s\S]*?)<\/title>/i) ?? "";
      const linkHref =
        firstMatch(block, /<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i) ??
        firstMatch(block, /<link\b[^>]*href=["']([^"']+)["'][^>]*>/i) ??
        "";
      const publishedRaw =
        firstMatch(block, /<published\b[^>]*>([\s\S]*?)<\/published>/i) ??
        firstMatch(block, /<updated\b[^>]*>([\s\S]*?)<\/updated>/i) ??
        "";
      const summaryRaw =
        firstMatch(block, /<summary\b[^>]*>([\s\S]*?)<\/summary>/i) ??
        firstMatch(block, /<content\b[^>]*>([\s\S]*?)<\/content>/i) ??
        "";

      const title = stripHtml(decodeBasicEntities(stripCdata(titleRaw)));
      const link = decodeBasicEntities(linkHref.trim());
      const summary = stripHtml(decodeBasicEntities(stripCdata(summaryRaw)));

      const publishedAt = publishedRaw ? safeToISOString(publishedRaw) : undefined;
      if (!title || !link) return null;
      return { title, link, publishedAt, summary };
    })
    .filter((x): x is ParsedFeedItem => Boolean(x));
}

function parseFeed(xml: string): ParsedFeedItem[] {
  const lower = xml.toLowerCase();
  if (lower.includes("<entry")) return parseAtom(xml);
  if (lower.includes("<item")) return parseRss(xml);
  return [];
}

function isProbablyHtml(text: string): boolean {
  const head = text.slice(0, 400).toLowerCase();
  return head.includes("<!doctype html") || head.includes("<html") || head.includes("<head");
}

function extractAlternateFeedUrlsFromHtml(html: string, baseUrl: string): string[] {
  const urls: string[] = [];

  // --- 1) <link rel="alternate" ...> を優先 ---
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];

  for (const tag of linkTags) {
    const rel = firstMatch(tag, /rel=["']([^"']+)["']/i) ?? "";
    const relTokens = rel
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (!relTokens.includes("alternate")) continue;

    const type = (firstMatch(tag, /type=["']([^"']+)["']/i) ?? "").toLowerCase();
    const href = firstMatch(tag, /href=["']([^"']+)["']/i) ?? "";
    if (!href) continue;

    const hrefLower = href.toLowerCase();
    const looksLikeFeed =
      type.includes("rss") ||
      type.includes("atom") ||
      type.includes("xml") ||
      hrefLower.includes("rss") ||
      hrefLower.includes("atom") ||
      hrefLower.includes("feed");

    if (!looksLikeFeed) continue;

    const abs = toAbsoluteUrl(href, baseUrl);
    urls.push(abs);
  }

  // --- 2) <a href="...">RSS/Feed</a> などの実リンクも拾う ---
  // （多くの広報/ニュースルームは head に alternate を出さない）
  const aTags = html.match(/<a\b[^>]*href=["'][^"']+["'][^>]*>/gi) ?? [];
  for (const tag of aTags) {
    const href = firstMatch(tag, /href=["']([^"']+)["']/i) ?? "";
    if (!href) continue;

    const hrefLower = href.toLowerCase();
    const looksLikeFeed =
      hrefLower.includes("rss") ||
      hrefLower.includes("atom") ||
      hrefLower.includes("feed") ||
      hrefLower.endsWith(".rss") ||
      hrefLower.endsWith(".xml") ||
      hrefLower.endsWith(".atom");

    if (!looksLikeFeed) continue;
    urls.push(toAbsoluteUrl(href, baseUrl));
  }

  // --- 3) よくある feed パスを補助的に試す ---
  // baseUrl の origin を起点に候補を作る
  try {
    const u = new URL(baseUrl);
    const origin = `${u.protocol}//${u.host}`;
    const common = [
      "/rss",
      "/rss.xml",
      "/feed",
      "/feed/",
      "/feed.xml",
      "/atom.xml",
      "/news/rss",
      "/press/rss",
      "/press-releases/rss",
      "/rss/news-releases.xml",
      "/rss/press-releases.xml",
    ];
    for (const p of common) urls.push(`${origin}${p}`);
  } catch {
    // ignore
  }

  // Dedupe while keeping order
  const seen = new Set<string>();
  const deduped = urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  // 保険: discovery が暴走しないように上限
  return deduped.slice(0, 8);
}

function inferNewsKindFromText(title: string, summary: string): InferredNewsKind {
  const text = `${title}\n${summary}`.toLowerCase();

  if (
    /(recall|service campaign|safety recall|voluntary recall)/i.test(text) ||
    /(リコール|自主回収|サービスキャンペーン|不具合|改善対策)/.test(text)
  ) {
    return "RECALL";
  }

  if (
    /(motorsport|race|racing|f1|wec|wrc|gt3|le mans|formula)/i.test(text) ||
    /(モータースポーツ|レース|耐久|ル・マン|F1|WEC|WRC)/.test(text)
  ) {
    return "MOTORSPORT";
  }

  if (
    /(award|wins|named|top safety pick|rating)/i.test(text) ||
    /(受賞|アワード|表彰|評価)/.test(text)
  ) {
    return "AWARD";
  }

  if (
    /(auto show|motor show|exhibition|event|showcase)/i.test(text) ||
    /(イベント|展示会|モーターショー|発表会)/.test(text)
  ) {
    return "EVENT";
  }

  if (
    /(sales|results|earnings|financial|production|deliveries)/i.test(text) ||
    /(決算|業績|販売|生産|出荷|納車|台数)/.test(text)
  ) {
    return "BUSINESS";
  }

  if (
    /(all-?new|new model|launch|introduces|unveils|debut|world premiere)/i.test(text) ||
    /(新型|発売|デビュー|発表|登場)/.test(text)
  ) {
    return "NEW_MODEL";
  }

  if (
    /(update|software|ota|facelift|refresh|enhanced)/i.test(text) ||
    /(改良|アップデート|仕様変更|年次改良|マイナーチェンジ)/.test(text)
  ) {
    return "UPDATE";
  }

  if (
    /(technology|battery|electric|ev|hybrid|fuel cell|safety system|autonomous)/i.test(text) ||
    /(技術|システム|電動|EV|電気|ハイブリッド|安全|運転支援)/.test(text)
  ) {
    return "TECH";
  }

  return "OTHER";
}

function tagsForKind(kind: InferredNewsKind): string[] {
  switch (kind) {
    case "RECALL":
      return ["リコール", "安全"];
    case "NEW_MODEL":
      return ["新型", "発表"];
    case "UPDATE":
      return ["改良", "アップデート"];
    case "BUSINESS":
      return ["業績", "販売"];
    case "MOTORSPORT":
      return ["モータースポーツ"];
    case "EVENT":
      return ["イベント"];
    case "AWARD":
      return ["受賞"];
    case "TECH":
      return ["技術"];
    default:
      return [];
  }
}

function commentForKind(kind: InferredNewsKind): string {
  switch (kind) {
    case "RECALL":
      return "要点: 公式のリコール/サービスキャンペーン情報です。対象車種・年式・症状と、対応（無償/有償）を先に確認。\n次の一手: 車台番号/型式で該当確認 → 予約 → 所要時間/代車の有無を押さえる。";
    case "NEW_MODEL":
      return "要点: 新型/改良の公式発表です。発売時期・グレード・価格帯を把握して、競合と条件を揃えて比較すると判断が速い。";
    case "UPDATE":
      return "要点: 仕様変更/更新などの公式アップデートです。対象年式・適用条件・費用の有無を確認し、自分の車に関係する範囲を切り分けましょう。";
    case "BUSINESS":
      return "要点: 生産/販売/決算など事業の公式更新です。納期・在庫・値引き環境に影響しやすいので、買い時/売り時の参考になります。";
    case "MOTORSPORT":
      return "要点: モータースポーツ関連の公式ニュースです。市販車への技術還元やブランド戦略のヒントを拾うと読みやすい。";
    case "EVENT":
      return "要点: イベント/ショーでの公式発表です。写真・スペックなど一次情報に当たって、実車の印象を掴むのが近道です。";
    case "AWARD":
      return "要点: 受賞/評価の公式ニュースです。評価軸（安全・環境・デザイン等）を確認して、購入条件に合うか判断しましょう。";
    case "TECH":
      return "要点: 技術/製品戦略の公式更新です。自分の使い方（距離・環境）にメリットが出るか、前提条件から確認。";
    default:
      return "要点: メーカー公式の更新です。タイトルと概要から『自分に関係する影響』を見つけてから全文を見ると判断が速い。";
  }
}

function isAllowedBySource(link: string, source: NewsSource): boolean {
  try {
    const normalize = (h: string) => h.replace(/^www\./i, "");
    const host = normalize(new URL(link).hostname);
    const baseHost = normalize(new URL(source.baseUrl).hostname);
    return host === baseHost || host.endsWith(`.${baseHost}`);
  } catch {
    return false;
  }
}

async function stableIdFromUrl(url: string): Promise<string> {
  const data = new TextEncoder().encode(url);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  const hex = hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `news-${hex.slice(0, 16)}`;
}

// RSS/Atom の summary はサイトによって短すぎたり長すぎたりするため、
// “詳細ページでの可読性 + 文字量” を優先してやや長めに持つ。
function toExcerpt(text?: string, maxLen = 360): string | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
}

/**
 * Fetches official RSS/Atom feeds and returns them as NewsRecord-like objects (plain objects).
 * This is Edge-runtime safe (fetch + regex parsing).
 */
export async function fetchOfficialNewsRecords(opts?: {
  perSourceLimit?: number;
  totalLimit?: number;
}): Promise<any[]> {
  const perSourceLimit = opts?.perSourceLimit ?? 15;
  const totalLimit = opts?.totalLimit ?? 60;

  // 一部の公式ニュースルームが bot 判定で 4xx を返すことがあるため、
  // 互換性の高い UA 形式に寄せつつサイト識別も残す
  const USER_AGENT = "Mozilla/5.0 (compatible; CarBoutiqueJournal/1.0; +https://carboutiquejournal.com)";

  async function fetchText(
    url: string,
    revalidateSeconds = 60 * 60,
    timeoutMs = 12000,
  ): Promise<string | null> {
    if (!url) return null;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          "accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.9",
          "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        },
        signal: controller.signal,
        next: { revalidate: revalidateSeconds },
      });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  }

  async function fetchFeedItems(feedUrl: string, source: NewsSource): Promise<ParsedFeedItem[]> {
    const text = await fetchText(feedUrl);
    if (!text) return [];
    if (isProbablyHtml(text)) return [];

    const parsed = parseFeed(text)
      .map((it) => ({
        ...it,
        link: toAbsoluteUrl(it.link, source.baseUrl),
      }))
      .filter((it) => isAllowedBySource(it.link, source));

    return parsed;
  }

  async function fetchItemsForSource(source: NewsSource): Promise<ParsedFeedItem[]> {
    // 1) Try configured feed URL first.
    const feedUrl = source.feedUrl ?? "";
    if (feedUrl) {
      const items = await fetchFeedItems(feedUrl, source);
      if (items.length > 0) return items;
    }

    // 2) Optional discovery fallback.
    if (source.discoverFeed === false) return [];

    const discoverUrl = source.discoverUrl ?? source.baseUrl;
    const html = await fetchText(discoverUrl);
    if (!html) return [];
    if (!isProbablyHtml(html)) {
      // Some sites point discoverUrl directly to feed.
      const parsed = parseFeed(html)
        .map((it) => ({ ...it, link: toAbsoluteUrl(it.link, source.baseUrl) }))
        .filter((it) => isAllowedBySource(it.link, source));
      if (parsed.length > 0) return parsed;
      return [];
    }

    const discovered = extractAlternateFeedUrlsFromHtml(html, discoverUrl);
    for (const url of discovered) {
      const items = await fetchFeedItems(url, source);
      if (items.length > 0) return items;
    }

    return [];
  }

  async function mapWithConcurrency<T, R>(
    input: T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = new Array(input.length);
    let cursor = 0;

    const workers = Array.from({ length: Math.max(1, concurrency) }).map(async () => {
      while (true) {
        const i = cursor++;
        if (i >= input.length) return;
        results[i] = await fn(input[i], i);
      }
    });

    await Promise.all(workers);
    return results;
  }

  const perSource = await mapWithConcurrency(NEWS_SOURCES, 4, async (source) => {
    const items = await fetchItemsForSource(source);
    return { source, items: items.slice(0, perSourceLimit) };
  });

  const flat: any[] = [];

  for (const { source, items } of perSource) {
    if (!items || items.length === 0) continue;

    for (const it of items) {
      try {
        const id = await stableIdFromUrl(it.link);
        const publishedAt = it.publishedAt ?? new Date().toISOString();
        const kind = inferNewsKindFromText(it.title, it.summary);
        const kindTags = tagsForKind(kind);
        const commentJa = commentForKind(kind);

        // --- 日本語タイトル/概要（無料・ノンAPIで自動生成） ---
        // NOTE:
        // - “逐語訳”ではなく「一覧で読める日本語タイトル」「薄くならない日本語概要」を優先
        // - 公式の事実を増やさない（断定しない書き方＋確認観点）
        const kindForJa = kind as AutoJaKind;
        const titleJa = generateTitleJa({
          title: it.title,
          summary: it.summary,
          maker: source.maker ?? null,
          kind: kindForJa,
        });

        const overviewJa = generateOverviewJa({
          titleJa,
          originalTitle: it.title,
          originalSummary: it.summary,
          maker: source.maker ?? null,
          kind: kindForJa,
        });

        // メタ向けは短く（一覧/詳細の本文は overviewJa を使う）
        const seoDescription = buildSeoDescriptionJa(overviewJa);
        const seoTitle = titleJa || it.title;

        // ------------------------------
        // カテゴリ/掲載制御（運用B案）
        // ------------------------------
        // 主要カテゴリ: NEW_MODEL / UPDATE / RECALL
        // BUSINESS / OTHER は「判断に直結するもの」だけ UPDATE に寄せる
        // AWARD / MOTORSPORT / EVENT は原則アーカイブ
        let status: "published" | "archived" = "published";
        let category: string | null = kind ?? source.category ?? null;

        if (kind === "AWARD" || kind === "MOTORSPORT" || kind === "EVENT") {
          status = "archived";
        }

        // TECH はUPDATEに集約（タグ/コメントはTECHのまま）
        if (kind === "TECH") {
          category = "UPDATE";
        }

        // BUSINESS / OTHER は重要なものだけ残す
        if (kind === "BUSINESS" || kind === "OTHER") {
          if (isImportantBusinessOrOther(it.title, it.summary)) {
            category = "UPDATE";
          } else {
            status = "archived";
          }
        }

        // アーカイブは一覧に出さない（上限カウントにも含めない）
        if (status !== "published") {
          continue;
        }

        flat.push({
          id,
          slug: id,
          type: "NEWS",
          status,
          title: it.title,
          // 一覧表示用：日本語タイトル
          titleJa: titleJa || null,
          // 詳細ページの「ニュース概要」本文：日本語の長め概要
          excerpt: overviewJa || toExcerpt(it.summary),
          // SEO/内部用の短め summary
          summary: seoDescription,
          seoTitle,
          seoDescription,
          commentJa,
          maker: source.maker ?? null,
          category,
          tags: Array.from(
            new Set([
              ...(source.tags ?? []),
              ...(source.maker ? [source.maker] : []),
              ...kindTags,
            ]),
          ),
          sourceName: source.name,
          sourceUrl: source.baseUrl,
          url: it.link,
          // オリジナル情報（検証用）
          sourceLang: detectSourceLang(`${it.title} ${it.summary}`),
          originalTitle: it.title,
          publishedAt,
          createdAt: publishedAt,
          updatedAt: publishedAt,
        });
      } catch {
        // ignore item-level failures
      }

      if (flat.length >= totalLimit) break;
    }

    if (flat.length >= totalLimit) break;
  }

  // Deduplicate by id (keep first)
  const seen = new Set<string>();
  const deduped = flat.filter((r) => {
    const id = String(r?.id ?? "");
    if (!id) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return deduped.slice(0, totalLimit);
}
