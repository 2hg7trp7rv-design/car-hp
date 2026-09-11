import type { EditorialArticleViewModel, EditorialArticlePageProps, EditorialArticleLabels, EditorialRelatedItem } from "./article-types";
import { formatArticleDate as formatDateDot, stripLeadingDisplayNumber } from "./article-format";
import { RichText, renderBlock, renderSentenceText, renderTitleLines, renderInlineText } from "./article-blocks";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import type {
  GuideDetailSection,
  GuideFaqItem,
} from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { EditorialArticleMotionClient } from "@/components/editorialArticle/EditorialArticleMotionClient";

import styles from "@/components/editorialArticle/editorial-article.module.css";

type ArticleKind = "GUIDE" | "COLUMN";

type EditorialSection = GuideDetailSection & {
  id: string;
  displayTitle: string;
  chapterLabel: string;
};

function compactText(text?: string | null): string {
  return String(text ?? "")
    .replace(/\s+/g, "")
    .trim();
}

function slugifyId(text?: string | null): string {
  return String(text ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function resolveArticleKind(labels: EditorialArticleLabels): ArticleKind {
  return labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE";
}
function normalizeTagForCompare(value?: string | null): string {
  return compactText(value)
    .toUpperCase()
    .replace(/／.+$/u, "")
    .replace(/実用ガイド|考察コラム|ガイド|コラム/u, (matched) =>
      matched === "コラム" || matched === "考察コラム" ? "COLUMN" : "GUIDE",
    );
}

function buildHeaderTags(articleKind: ArticleKind, eyebrowLabel?: string | null): { label: string; variant: "teal" | "soft" | "ghost" }[] {
  const baseTags: { label: string; variant: "teal" | "soft" | "ghost" }[] = [
    { label: articleKind, variant: "teal" },
    { label: String(eyebrowLabel ?? "").trim(), variant: "soft" },
    { label: articleKind === "COLUMN" ? "EDITORIAL" : "CAR BASICS", variant: "ghost" },
  ];
  const seen = new Set<string>();
  const out: { label: string; variant: "teal" | "soft" | "ghost" }[] = [];
  for (const item of baseTags) {
    if (!item.label) continue;
    const key = normalizeTagForCompare(item.label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function headerTagClassName(variant: "teal" | "soft" | "ghost"): string {
  if (variant === "teal") return `${styles.tag} ${styles.tagTeal}`;
  if (variant === "ghost") return `${styles.tag} ${styles.tagGhost}`;
  return `${styles.tag} ${styles.tagSoft}`;
}


function normalizeSectionTitle(title?: string | null, index = 0): string {
  const stripped = stripLeadingDisplayNumber(title);
  if (index === 0 && (!stripped || /結論|要点|先に/u.test(stripped)))
    return "先に結論";
  return stripped || `セクション${index + 1}`;
}

function resolveChapterLabel(
  title?: string | null,
  index = 0,
  kind: ArticleKind = "GUIDE",
): string {
  const text = compactText(title);
  if (index === 0 || /結論|先に|要点/.test(text))
    return kind === "COLUMN" ? "POINT" : "CONCLUSION";
  if (/まとめ|最後/.test(text)) return "SUMMARY";
  if (/失敗|危険|注意|やってはいけない|リスク|不快|トラブル|底づき|フルバンプ|バンプタッチ|ストローク/.test(text))
    return kind === "COLUMN" ? "COUNTERPOINT" : "FAILURE PATTERN";
  if (/ダンパー|減衰|揺れの収まり|収まり方/.test(text))
    return kind === "COLUMN" ? "BACKGROUND" : "DAMPER";
  if (/タイヤ|空気圧|扁平|摩耗/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "TIRE & PRESSURE";
  if (/柔らかい|硬い|乗り心地|乗り味|バランスの良い|接地/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "RIDE FEEL";
  if (/確認|試乗|中古|チェック|見る|相談|症状|違和感/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "TEST DRIVE";
  if (/費用|金額|保険|税|ローン|維持費|支払い/.test(text)) return "COST / RISK";
  if (/仕組み|構造|部品|方式|何で決まる|なぜ|理由/.test(text))
    return kind === "COLUMN" ? "BACKGROUND" : "MECHANISM";
  if (/比較|違い|選び方|選ぶ/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "CHECK POINT";
  return kind === "COLUMN" ? "VIEWPOINT" : "CHECK POINT";
}

function splitMarkdownTableRow(line: string): string[] {
  let cells = String(line ?? "")
    .trim()
    .split("|")
    .map((cell) => cell.trim());
  if (cells[0] === "") cells = cells.slice(1);
  if (cells[cells.length - 1] === "") cells = cells.slice(0, -1);
  return cells;
}

function isMarkdownSeparator(line: string): boolean {
  const cells = splitMarkdownTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function markdownBodyToSections(
  body?: string | null,
  kind: ArticleKind = "GUIDE",
): GuideDetailSection[] {
  const source = String(body ?? "").trim();
  if (!source) return [];

  const lines = source.split(/\r?\n/u);
  const sections: GuideDetailSection[] = [];
  let current: GuideDetailSection = {
    id: "conclusion",
    title: kind === "COLUMN" ? "要点" : "先に結論",
    blocks: [],
  };

  const pushSection = () => {
    if (current.blocks.length > 0 || sections.length === 0) {
      current.id =
        current.id ||
        slugifyId(current.title) ||
        `section-${sections.length + 1}`;
      sections.push(current);
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      i += 1;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/u);
    if (h2) {
      if (current.blocks.length > 0) pushSection();
      const title = h2[1].trim();
      current = { id: slugifyId(title), title, blocks: [] };
      i += 1;
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/u);
    if (h3) {
      current.blocks.push({
        type: "subheading",
        title: h3[1].trim(),
        level: 3,
      });
      i += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s+/.test(lines[i] ?? "")) {
        quoteLines.push(
          String(lines[i] ?? "")
            .replace(/^>\s+/, "")
            .trim(),
        );
        i += 1;
      }
      const text = quoteLines.join(" ").trim();
      if (text) current.blocks.push({ type: "quote", text });
      continue;
    }

    if (/^---+$/.test(line)) {
      current.blocks.push({ type: "divider" });
      i += 1;
      continue;
    }

    if (line.startsWith("![")) {
      const m = line.match(/^!\[(.*?)\]\((.*?)\)$/u);
      if (m)
        current.blocks.push({
          type: "image",
          alt: m[1] ?? "",
          src: m[2] ?? "",
        });
      i += 1;
      continue;
    }

    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      isMarkdownSeparator(lines[i + 1] ?? "")
    ) {
      const headers = splitMarkdownTableRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").includes("|")) {
        const row = splitMarkdownTableRow(lines[i] ?? "");
        if (row.length) rows.push(row);
        i += 1;
      }
      current.blocks.push({ type: "comparisonTable", headers, rows });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push(
          String(lines[i] ?? "")
            .replace(/^[-*]\s+/, "")
            .trim(),
        );
        i += 1;
      }
      current.blocks.push({ type: "list", items });
      continue;
    }

    let paragraph = line;
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^##\s+/.test(lines[i] ?? "") &&
      !/^###\s+/.test(lines[i] ?? "") &&
      !/^[-*]\s+/.test(lines[i] ?? "") &&
      !/^>\s+/.test(lines[i] ?? "") &&
      !/^---+$/.test(String(lines[i] ?? "").trim()) &&
      !String(lines[i] ?? "")
        .trim()
        .startsWith("![") &&
      !(
        String(lines[i] ?? "").includes("|") &&
        isMarkdownSeparator(lines[i + 1] ?? "")
      )
    ) {
      paragraph += ` ${String(lines[i] ?? "").trim()}`;
      i += 1;
    }
    current.blocks.push({ type: "paragraph", text: paragraph });
  }

  if (current.blocks.length > 0) pushSection();
  return sections;
}

function normalizeSections(
  article: EditorialArticleViewModel,
  kind: ArticleKind,
): EditorialSection[] {
  const rawSections =
    article.sections && article.sections.length > 0
      ? article.sections
      : markdownBodyToSections(article.body, kind);

  return rawSections.map((section, index) => {
    const title = normalizeSectionTitle(section.title, index);
    const displayTitle =
      String(section.displayTitle ?? "").trim() || title;
    const id = section.id?.trim() || slugifyId(title) || `section-${index + 1}`;
    return {
      ...section,
      id,
      title,
      displayTitle,
      chapterLabel:
        section.chapterLabel?.trim() ||
        resolveChapterLabel(title, index, kind),
    };
  });
}

function sourceLabel(source: string): string {
  return source
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[?#].*$/u, "")
    .replace(/\/$/u, "");
}

function renderInjectedKeyPoints(
  items: string[],
  linkIndex: Record<string, InternalLinkMeta>,
) {
  if (items.length === 0) return null;
  return (
    <section className={styles.listCard} data-cbj-reveal>
      <h3 className={styles.blockTitle}>最初に確認すること</h3>
      <div className={styles.listGrid}>
        {items.map((item, index) => (
          <article key={index} className={styles.listItem}>
            <span className={styles.listNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <RichText
              text={item}
              linkIndex={linkIndex}
              as="span"
              className={styles.listItemText}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function renderFaqItems(faq: GuideFaqItem[]) {
  if (faq.length === 0) return null;
  return (
    <section
      id="faq"
      className={styles.faqSection}
      aria-label="よくある質問"
      data-cbj-reveal
    >
      <p className={styles.sectionEyebrow}>FAQ ／ よくある質問</p>
      <h2 className={styles.sectionTitle}>よくある質問</h2>
      <div className={styles.faqList}>
        {faq.map((item, index) => (
          <details key={index} className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              <span className={styles.faqQuestionBadge}>Q</span>
              <strong className={styles.faqQuestionText}>{item.question}</strong>
              <i className={styles.faqQuestionToggle} aria-hidden="true">＋</i>
            </summary>
            <div className={styles.faqAnswer}>
              {renderInlineText(item.answer)}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function renderSection(
  section: EditorialSection,
  index: number,
  articleKind: ArticleKind,
  linkIndex: Record<string, InternalLinkMeta>,
  injectedKeyPoints: string[],
) {
  return (
    <section
      key={section.id}
      id={section.id}
      className={styles.editorialSection}
      data-article-section
      data-cbj-reveal
    >
      <div className={styles.sectionHead}>
        <p className={styles.sectionEyebrow}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true">／</span>
          <span>
            {section.chapterLabel ||
              resolveChapterLabel(section.title, index, articleKind)}
          </span>
        </p>
        <h2 className={styles.sectionTitle}>{renderSentenceText(section.displayTitle)}</h2>
        {section.deck ? (
          <p className={styles.sectionDeck}>{renderSentenceText(section.deck)}</p>
        ) : null}
      </div>
      <div className={styles.sectionBody}>
        {section.blocks.map((block, blockIndex) => (
          <Fragment key={`${section.id}-${blockIndex}`}>
            {renderBlock(block, blockIndex, linkIndex)}
          </Fragment>
        ))}
        {index === 0
          ? renderInjectedKeyPoints(injectedKeyPoints, linkIndex)
          : null}
      </div>
    </section>
  );
}

function renderSources(sources: string[], title?: string) {
  if (sources.length === 0) return null;
  return (
    <details className={styles.sourcesBox} data-cbj-reveal>
      <summary>
        <span>{title ?? "出典・参考資料"}</span>
        <span>{sources.length}件</span>
      </summary>
      <ol>
        {sources.map((source, index) => (
          <li key={index}>
            {/^(https?:\/\/)/i.test(source) ? (
              <a href={source} target="_blank" rel="noreferrer">
                {sourceLabel(source)}
              </a>
            ) : (
              source
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}

function renderUpdate(updateText?: string | null, title?: string) {
  if (!updateText) return null;
  return (
    <details className={styles.updateBox} data-cbj-reveal>
      <summary>
        <span>{title ?? "更新履歴"}</span>
        <span>表示</span>
      </summary>
      <p>{updateText}</p>
    </details>
  );
}

function renderRelated(
  relatedItems: EditorialRelatedItem[],
  labels: EditorialArticleLabels,
) {
  if (relatedItems.length === 0) return null;
  return (
    <section
      className={styles.relatedSection}
      aria-label={labels.relatedAriaLabel ?? labels.relatedTitle}
      data-cbj-reveal
    >
      <h2>{renderSentenceText(labels.relatedTitle)}</h2>
      <div className={styles.relatedGrid}>
        {relatedItems.slice(0, 3).map((item, index) => (
          <Link key={item.href} href={item.href} className={styles.relatedCard}>
            <div className={styles.relatedVisual} aria-hidden="true">
              {item.imageSrc ? (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt || item.title}
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                  className={styles.relatedVisualImage}
                />
              ) : (
                <>
                  <span>
                    {(item.metaLabel || labels.relatedTitle || "READ").slice(0, 14)}
                  </span>
                  <i />
                </>
              )}
            </div>
            <div className={styles.relatedBody}>
              <span className={styles.relatedMeta}>{item.metaLabel}</span>
              <h3>{renderSentenceText(item.title)}</h3>
              <p>{item.summary}</p>
              <small>
                {index === 0 ? "READ NEXT" : "READ"}
                {item.date ? `　${item.date}` : ""}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function readMinutesLabel(minutes?: number | null): string | null {
  if (!minutes) return null;
  return `${minutes} min`;
}

function sectionHasPointLikeBlock(section?: EditorialSection | null): boolean {
  return Boolean(
    section?.blocks?.some((block) => {
      const type = block.type;
      return (
        type === "list" ||
        type === "decisionCards" ||
        type === "editorialBoard" ||
        type === "comparisonTable"
      );
    }),
  );
}

function renderProgress() {
  return (
    <div className={styles.progress} aria-hidden="true">
      <div className={styles.progressBar} data-cbj-progress-bar />
    </div>
  );
}

function renderHeroDiagram(
  article: EditorialArticleViewModel,
) {
  if (article.suppressHeroVisual) return null;

  if (!article.heroImage) return null;
  return (
    <section className={styles.heroVisual}>
      <div className={`${styles.heroFrame} ${styles.heroFrameImage}`}>
        <Image src={article.heroImage} alt={article.heroAlt || article.title}
          fill sizes="(max-width: 880px) 100vw, 1280px"
          className={styles.heroPhoto} preload />
      </div>
    </section>
  );
}

function renderAuthorBar(article: EditorialArticleViewModel) {
  return (
    <div className={styles.authorBar} data-cbj-reveal data-cbj-delay="240">
      <Link href="/legal/about" className={styles.authorCard}>
        <div className={styles.authorAvatar}>編</div>
        <div className={styles.authorWho}>
          <b>{article.author.name}</b>
          {article.author.credential ? (
            <small>{article.author.credential}</small>
          ) : null}
        </div>
      </Link>
    </div>
  );
}

function renderToc(sections: EditorialSection[], faqLength: number) {
  const tocSections =
    faqLength > 0
      ? [
          ...sections,
          { id: "faq", displayTitle: "よくある質問" } as EditorialSection,
        ]
      : sections;
  if (tocSections.length === 0) return null;
  return (
    <aside className={styles.toc} aria-label="目次">
      <details open>
        <summary className={styles.tocTitle}>CONTENTS / 目次</summary>
        <ol>
          {tocSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={styles.tocLink}
                data-cbj-toc-link
              >
                {renderSentenceText(section.displayTitle)}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </aside>
  );
}

function renderRail(
  article: EditorialArticleViewModel,
  readLabel: string | null,
  articleKind: ArticleKind,
) {
  const editorPick = article.lead
    ? article.lead.split(/[。！？]/u)[0]
    : article.title;
  return (
    <aside className={styles.rail} aria-label="記事メタ情報">
      {readLabel ? (
        <div className={styles.railCard}>
          <h4>READING TIME</h4>
          <p className={styles.railNumber}>
            {readLabel.replace(/\s*min$/i, "")}
            <span>min</span>
          </p>
        </div>
      ) : null}
      <div className={styles.railCard}>
        <h4>SECTION</h4>
        <p className={styles.railNumber}>
          CBJ<span>{articleKind.toLowerCase()}</span>
        </p>
      </div>
      <div className={`${styles.railCard} ${styles.railCardAccent}`}>
        <h4>EDITOR&apos;S PICK</h4>
        <p>{editorPick}</p>
      </div>
    </aside>
  );
}

export function EditorialArticlePage({
  article,
  labels,
  linkIndex,
}: EditorialArticlePageProps) {
  const articleKind = resolveArticleKind(labels);
  const sections = normalizeSections(article, articleKind);
  const sources = (article.sources ?? [])
    .map((source) => String(source ?? "").trim())
    .filter(Boolean);
  const faq = article.faq ?? [];
  const updated = formatDateDot(article.updatedAt ?? article.publishedAt);
  const published = formatDateDot(article.publishedAt);
  const readLabel = readMinutesLabel(article.readMinutes);
  const keyPoints = article.keyPoints ?? [];
  const checkpoints = article.checkpoints ?? [];
  const injectedKeyPoints = keyPoints.length > 0 ? keyPoints : checkpoints;
  const relatedItems = article.relatedItems ?? [];
  const shouldInjectKeyPoints = !sectionHasPointLikeBlock(sections[0]);
  const headerTags = buildHeaderTags(articleKind, article.eyebrowLabel);

  return (
    <main
      className={styles.page}
      data-cbj-article-page
      data-kind={articleKind.toLowerCase()}
    >
      <EditorialArticleMotionClient />
      {renderProgress()}
      <div id="top" />
      <div className={styles.breadcrumbStrip} aria-label="パンくずリスト">
        <div className={styles.breadcrumbRoute}>
          {article.breadcrumbTrail
            .filter((item) => Boolean(item.href))
            .map((item, index, items) => (
              <Fragment key={`${item.label}-${index}`}>
                {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                {index < items.length - 1 ? <span>／</span> : null}
              </Fragment>
            ))}
          {article.breadcrumbTrail.some((item) => Boolean(item.href)) ? <span>／</span> : null}
        </div>
        <p className={styles.breadcrumbCurrent}>{renderSentenceText(article.title)}</p>
      </div>

      <header className={styles.head}>
        <div className={styles.headMeta} data-cbj-reveal>
          {headerTags.map((tag) => (
            <span key={`${tag.variant}-${tag.label}`} className={headerTagClassName(tag.variant)}>
              {tag.label}
            </span>
          ))}
          <div className={styles.metaRow}>
            {updated ? <span>UPDATED {updated}</span> : null}
            {readLabel ? (
              <>
                <span className={styles.metaDot} />{" "}
                <span>READ {readLabel.toUpperCase()}</span>
              </>
            ) : null}
            {published ? (
              <>
                <span className={styles.metaDot} /> <span>{published}</span>
              </>
            ) : null}
          </div>
        </div>
        <h1 className={styles.headTitle} data-cbj-reveal data-cbj-delay="80">
          {renderTitleLines([article.title])}
        </h1>
        {article.lead ? (
          <p className={styles.headLede} data-cbj-reveal data-cbj-delay="140">
            {article.lead}
          </p>
        ) : null}
      </header>

      {renderHeroDiagram(article)}
      {renderAuthorBar(article)}

      <div className={styles.layout}>
        {renderToc(sections, faq.length)}
        <div className={styles.content}>
          {sections.map((section, index) =>
            renderSection(
              section,
              index,
              articleKind,
              linkIndex,
              index === 0 && shouldInjectKeyPoints ? injectedKeyPoints : [],
            ),
          )}
          {article.actionBox ? (
            <section className={styles.listCard} aria-label="次のアクション">
              <h2>{article.actionBox.title}</h2>
              {article.actionBox.body ? <p>{article.actionBox.body}</p> : null}
              <ul>{article.actionBox.actions.map((action) => (
                <li key={action.href}><Link href={action.href}>{action.label}</Link></li>
              ))}</ul>
            </section>
          ) : null}
          {renderFaqItems(faq)}
          {renderSources(sources, labels.sourcesTitle)}
          {renderUpdate(article.updateText, labels.updateTitle)}
        </div>
        {renderRail(article, readLabel, articleKind)}
      </div>

      {renderRelated(relatedItems, labels)}
    </main>
  );
}
