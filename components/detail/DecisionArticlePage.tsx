import Link from "next/link";

import type {
  GuideActionBox,
  GuideAuthorProfile,
  GuideBreadcrumbItem,
  GuideDetailBlock,
  GuideDetailSection,
  GuideFaqItem,
} from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { ScrollSpecTable } from "@/components/content/ScrollSpecTable";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";

import styles from "@/components/guide/detail/guide-decision.module.css";

export type DecisionRelatedItem = {
  slug: string;
  href: string;
  metaLabel: string;
  title: string;
  summary: string;
  date?: string | null;
};

export type DecisionArticleLabels = {
  relatedTitle: string;
  relatedAriaLabel?: string;
  sourcesTitle?: string;
  updateTitle?: string;
  footerListHref: string;
  footerListLabel: string;
};

export type DecisionArticleViewModel = {
  title: string;
  eyebrowLabel: string;
  breadcrumbTrail: GuideBreadcrumbItem[];
  author: GuideAuthorProfile;
  lead?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readMinutes?: number | null;
  keyPoints?: string[] | null;
  checkpoints?: string[] | null;
  sections?: GuideDetailSection[] | null;
  faq?: GuideFaqItem[] | null;
  actionBox?: GuideActionBox | null;
  sources?: string[] | null;
  updateText?: string | null;
  relatedItems?: DecisionRelatedItem[] | null;
};

export type DecisionArticlePageProps = {
  article: DecisionArticleViewModel;
  labels: DecisionArticleLabels;
  linkIndex: Record<string, InternalLinkMeta>;
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

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function normalizeSections(
  sections?: GuideDetailSection[] | null,
): Array<GuideDetailSection & { id: string }> {
  return (sections ?? []).map((section) => ({
    ...section,
    id: section.id?.trim() || slugifyId(section.title),
  }));
}

function blockTextClass(blockTone?: string | null): string {
  switch (blockTone) {
    case "warn":
      return `${styles.callout} ${styles.calloutWarn}`;
    case "note":
      return `${styles.callout} ${styles.calloutNote}`;
    case "info":
      return `${styles.callout} ${styles.calloutInfo}`;
    default:
      return `${styles.callout} ${styles.calloutAccent}`;
  }
}

function renderAction(action: GuideActionBox["actions"][number], index: number) {
  const className = styles.ctaButton;
  if (action.external || isExternalHref(action.href)) {
    return (
      <a key={index} href={action.href} className={className} target="_blank" rel="noreferrer">
        {action.label}
      </a>
    );
  }

  return (
    <Link key={index} href={action.href} className={className}>
      {action.label}
    </Link>
  );
}

function renderFaqItems(faq: GuideFaqItem[]) {
  if (faq.length === 0) return null;
  return (
    <section className={styles.blockCard} aria-label="よくある質問">
      <h2 className={styles.blockTitle}>よくある質問</h2>
      <div className={styles.faqList}>
        {faq.map((item, index) => (
          <article key={index} className={styles.faqCard}>
            <div className={styles.faqQuestion}>{item.question}</div>
            <div className={styles.faqAnswer}>{item.answer}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderBlock(
  block: GuideDetailBlock,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  if (block.type === "paragraph") {
    return (
      <TextWithInternalLinkCards
        key={index}
        text={block.text}
        linkIndex={linkIndex}
        as="p"
        className={styles.paragraph}
        textClassName={styles.paragraph}
      />
    );
  }

  if (block.type === "list") {
    return (
      <ul key={index} className={styles.list}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex} className={styles.listItem}>
            <TextWithInternalLinkCards
              text={item}
              linkIndex={linkIndex}
              as="span"
              className={styles.listItemText}
              textClassName={styles.listItemText}
            />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "comparisonTable") {
    return (
      <div key={index} className={styles.tableWrap}>
        {block.title ? <p className={styles.subTitle}>{block.title}</p> : null}
        <ScrollSpecTable headers={block.headers} rows={block.rows} />
        {block.note ? <p className={styles.tableNote}>{block.note}</p> : null}
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <section key={index} className={blockTextClass(block.tone)}>
        {block.title ? <h3 className={styles.calloutTitle}>{block.title}</h3> : null}
        {block.body ? <p className={styles.calloutBody}>{block.body}</p> : null}
        {block.items && block.items.length > 0 ? (
          <ul className={styles.calloutList}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  if (block.type === "flow") {
    return (
      <section key={index} className={styles.flowCard}>
        {block.title ? <p className={styles.subTitle}>{block.title}</p> : null}
        <ol className={styles.flowList}>
          {block.steps.map((step, stepIndex) => (
            <li key={stepIndex} className={styles.flowItem}>
              <span className={styles.flowNumber}>{stepIndex + 1}</span>
              <div className={styles.flowBody}>
                <p className={styles.flowTitle}>{step.title}</p>
                {step.body ? <p className={styles.flowText}>{step.body}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (block.type === "timeline") {
    return (
      <section key={index} className={styles.timelineCard}>
        {block.title ? <p className={styles.subTitle}>{block.title}</p> : null}
        <div className={styles.timelineList}>
          {block.items.map((item, itemIndex) => (
            <article key={itemIndex} className={styles.timelineItem}>
              <div className={styles.timelineLabel}>{item.label}</div>
              <div className={styles.timelineBody}>
                {item.title ? <p className={styles.timelineTitle}>{item.title}</p> : null}
                {item.body ? <p className={styles.timelineText}>{item.body}</p> : null}
                {item.items && item.items.length > 0 ? (
                  <ul className={styles.timelineBullets}>
                    {item.items.map((entry, entryIndex) => (
                      <li key={entryIndex}>{entry}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "decisionCards") {
    return (
      <section key={index} className={styles.decisionCardWrap}>
        {block.title ? <p className={styles.subTitle}>{block.title}</p> : null}
        <div className={styles.decisionGrid}>
          {block.cards.map((card, cardIndex) => (
            <article key={cardIndex} className={styles.decisionCard}>
              {card.badge ? <div className={styles.decisionBadge}>{card.badge}</div> : null}
              <h3 className={styles.decisionTitle}>{card.title}</h3>
              {card.body ? <p className={styles.decisionBody}>{card.body}</p> : null}
              {card.items && card.items.length > 0 ? (
                <ul className={styles.decisionList}>
                  {card.items.map((entry, entryIndex) => (
                    <li key={entryIndex}>{entry}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "caseStudy") {
    return (
      <section key={index} className={styles.caseStudyWrap}>
        {block.title ? <p className={styles.subTitle}>{block.title}</p> : null}
        <div className={styles.caseStudyGrid}>
          {block.cases.map((entry, caseIndex) => (
            <article key={caseIndex} className={styles.caseStudyCard}>
              <h3 className={styles.caseStudyTitle}>{entry.title}</h3>
              {entry.intro ? <p className={styles.caseStudyIntro}>{entry.intro}</p> : null}
              <div className={styles.caseTable}>
                {entry.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className={styles.caseRow}>
                    <div className={styles.caseLabel}>{row.label}</div>
                    <div className={styles.caseValue}>
                      {row.value}
                      {row.note ? <span className={styles.caseNote}>{row.note}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return null;
}

export function DecisionArticlePage({ article, labels, linkIndex }: DecisionArticlePageProps) {
  const sections = normalizeSections(article.sections);
  const keyPoints = article.keyPoints ?? [];
  const checkpoints = article.checkpoints ?? [];
  const faq = article.faq ?? [];
  const actionBox = article.actionBox ?? null;
  const relatedItems = article.relatedItems ?? [];
  const sources = article.sources ?? [];
  const breadcrumbTrail = article.breadcrumbTrail ?? [];

  return (
    <main className={styles.page}>
      <div id="top" />

      <div className={styles.container}>
        <div className={styles.rail}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumbTrail.map((item, index) => (
              <span key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
                {item.href ? (
                  <Link className={styles.breadcrumbLink} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
                {index < breadcrumbTrail.length - 1 ? <span className={styles.breadcrumbSep}>›</span> : null}
              </span>
            ))}
          </nav>

          <div className={styles.meta}>
            <span className={styles.badge}>{article.eyebrowLabel}</span>
            {article.publishedAt ? <span className={styles.metaItem}>公開: {formatDateJa(article.publishedAt)}</span> : null}
            {article.updatedAt ? <span className={styles.metaItem}>更新: {formatDateJa(article.updatedAt)}</span> : null}
            {article.readMinutes ? <span className={styles.metaItem}>読了時間: {article.readMinutes}分</span> : null}
          </div>

          <h1 className={styles.title}>{article.title}</h1>

          <section className={styles.authorBox} aria-label="執筆者情報">
            <div className={styles.authorAvatar} aria-hidden="true" />
            <div>
              <div className={styles.authorName}>{article.author.name}</div>
              {article.author.credential ? (
                <div className={styles.authorCred}>{article.author.credential}</div>
              ) : null}
            </div>
          </section>

          {article.lead ? <section className={styles.lead}>{article.lead}</section> : null}

          {keyPoints.length > 0 ? (
            <section className={`${styles.blockCard} ${styles.summaryCard}`}>
              <h2 className={styles.blockTitle}>要点</h2>
              <ul className={styles.summaryList}>
                {keyPoints.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {sections.length > 0 ? (
            <section className={`${styles.blockCard} ${styles.tocCard}`} aria-label="目次">
              <h2 className={styles.blockTitle}>目次</h2>
              <ol className={styles.tocList}>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={styles.tocLink}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {checkpoints.length > 0 ? (
            <section className={`${styles.blockCard} ${styles.checkpointCard}`}>
              <h2 className={styles.blockTitle}>確認ポイント</h2>
              <ul className={styles.checkpointList}>
                {checkpoints.map((item, index) => (
                  <li key={index} className={styles.checkpointItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <article className={styles.content}>
            {sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <div className={styles.sectionBody}>
                  {section.blocks.map((block, index) => renderBlock(block, index, linkIndex))}
                </div>
              </section>
            ))}
          </article>

          {renderFaqItems(faq)}

          {actionBox ? (
            <section className={styles.ctaBox}>
              <h2 className={styles.blockTitle}>{actionBox.title}</h2>
              {actionBox.body ? <p className={styles.ctaText}>{actionBox.body}</p> : null}
              <div className={styles.ctaButtons}>{actionBox.actions.map(renderAction)}</div>
            </section>
          ) : null}

          {relatedItems.length > 0 ? (
            <section className={styles.blockCard} aria-label={labels.relatedAriaLabel ?? labels.relatedTitle}>
              <h2 className={styles.blockTitle}>{labels.relatedTitle}</h2>
              <div className={styles.relatedGrid}>
                {relatedItems.map((item) => (
                  <article key={item.slug} className={styles.relatedItem}>
                    <div className={styles.relatedMeta}>
                      <span className={styles.relatedMetaItem}>{item.metaLabel}</span>
                      {item.date ? <span className={styles.relatedMetaItem}>{item.date}</span> : null}
                    </div>
                    <h3 className={styles.relatedTitle}>
                      <Link href={item.href}>{item.title}</Link>
                    </h3>
                    <p className={styles.relatedDesc}>{item.summary}</p>
                    <div className={styles.relatedArrow}>読む →</div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {(sources.length > 0 || article.updateText) ? (
            <div className={styles.metaCards}>
              {sources.length > 0 ? (
                <section className={styles.blockCard}>
                  <h2 className={styles.blockTitle}>{labels.sourcesTitle ?? "出典・参考資料"}</h2>
                  <ol className={styles.sourceList}>
                    {sources.map((source, index) => (
                      <li key={index}>
                        {isExternalHref(source) ? (
                          <a href={source} target="_blank" rel="noreferrer" className={styles.sourceLink}>
                            {source}
                          </a>
                        ) : (
                          source
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {article.updateText ? (
                <section className={styles.blockCard}>
                  <h2 className={styles.blockTitle}>{labels.updateTitle ?? "更新履歴"}</h2>
                  <p className={styles.updateText}>{article.updateText}</p>
                </section>
              ) : null}
            </div>
          ) : null}

          <div className={styles.footerLinks}>
            <Link href="#top" className={styles.footerButtonSecondary}>
              TOPへ戻る
            </Link>
            <Link href={labels.footerListHref} className={styles.footerButton}>
              {labels.footerListLabel}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
