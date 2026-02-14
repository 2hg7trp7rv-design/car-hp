import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { ArticleTable } from "@/components/content/ArticleTable";
import { CaseStudyCard, parseCaseRow } from "@/components/content/CaseStudyCard";
import { CtaBox } from "@/components/content/CtaBox";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

import { getSiteUrl } from "@/lib/site";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";
import { getAllGuides, getGuideBySlug, getRelatedGuidesV12 } from "@/lib/guides";
import type { GuideItem } from "@/lib/guides";
import { isIndexableGuide } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

type PageProps = {
  params: { slug: string };
};

type TocItem = { id: string; text: string };

type Parsed = {
  lead: string;
  summary: string[];
  checklist: string[];
  toc: TocItem[];
  blocks: Array<
    | { type: "h2"; id: string; text: string }
    | { type: "h3"; id: string; text: string }
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "table"; headers: string[]; rows: string[][] }
    | { type: "highlight"; title: string; lines: string[] }
    | { type: "warning"; title: string; lines: string[] }
    | { type: "case"; title: string; situation?: string | null; rows: { label: string; status: "ok" | "ng" | "neutral"; text: string }[] }
    | { type: "cta"; title: string; lead?: string | null; buttons: { label: string; href: string; external?: boolean }[] }
  >;
};

function formatDateJa(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function slugifyId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function splitPipeRow(line: string): string[] {
  const t = (line ?? "").trim();
  if (!t.includes("|")) return [];
  let parts = t.split("|").map((s) => s.trim());
  if (parts[0] === "") parts = parts.slice(1);
  if (parts[parts.length - 1] === "") parts = parts.slice(0, -1);
  return parts;
}

function isSeparatorRow(line: string): boolean {
  const cells = splitPipeRow(line);
  if (cells.length < 2) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function parseGuideBodyIdeal(body: string, fallbackLead: string): Parsed {
  const raw = (body ?? "").toString();
  const lines = raw.split(/\r?\n/);

  const blocks: Parsed["blocks"] = [];
  const toc: TocItem[] = [];

  let lead = (fallbackLead ?? "").trim();
  let summary: string[] = [];
  let checklist: string[] = [];

  const pushParagraph = (text: string) => {
    const t = (text ?? "").trim();
    if (!t) return;
    blocks.push({ type: "p", text: t });
    if (!lead) lead = t;
  };

  const pushList = (items: string[]) => {
    const cleaned = items.map((x) => (x ?? "").trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    blocks.push({ type: "ul", items: cleaned });
  };

  const readListAt = (startIdx: number): { items: string[]; next: number } => {
    const items: string[] = [];
    let i = startIdx;
    while (i < lines.length) {
      const l = (lines[i] ?? "").trim();
      const m = l.match(/^[-•]\s+(.+)$/);
      if (!m) break;
      items.push((m[1] ?? "").trim());
      i += 1;
    }
    return { items, next: i };
  };

  const readParagraphAt = (startIdx: number): { text: string; next: number } => {
    let i = startIdx;
    const parts: string[] = [];
    while (i < lines.length) {
      const l = (lines[i] ?? "").trim();
      if (!l) {
        if (parts.length > 0) break;
        i += 1;
        continue;
      }
      if (/^#{2,4}\s+/.test(l)) break;
      if (/^[-•]\s+/.test(l)) break;
      if (/^\|/.test(l)) break;
      parts.push(l);
      i += 1;
    }
    return { text: parts.join("\n").trim(), next: i };
  };

  const readTableAt = (startIdx: number): { headers: string[]; rows: string[][]; next: number } | null => {
    const header = splitPipeRow(lines[startIdx] ?? "");
    if (header.length < 2) return null;
    if (!isSeparatorRow(lines[startIdx + 1] ?? "")) return null;

    const rows: string[][] = [];
    let i = startIdx + 2;
    while (i < lines.length) {
      const row = splitPipeRow(lines[i] ?? "");
      if (row.length === 0) break;
      // stop at next heading
      if (/^#{2,4}\s+/.test((lines[i] ?? "").trim())) break;
      rows.push(row);
      i += 1;
    }
    return { headers: header, rows, next: i };
  };

  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? "").trim();
    if (!line) {
      i += 1;
      continue;
    }

    // H2
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const text = (h2[1] ?? "").trim();
      const id = `section-${toc.length + 1}`;

      // Summary block capture
      if (/結論/.test(text)) {
        const list = readListAt(i + 1);
        if (list.items.length > 0 && summary.length === 0) {
          summary = list.items.slice(0, 3);
          i = list.next;
          continue;
        }
      }

      // Checklist capture
      if (/まず確認/.test(text) || /チェックリスト/.test(text)) {
        const list = readListAt(i + 1);
        if (list.items.length > 0 && checklist.length === 0) {
          checklist = list.items;
          i = list.next;
          continue;
        }
      }

      // CTA capture
      if (/今すぐやるべきこと/.test(text)) {
        const p = readParagraphAt(i + 1);
        const list = readListAt(p.next);
        const buttons = list.items
          .map((x) => {
            const m = x.match(/^\[([^\]]+)\]\(([^\)]+)\)/);
            if (!m) return null;
            const href = (m[2] ?? "").trim();
            return {
              label: (m[1] ?? "").trim(),
              href,
              external: /^https?:\/\//.test(href),
            };
          })
          .filter(Boolean) as any;

        blocks.push({
          type: "cta",
          title: "今すぐやるべきこと",
          lead: p.text || null,
          buttons: buttons.slice(0, 2),
        });
        i = list.next;
        continue;
      }

      toc.push({ id, text });
      blocks.push({ type: "h2", id, text });
      i += 1;
      continue;
    }

    // H3 (case)
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const text = (h3[1] ?? "").trim();
      const id = slugifyId(text);

      if (/^ケース\d+/.test(text) || text.includes("ケース")) {
        const p = readParagraphAt(i + 1);
        const list = readListAt(p.next);
        const rows = list.items
          .map((x) => parseCaseRow("- " + x))
          .filter(Boolean) as any;

        blocks.push({
          type: "case",
          title: text,
          situation: p.text || null,
          rows,
        });
        i = list.next;
        continue;
      }

      blocks.push({ type: "h3", id, text });
      i += 1;
      continue;
    }

    // Table
    if (line.startsWith("|") && isSeparatorRow(lines[i + 1] ?? "")) {
      const tbl = readTableAt(i);
      if (tbl) {
        blocks.push({ type: "table", headers: tbl.headers, rows: tbl.rows });
        i = tbl.next;
        continue;
      }
    }

    // Highlight/Warning (simple)
    if (/^重要[:：]/.test(line)) {
      blocks.push({ type: "highlight", title: "重要", lines: [line.replace(/^重要[:：]\s*/, "")] });
      i += 1;
      continue;
    }
    if (/^注意[:：]/.test(line) || line.startsWith("⚠")) {
      blocks.push({ type: "warning", title: "注意", lines: [line.replace(/^注意[:：]\s*/, "").replace(/^⚠️?\s*/, "")] });
      i += 1;
      continue;
    }

    // List
    if (/^[-•]\s+/.test(line)) {
      const list = readListAt(i);
      pushList(list.items);
      i = list.next;
      continue;
    }

    // Paragraph
    const p = readParagraphAt(i);
    if (p.text) {
      pushParagraph(p.text);
      i = p.next;
      continue;
    }

    i += 1;
  }

  return { lead, summary, checklist, toc, blocks };
}

function categoryLabel(category?: string | null): string {
  if (!category) return "GUIDE";
  // Keep it simple: show raw category when it's already Japanese.
  if (/\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}/u.test(category)) return category;

  // Fallback mapping
  const map: Record<string, string> = {
    TROUBLE: "保険・緊急対応",
    MONEY: "お金",
    BUY: "購入",
    SELL: "売却",
    MAINTENANCE: "整備",
    LIFE: "カーライフ",
    BEGINNER: "初心者",
    ADVANCED: "上級",
    MAINTENANCE_COST: "維持費",
    KNOWLEDGE: "知識",
  };
  return map[category] ?? category;
}

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) return {};

  const titleBase = buildGuideTitleBase(guide.title);
  const description = buildGuideDescription(guide);
  const title = withBrand(titleBase);

  const indexable = isIndexableGuide(guide);
  const robots = indexable ? undefined : NOINDEX_ROBOTS;

  return {
    title,
    description,
    robots,
    alternates: {
      canonical: `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) return notFound();

  const parsed = parseGuideBodyIdeal(guide.body, guide.lead ?? "");
  const related = await getRelatedGuidesV12(guide, 4);

  const published = formatDateJa(guide.publishedAt ?? guide.createdAt ?? null);
  const updated = formatDateJa(guide.updatedAt ?? null);
  const readMinutes = guide.readMinutes ?? null;
  const cat = categoryLabel(guide.category ?? null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    datePublished: guide.publishedAt ?? guide.createdAt ?? undefined,
    dateModified: guide.updatedAt ?? undefined,
    mainEntityOfPage: `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`,
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: getSiteUrl(),
    },
  };

  return (
    <main className="cbj-guide-ideal" id="top">
      <JsonLd json={jsonLd} />

      <div className="container">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href="/">HOME</Link>
          <span>›</span>
          <Link href="/guide">GUIDE</Link>
          <span>›</span>
          <span>{cat}</span>
          <span>›</span>
          <span>{guide.title}</span>
        </nav>

        <div className="article-meta">
          <span className="badge">{cat}</span>
          {published ? <span>📅 公開: {published}</span> : null}
          {updated ? <span>🔄 更新: {updated}</span> : null}
          {readMinutes ? <span>⏱️ 読了時間: {readMinutes}分</span> : null}
        </div>

        <h1>{renderInlineMarkdown(guide.title, { tone: "light" })}</h1>

        <div className="author-info">
          <div className="author-avatar" aria-hidden />
          <div>
            <div className="author-name">CAR BOUTIQUE JOURNAL 編集部</div>
            <div className="author-credentials">実務・一次情報ベースで整理</div>
          </div>
        </div>

        {parsed.lead ? <div className="lead">{renderInlineMarkdown(parsed.lead, { tone: "light" })}</div> : null}

        {parsed.summary.length > 0 ? (
          <div className="summary-box">
            <h2>📌 この記事の結論（3行で）</h2>
            <ul>
              {parsed.summary.map((s, idx) => (
                <li key={idx}>{renderInlineMarkdown(s, { tone: "light" })}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {parsed.toc.length > 0 ? (
          <div className="toc">
            <h2>📖 目次</h2>
            <ul>
              {parsed.toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{renderInlineMarkdown(t.text, { tone: "light" })}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {parsed.checklist.length > 0 ? (
          <div className="checklist">
            <h3>📝 まず確認すべきこと（5分でできる）</h3>
            <ul>
              {parsed.checklist.map((s, idx) => (
                <li key={idx}>{renderInlineMarkdown(s, { tone: "light" })}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="content">
          {parsed.blocks.map((b, idx) => {
            if (b.type === "h2") return <h2 key={idx} id={b.id}>{renderInlineMarkdown(b.text, { tone: "light" })}</h2>;
            if (b.type === "h3") return <h3 key={idx} id={b.id}>{renderInlineMarkdown(b.text, { tone: "light" })}</h3>;
            if (b.type === "p") return <p key={idx}>{renderInlineMarkdown(b.text, { tone: "light" })}</p>;
            if (b.type === "ul") {
              return (
                <ul key={idx} className="list-disc pl-6">
                  {b.items.map((it, i2) => (
                    <li key={i2}>{renderInlineMarkdown(it, { tone: "light" })}</li>
                  ))}
                </ul>
              );
            }
            if (b.type === "table") return <ArticleTable key={idx} headers={b.headers} rows={b.rows} tone="light" />;
            if (b.type === "highlight") {
              return (
                <div key={idx} className="highlight-box">
                  <strong>{b.title}:</strong> {renderInlineMarkdown(b.lines.join("\n"), { tone: "light" })}
                </div>
              );
            }
            if (b.type === "warning") {
              return (
                <div key={idx} className="warning-box">
                  <strong>⚠️ {b.title}</strong>
                  <div className="mt-2">{renderInlineMarkdown(b.lines.join("\n"), { tone: "light" })}</div>
                </div>
              );
            }
            if (b.type === "case") return <CaseStudyCard key={idx} title={b.title} situation={b.situation} rows={b.rows} />;
            if (b.type === "cta") return <CtaBox key={idx} title={b.title} lead={b.lead} buttons={b.buttons} />;
            return null;
          })}
        </div>

        {related.length > 0 ? (
          <section className="related-articles">
            <h2>次に読むべきガイド</h2>
            {related.map((g) => (
              <Link key={g.slug} href={`/guide/${encodeURIComponent(g.slug)}`} className="article-card">
                <h3>{renderInlineMarkdown(g.title, { tone: "light" })}</h3>
                <p>{renderInlineMarkdown(g.summary ?? "", { tone: "light" })}</p>
              </Link>
            ))}
          </section>
        ) : null}

        <div className="sources">
          <h3>📚 出典・参考資料</h3>
          <ul>
            {(guide.sources ?? []).slice(0, 20).map((u, idx) => (
              <li key={idx}>
                <a href={u} target="_blank" rel="noopener noreferrer">{u}</a>
              </li>
            ))}
          </ul>
        </div>

        {guide.updateReason ? (
          <div className="update-log">
            <strong>更新理由:</strong> {renderInlineMarkdown(guide.updateReason, { tone: "light" })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
