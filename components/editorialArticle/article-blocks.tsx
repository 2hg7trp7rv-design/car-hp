import { imageDimensions } from "@/lib/content/image-dimensions";
import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import type { GuideDetailBlock } from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import { stripLeadingDisplayNumber } from "./article-format";
import styles from "./editorial-article.module.css";

function sentenceClass(flow?: string | null): string {
  return flow === "natural" ? styles.paragraphNatural : styles.paragraph;
}

export function RichText({
  text,
  linkIndex,
  as = "p",
  className,
  highlights,
}: {
  text: string;
  linkIndex: Record<string, InternalLinkMeta>;
  as?: "p" | "span";
  className?: string;
  highlights?: string[] | null;
}) {
  return (
    <TextWithInternalLinkCards
      text={text}
      linkIndex={linkIndex}
      as={as}
      className={styles.richTextWrap}
      textClassName={className ?? styles.paragraph}
      cardsClassName={styles.inlineCards}
      highlights={highlights ?? undefined}
    />
  );
}

function splitSentenceLines(text: string): string[] {
  return String(text ?? "")
    .replace(/([。！？])(?!(?:\n|$))/gu, "$1\n")
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function renderSentenceText(text: string): ReactNode {
  const lines = splitSentenceLines(text);
  if (lines.length === 0) return null;
  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="cbj-sentence-line">
          {renderInlineMarkdown(line)}
        </span>
      ))}
    </>
  );
}

export function renderTitleLines(lines: ReactNode[]) {
  const flattened = lines.flatMap((line) =>
    typeof line === "string" ? splitSentenceLines(line) : [line],
  );
  return flattened.map((line, index) => (
    <span key={index} className={styles.titleLine}>
      {line}
    </span>
  ));
}

export function renderInlineText(text: string): ReactNode {
  return renderSentenceText(text);
}

function renderParagraph(
  block: Extract<GuideDetailBlock, { type: "paragraph" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  const isLead = index === 0;
  return (
    <RichText
      key={index}
      text={block.text}
      linkIndex={linkIndex}
      className={isLead ? styles.leadParagraph : sentenceClass(block.flow)}
      highlights={block.highlights}
    />
  );
}

export function renderList(
  items: string[],
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
  compact = false,
) {
  if (!items.length) return null;
  return (
    <div
      key={index}
      className={compact ? styles.listCardCompact : styles.listCard}
      data-cbj-reveal
    >
      <div className={styles.listGrid}>
        {items.map((item, itemIndex) => (
          <article key={itemIndex} className={styles.listItem}>
            <span className={styles.listNumber}>
              {String(itemIndex + 1).padStart(2, "0")}
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
    </div>
  );
}

function renderSubheading(
  block: Extract<GuideDetailBlock, { type: "subheading" }>,
  index: number,
) {
  const HeadingTag = block.level === 4 ? "h4" : "h3";
  return (
    <HeadingTag key={index} className={styles.subheadingBlock} data-cbj-reveal>
      {renderSentenceText(stripLeadingDisplayNumber(block.title))}
    </HeadingTag>
  );
}


function renderImage(
  block: Extract<GuideDetailBlock, { type: "image" }>,
  index: number,
) {
  if (!block.src) return null;
  return (
    <figure key={index} className={styles.figureBlock} data-cbj-reveal>
      <div className={styles.figureImageWrap}>
        <Image
          src={block.src}
          alt={block.alt || ""}
          {...imageDimensions(block.src)}
          sizes="(max-width: 760px) 100vw, 760px"
          className={styles.figureImage}
        />
      </div>
      {block.alt ? (
        <figcaption className={styles.figureCaption}>{block.alt}</figcaption>
      ) : null}
    </figure>
  );
}

function renderComparisonTable(
  block: Extract<GuideDetailBlock, { type: "comparisonTable" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  const headers = block.headers ?? [];
  const leadHeader = headers[0] ?? "項目";
  const valueHeaders = headers.slice(1);
  const leadValues = block.rows.map((row) =>
    String(stripLeadingDisplayNumber(row[0] ?? "")).trim().toUpperCase(),
  );
  const isDecisionCards =
    block.display === "cards" &&
    block.rows.length === 2 &&
    leadValues.every((value) => value === "NG" || value === "OK");
  const isIndexedCards = block.display === "cards" && !isDecisionCards;

  return (
    <section key={index} className={styles.tableBlock} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      <div
        className={styles.tableRows}
        role="table"
        aria-label={block.title ?? "記事内の整理表"}
      >
        {block.rows.map((row, rowIndex) => {
          const title = stripLeadingDisplayNumber(
            row[0] ?? `${leadHeader}${rowIndex + 1}`,
          );
          const normalizedTitle = String(title).trim().toUpperCase();
          const values = row.slice(1);
          const rowClassName = [
            styles.tableRow,
            isIndexedCards ? styles.tableRowIndexed : "",
            isDecisionCards ? styles.tableRowDecision : "",
            isDecisionCards && normalizedTitle === "NG" ? styles.tableRowDecisionNg : "",
            isDecisionCards && normalizedTitle === "OK" ? styles.tableRowDecisionOk : "",
          ]
            .filter(Boolean)
            .join(" ");

          const valueNode =
            values.length <= 1 ? (
              <RichText
                text={values[0] ?? ""}
                linkIndex={linkIndex}
                as="span"
                className={styles.tableText}
              />
            ) : (
              <dl className={styles.tablePairs}>
                {values.map((value, valueIndex) => (
                  <div key={valueIndex} className={styles.tablePair}>
                    <dt>
                      {renderSentenceText(valueHeaders[valueIndex] ?? `内容${valueIndex + 1}`)}
                    </dt>
                    <dd>
                      <RichText
                        text={value}
                        linkIndex={linkIndex}
                        as="span"
                        className={styles.tableText}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            );

          return (
            <article
              key={rowIndex}
              className={rowClassName}
              role="row"
              aria-label={isDecisionCards ? title : undefined}
            >
              {isIndexedCards ? (
                <div className={styles.tableRowIndex} aria-hidden="true">
                  <span>{String(rowIndex + 1).padStart(2, "0")}</span>
                </div>
              ) : null}

              <div
                className={[
                  styles.tableRowContent,
                  isDecisionCards ? styles.tableRowContentDecision : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {!isDecisionCards ? (
                  <h4 className={styles.tableLabel} role="rowheader">
                    {renderSentenceText(title)}
                  </h4>
                ) : null}

                {isDecisionCards ? (
                  <span
                    className={[
                      styles.decisionCardIcon,
                      normalizedTitle === "NG"
                        ? styles.decisionCardIconNg
                        : styles.decisionCardIconOk,
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {normalizedTitle === "NG" ? "✕" : "○"}
                  </span>
                ) : null}

                <div
                  className={[
                    styles.tableValue,
                    isDecisionCards ? styles.tableValueDecision : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="cell"
                >
                  {valueNode}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {block.note ? (
        <p className={styles.blockNote}>{renderInlineText(block.note)}</p>
      ) : null}
    </section>
  );
}

function renderFlow(
  block: Extract<GuideDetailBlock, { type: "flow" }>,
  index: number,
) {
  return (
    <section key={index} className={styles.stepBlock} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      <ol className={styles.stepList}>
        {block.steps.map((step, stepIndex) => (
          <li key={stepIndex} className={styles.stepItem}>
            <div className={styles.stepIndex}>
              <span>{String(stepIndex + 1).padStart(2, "0")}</span>
              {(step as any).label ? <small>{(step as any).label}</small> : null}
            </div>
            <div className={styles.stepBody}>
              <h4>{renderSentenceText(stripLeadingDisplayNumber(step.title))}</h4>
              {step.body ? <p>{renderInlineText(step.body)}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderTimeline(
  block: Extract<GuideDetailBlock, { type: "timeline" }>,
  index: number,
) {
  return (
    <section key={index} className={styles.stepBlock} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      <ol className={styles.stepList}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex} className={styles.stepItem}>
            <div className={styles.stepIndex}>
              <span>{String(itemIndex + 1).padStart(2, "0")}</span>
              {item.label ? <small>{item.label}</small> : null}
            </div>
            <div className={styles.stepBody}>
              {item.title ? (
                <h4>{renderSentenceText(stripLeadingDisplayNumber(item.title))}</h4>
              ) : null}
              {item.body ? <p>{renderInlineText(item.body)}</p> : null}
              {item.items && item.items.length > 0 ? (
                <ul>
                  {item.items.map((entry, entryIndex) => (
                    <li key={entryIndex}>{entry}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderDecisionCards(
  block: Extract<GuideDetailBlock, { type: "decisionCards" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  return (
    <section key={index} className={styles.cardStack} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      {block.cards.map((card, cardIndex) => (
        <article key={cardIndex} className={styles.infoCard}>
          {card.badge ? <p className={styles.cardLabel}>{card.badge}</p> : null}
          <h4>{renderSentenceText(stripLeadingDisplayNumber(card.title))}</h4>
          {card.body ? (
            <RichText
              text={card.body}
              linkIndex={linkIndex}
              className={styles.cardText}
            />
          ) : null}
          {card.items && card.items.length > 0
            ? renderList(card.items, cardIndex, linkIndex, true)
            : null}
        </article>
      ))}
    </section>
  );
}

function renderCaseStudy(
  block: Extract<GuideDetailBlock, { type: "caseStudy" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  return (
    <section key={index} className={styles.cardStack} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      {block.cases.map((entry, caseIndex) => (
        <article key={caseIndex} className={styles.infoCard}>
          <h4>{renderSentenceText(stripLeadingDisplayNumber(entry.title))}</h4>
          {entry.intro ? (
            <RichText
              text={entry.intro}
              linkIndex={linkIndex}
              className={styles.cardText}
            />
          ) : null}
          {entry.rows.length > 0 ? (
            <dl className={styles.caseRows}>
              {entry.rows.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.value}
                    {row.note ? <span>{row.note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function renderCallout(
  block: Extract<GuideDetailBlock, { type: "callout" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  const className =
    block.tone === "warn"
      ? styles.warnCard
      : block.tone === "accent"
        ? styles.summaryCard
        : styles.noteCard;
  return (
    <aside key={index} className={className} data-cbj-reveal>
      {block.title ? <h3>{renderSentenceText(stripLeadingDisplayNumber(block.title))}</h3> : null}
      {block.body ? (
        <RichText
          text={block.body}
          linkIndex={linkIndex}
          className={styles.cardText}
        />
      ) : null}
      {block.items && block.items.length > 0
        ? renderList(block.items, index, linkIndex, true)
        : null}
    </aside>
  );
}

function renderEditorialBoard(
  block: Extract<GuideDetailBlock, { type: "editorialBoard" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  return (
    <section key={index} className={styles.boardBlock} data-cbj-reveal>
      <p className={styles.cardLabel}>{block.eyebrow ?? "CBJ NOTE"}</p>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      {block.lead ? (
        <RichText
          text={block.lead}
          linkIndex={linkIndex}
          className={styles.cardText}
        />
      ) : null}
      <div className={styles.boardGrid}>
        {block.items.map((item, itemIndex) => (
          <article key={itemIndex} className={styles.infoCard}>
            <p className={styles.cardLabel}>
              {item.number ?? String(itemIndex + 1).padStart(2, "0")}
            </p>
            <h4>{renderSentenceText(stripLeadingDisplayNumber(item.title))}</h4>
            {item.body ? (
              <RichText
                text={item.body}
                linkIndex={linkIndex}
                className={styles.cardText}
              />
            ) : null}
            {item.items && item.items.length > 0
              ? renderList(item.items, itemIndex, linkIndex, true)
              : null}
          </article>
        ))}
      </div>
      {block.note ? (
        <p className={styles.blockNote}>{renderInlineText(block.note)}</p>
      ) : null}
    </section>
  );
}

function renderQuote(
  block: Extract<GuideDetailBlock, { type: "quote" }>,
  index: number,
) {
  return (
    <blockquote key={index} className={styles.quoteBlock} data-cbj-reveal>
      <p>{renderInlineText(block.text)}</p>
      {block.caption ? <cite>{block.caption}</cite> : null}
    </blockquote>
  );
}

function renderDivider(index: number) {
  return <hr key={index} className={styles.dividerBlock} aria-hidden="true" />;
}

export function renderBlock(
  block: GuideDetailBlock,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  if (block.type === "paragraph")
    return renderParagraph(block, index, linkIndex);
  if (block.type === "quote") return renderQuote(block, index);
  if (block.type === "divider") return renderDivider(index);
  if (block.type === "image") return renderImage(block, index);
  if (block.type === "list") return renderList(block.items, index, linkIndex);
  if (block.type === "subheading") return renderSubheading(block, index);
  if (block.type === "comparisonTable")
    return renderComparisonTable(block, index, linkIndex);
  if (block.type === "callout") return renderCallout(block, index, linkIndex);
  if (block.type === "flow") return renderFlow(block, index);
  if (block.type === "timeline") return renderTimeline(block, index);
  if (block.type === "decisionCards")
    return renderDecisionCards(block, index, linkIndex);
  if (block.type === "caseStudy")
    return renderCaseStudy(block, index, linkIndex);
  if (block.type === "editorialBoard")
    return renderEditorialBoard(block, index, linkIndex);
  const unsupported: never = block;
  throw new Error(`Unsupported article block: ${JSON.stringify(unsupported)}`);
}
