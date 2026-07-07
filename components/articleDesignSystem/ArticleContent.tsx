import type { CSSProperties, ReactNode } from "react";

import { ArticleIcon } from "@/components/articleDesignSystem/icons";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import type {
  ArticleDesignDialogue,
  GuideCaseStudyItem,
  GuideDecisionCard,
  GuideDetailBlock,
  GuideDetailSection,
  GuideEditorialBoardItem,
  GuideFlowStep,
  GuideTimelineItem,
} from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";

import styles from "@/components/articleDesignSystem/article-design-system.module.css";

const JUNA_IMAGE = "/images/cbj/article-system/juna-avatar.webp";
const RINA_IMAGE = "/images/cbj/article-system/rina-avatar.webp";

const MOBILE_FIGURE_SOURCES: Record<string, string> = {
  "/images/cbj/article-system/custom-system-map-v2.svg": "/images/cbj/article-system/custom-system-map-mobile-v2.svg",
  "/images/cbj/article-system/custom-intake-flow-v2.svg": "/images/cbj/article-system/custom-intake-flow-mobile-v2.svg",
  "/images/cbj/article-system/custom-suspension-v2.svg": "/images/cbj/article-system/custom-suspension-mobile-v2.svg",
  "/images/cbj/article-system/custom-can-network-v2.svg": "/images/cbj/article-system/custom-can-network-mobile-v2.svg",
  "/images/cbj/article-system/custom-safe-steps-v2.svg": "/images/cbj/article-system/custom-safe-steps-mobile-v2.svg",
  "/images/cbj/article-system/air-cleaner-position-v3.svg": "/images/cbj/article-system/air-cleaner-position-mobile-v3.svg",
  "/images/cbj/article-system/air-cleaner-position-v4.svg": "/images/cbj/article-system/air-cleaner-position-mobile-v4.svg",
  "/images/cbj/article-system/air-cleaner-regret-strip-v1.svg": "/images/cbj/article-system/air-cleaner-regret-strip-mobile-v1.svg",
  "/images/cbj/article-system/air-cleaner-final-check-v1.svg": "/images/cbj/article-system/air-cleaner-final-check-mobile-v1.svg",
};

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export function RichParagraph({
  text,
  linkIndex,
  className,
  highlights,
  lineMode = "natural",
}: {
  text?: string | null;
  linkIndex: Record<string, InternalLinkMeta>;
  className?: string;
  highlights?: string[] | null;
  lineMode?: "sentence" | "natural" | "preserve";
}) {
  if (!text) return null;
  return (
    <TextWithInternalLinkCards
      text={text}
      linkIndex={linkIndex}
      as="p"
      className={styles.richTextWrap}
      textClassName={className ?? styles.bodyText}
      cardsClassName={styles.inlineCards}
      highlights={highlights ?? undefined}
      lineMode={lineMode}
      cardVariant="cbjWorld"
    />
  );
}

function CharacterDialogue({ dialogue }: { dialogue: ArticleDesignDialogue }) {
  const isJuna = dialogue.character === "juna";
  const variantClass =
    dialogue.variant === "lead"
      ? styles.dialogueLead
      : dialogue.variant === "aside"
        ? styles.dialogueAside
        : dialogue.variant === "compact"
          ? styles.dialogueCompact
          : undefined;
  const motionClass =
    dialogue.motion === "fade-up"
      ? styles.motionFadeUp
      : dialogue.motion === "fade-left"
        ? styles.motionFadeLeft
        : dialogue.motion === "fade-right"
          ? styles.motionFadeRight
          : dialogue.motion === "scale-in"
            ? styles.motionScaleIn
            : undefined;
  const defaultLabel = isJuna ? "JUNA（ジュナ）" : "莉奈（りな）";
  const image = dialogue.image || (isJuna ? JUNA_IMAGE : RINA_IMAGE);
  return (
    <div
      className={cx(
        styles.dialogue,
        isJuna ? styles.dialogueJuna : styles.dialogueRina,
        variantClass,
        motionClass,
      )}
    >
      <div className={styles.dialogueAvatar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={dialogue.label || defaultLabel}
          width={112}
          height={112}
          loading="lazy"
        />
      </div>
      <div className={styles.dialogueContent}>
        <span>{dialogue.label || defaultLabel}</span>
        <div>
          <p>{renderInlineMarkdown(dialogue.text)}</p>
        </div>
      </div>
    </div>
  );
}

export function DialogueGroup({
  items,
}: {
  items?: ArticleDesignDialogue[] | null;
}) {
  if (!items?.length) return null;
  return (
    <div className={styles.dialogueGroup}>
      {items.map((item, index) => (
        <CharacterDialogue
          key={`${item.character}-${index}-${item.text}`}
          dialogue={item}
        />
      ))}
    </div>
  );
}

export function KeyPoints({
  points,
  linkIndex,
}: {
  points?: string[] | null;
  linkIndex: Record<string, InternalLinkMeta>;
}) {
  const items = (points ?? []).filter(Boolean);
  if (!items.length) return null;
  return (
    <section className={styles.keyPoints}>
      <h2>
        <span />
        この記事でわかること
      </h2>
      <ol>
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>
            <span>{index + 1}</span>
            <RichParagraph
              text={item}
              linkIndex={linkIndex}
              className={styles.keyPointText}
              lineMode="natural"
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ChapterHeader({
  index,
  title,
  deck,
  color,
}: {
  index: number;
  title: string;
  deck?: string | null;
  color: string;
}) {
  const style = { "--chapter-color": color } as CSSProperties;
  return (
    <header className={styles.chapterHeader} style={style}>
      <span className={cx(styles.chapterDecor, styles.chapterDecorOne)} />
      <span className={cx(styles.chapterDecor, styles.chapterDecorTwo)} />
      <ArticleIcon
        name="sparkles"
        className={cx(styles.chapterSparkle, styles.chapterSparkleOne)}
      />
      <ArticleIcon
        name="sparkles"
        className={cx(styles.chapterSparkle, styles.chapterSparkleTwo)}
      />
      <strong>{String(index + 1).padStart(2, "0")}</strong>
      <h2>{renderInlineMarkdown(title)}</h2>
      {deck ? <p>{renderInlineMarkdown(deck)}</p> : null}
    </header>
  );
}

function SubheadingBlock({
  block,
}: {
  block: Extract<GuideDetailBlock, { type: "subheading" }>;
}) {
  const isSmall = block.level === 4;
  const isSection = block.presentation?.variant === "section";
  if (isSection) {
    return (
      <div className={styles.subheadingSection}>
        <span>
          <ArticleIcon name="sparkles" />
        </span>
        {isSmall ? (
          <h4>{renderInlineMarkdown(block.title)}</h4>
        ) : (
          <h3>{renderInlineMarkdown(block.title)}</h3>
        )}
      </div>
    );
  }

  return isSmall ? (
    <h4 className={styles.subheadingSmall}>
      {renderInlineMarkdown(block.title)}
    </h4>
  ) : (
    <h3 className={styles.subheading}>{renderInlineMarkdown(block.title)}</h3>
  );
}

function FigureBlock({
  block,
}: {
  block: Extract<GuideDetailBlock, { type: "image" }>;
}) {
  return (
    <figure
      className={cx(
        styles.figure,
        block.fit === "contain" && styles.figureContain,
        block.fit === "bleed" && styles.figureBleed,
        block.fit === "articleWide" && styles.figureWide,
      )}
    >
      <picture className={styles.figurePicture}>
        {MOBILE_FIGURE_SOURCES[block.src] ? (
          <source media="(max-width: 560px)" srcSet={MOBILE_FIGURE_SOURCES[block.src]} />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.src}
          alt={block.alt}
          width={block.width ?? undefined}
          height={block.height ?? undefined}
          loading="lazy"
          decoding="async"
        />
      </picture>
      {block.label ? (
        <figcaption>{renderInlineMarkdown(block.label)}</figcaption>
      ) : null}
    </figure>
  );
}

function CalloutBlock({
  block,
}: {
  block: Extract<GuideDetailBlock, { type: "callout" }>;
}) {
  if (block.presentation?.variant === "mock-summary") {
    return (
      <section className={styles.mockSummaryCard}>
        {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
        {block.body ? <p>{renderInlineMarkdown(block.body)}</p> : null}
        {block.items?.length ? (
          <ul>
            {block.items.map((item) => (
              <li key={item}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }
  const tone = block.tone || "info";
  const config = {
    info: { label: "POINT", icon: "sparkles" as const },
    note: { label: "NOTE", icon: "book" as const },
    warn: { label: "CAUTION", icon: "warning" as const },
    accent: { label: "CHECK", icon: "check" as const },
  }[tone];
  return (
    <aside
      className={cx(
        styles.callout,
        styles[`callout${tone[0].toUpperCase()}${tone.slice(1)}`],
        block.presentation?.variant === "mock-info" && styles.mockInfoBox,
      )}
    >
      <header>
        <ArticleIcon name={config.icon} />
        <span>{config.label}</span>
        {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
      </header>
      {block.body ? <p>{renderInlineMarkdown(block.body)}</p> : null}
      {block.items?.length ? (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

function splitCellLines(value?: string | null): string[] {
  return String(value ?? "")
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isAutoNumberChecklistHeading(value: string) {
  const normalized = value
    .trim()
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));

  return /^\d{1,2}[.)．、]?$/.test(normalized);
}

function TableBlock({
  block,
}: {
  block: Extract<GuideDetailBlock, { type: "comparisonTable" }>;
}) {
  if (block.display === "contrast" && block.headers.length >= 2) {
    return (
      <section className={styles.contrastCards}>
        {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
        <div>
          {block.rows.map((row, index) => {
            const key = String(row[0] || "")
              .trim()
              .toUpperCase();
            const isPositive = ["OK", "GOOD", "推奨", "確認"].includes(key);
            const isNegative = ["NG", "BAD", "注意", "避ける"].includes(key);
            return (
              <article
                key={`${index}-${row.join("-")}`}
                className={cx(
                  isPositive && styles.contrastPositive,
                  isNegative && styles.contrastNegative,
                )}
              >
                <span>{row[0] || String(index + 1).padStart(2, "0")}</span>
                <ul>
                  {row
                    .slice(1)
                    .flatMap((cell) => splitCellLines(cell))
                    .map((line) => (
                      <li key={line}>{renderInlineMarkdown(line)}</li>
                    ))}
                </ul>
              </article>
            );
          })}
        </div>
        {block.note ? (
          <p className={styles.tableNote}>{renderInlineMarkdown(block.note)}</p>
        ) : null}
      </section>
    );
  }

  if (block.display === "checklist" && block.headers.length >= 2) {
    return (
      <section
        className={cx(
          styles.checklistCards,
          block.presentation?.variant === "mock-checklist" &&
            styles.mockChecklistCard,
        )}
      >
        {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
        <ol>
          {block.rows.map((row, index) => {
            const heading = String(row[0] || "").trim();
            const shouldRenderHeading =
              heading.length > 0 &&
              !(
                block.presentation?.variant === "mock-checklist" &&
                isAutoNumberChecklistHeading(heading)
              );

            return (
              <li key={`${index}-${row.join("-")}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  {shouldRenderHeading ? <h4>{renderInlineMarkdown(heading)}</h4> : null}
                  {row.slice(1).map((cell, cellIndex) => (
                    <p key={`${cellIndex}-${cell}`}>
                      {renderInlineMarkdown(cell)}
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
        {block.note ? (
          <p className={styles.tableNote}>{renderInlineMarkdown(block.note)}</p>
        ) : null}
      </section>
    );
  }

  if (block.display === "cards" && block.headers.length >= 2) {
    return (
      <section className={styles.comparisonCards}>
        {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
        <div>
          {block.rows.map((row, index) => (
            <article key={`${index}-${row.join("-")}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h4>{renderInlineMarkdown(row[0] || "")}</h4>
              {row.slice(1).map((cell, cellIndex) => (
                <p key={`${cellIndex}-${cell}`}>{renderInlineMarkdown(cell)}</p>
              ))}
            </article>
          ))}
        </div>
        {block.note ? (
          <p className={styles.tableNote}>{renderInlineMarkdown(block.note)}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={cx(
        styles.tableBlock,
        block.presentation?.variant === "mock-table" && styles.mockTableBlock,
      )}
    >
      {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
      <div
        className={styles.tableScroll}
        role="region"
        aria-label={block.title ? `${block.title}の表` : "比較表"}
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th key={header}>{renderInlineMarkdown(header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, index) => (
              <tr key={`${index}-${row.join("-")}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${cellIndex}-${cell}`}
                    data-label={block.headers[cellIndex] || `項目 ${cellIndex + 1}`}
                  >
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.note ? (
        <p className={styles.tableNote}>{renderInlineMarkdown(block.note)}</p>
      ) : null}
    </section>
  );
}

function StepList({
  title,
  steps,
  variant,
}: {
  title?: string | null;
  steps: Array<GuideFlowStep | GuideTimelineItem>;
  variant?: string | null;
}) {
  const className = cx(
    styles.stepBlock,
    variant === "mock-numbered" && styles.mockNumberedList,
    variant === "mock-step-cards" && styles.mockStepCards,
  );
  return (
    <section className={className}>
      {title ? <h3>{renderInlineMarkdown(title)}</h3> : null}
      <ol>
        {steps.map((step, index) => {
          const stepTitle = "title" in step ? step.title : undefined;
          const body = "body" in step ? step.body : undefined;
          const label = "label" in step ? step.label : undefined;
          const items = "items" in step ? step.items : undefined;
          return (
            <li key={`${index}-${stepTitle || label}`}>
              <span>
                {variant === "mock-step-cards"
                  ? String(index + 1).padStart(2, "0")
                  : index + 1}
              </span>
              <div>
                {label ? <small>{label}</small> : null}
                {stepTitle ? <h4>{renderInlineMarkdown(stepTitle)}</h4> : null}
                {body ? <p>{renderInlineMarkdown(body)}</p> : null}
                {items?.length ? (
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{renderInlineMarkdown(item)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DecisionCards({
  title,
  cards,
  variant,
}: {
  title?: string | null;
  cards: GuideDecisionCard[];
  variant?: string | null;
}) {
  const isMockSystem = variant === "mock-system";
  const colors = ["#FF8C42", "#F06292", "#42A5F5"];
  const icons = ["wind", "circleDot", "zap"] as const;
  return (
    <section
      className={cx(
        styles.decisionCards,
        isMockSystem && styles.mockSystemCards,
      )}
    >
      {title && !isMockSystem ? <h3>{renderInlineMarkdown(title)}</h3> : null}
      <div>
        {cards.map((card, index) => {
          const color = colors[index % colors.length];
          const cardStyle = isMockSystem
            ? ({ "--system-color": color } as CSSProperties)
            : undefined;
          return (
            <article key={`${index}-${card.title}`} style={cardStyle}>
              {isMockSystem ? (
                <>
                  <div className={styles.mockSystemIcon}>
                    <ArticleIcon name={icons[index % icons.length]} />
                  </div>
                  <div className={styles.mockSystemBody}>
                    <span>
                      SYSTEM {card.badge || String(index + 1).padStart(2, "0")}
                    </span>
                    <h4>{renderInlineMarkdown(card.title)}</h4>
                    {card.body ? (
                      <p>{renderInlineMarkdown(card.body)}</p>
                    ) : null}
                    {card.items?.length
                      ? card.items.map((item) => (
                          <p key={item}>{renderInlineMarkdown(item)}</p>
                        ))
                      : null}
                  </div>
                  <i className={styles.mockSystemDotTop} />
                  <i className={styles.mockSystemDotBottom} />
                </>
              ) : (
                <>
                  <span>
                    {card.badge || String(index + 1).padStart(2, "0")}
                  </span>
                  <h4>{renderInlineMarkdown(card.title)}</h4>
                  {card.body ? <p>{renderInlineMarkdown(card.body)}</p> : null}
                  {card.items?.length ? (
                    <ul>
                      {card.items.map((item) => (
                        <li key={item}>{renderInlineMarkdown(item)}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EditorialBoard({
  block,
}: {
  block: Extract<GuideDetailBlock, { type: "editorialBoard" }>;
}) {
  return (
    <section className={styles.editorialBoard}>
      {block.eyebrow ? <span>{block.eyebrow}</span> : null}
      {block.title ? <h3>{renderInlineMarkdown(block.title)}</h3> : null}
      {block.lead ? <p>{renderInlineMarkdown(block.lead)}</p> : null}
      <div>
        {block.items.map((item: GuideEditorialBoardItem, index) => (
          <article key={`${index}-${item.title}`}>
            <strong>{item.number || String(index + 1).padStart(2, "0")}</strong>
            {item.badge ? <span>{item.badge}</span> : null}
            <h4>{renderInlineMarkdown(item.title)}</h4>
            {item.body ? <p>{renderInlineMarkdown(item.body)}</p> : null}
            {item.items?.length ? (
              <ul>
                {item.items.map((entry) => (
                  <li key={entry}>{renderInlineMarkdown(entry)}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
      {block.note ? (
        <p className={styles.boardNote}>{renderInlineMarkdown(block.note)}</p>
      ) : null}
    </section>
  );
}

function CaseStudy({
  title,
  cases,
}: {
  title?: string | null;
  cases: GuideCaseStudyItem[];
}) {
  return (
    <section className={styles.caseStudies}>
      {title ? <h3>{renderInlineMarkdown(title)}</h3> : null}
      {cases.map((entry, index) => (
        <article key={`${index}-${entry.title}`}>
          <h4>{renderInlineMarkdown(entry.title)}</h4>
          {entry.intro ? <p>{renderInlineMarkdown(entry.intro)}</p> : null}
          <dl>
            {entry.rows.map((row) => (
              <div key={`${row.label}-${row.value}`}>
                <dt>{renderInlineMarkdown(row.label)}</dt>
                <dd>
                  {renderInlineMarkdown(row.value)}
                  {row.note ? (
                    <small>{renderInlineMarkdown(row.note)}</small>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </section>
  );
}

function presentationClasses(block: GuideDetailBlock): string {
  const presentation = block.presentation;
  if (!presentation) return "";
  const variantClass = {
    soft: styles.blockVariantSoft,
    outline: styles.blockVariantOutline,
    emphasis: styles.blockVariantEmphasis,
    compact: styles.blockVariantCompact,
    lead: styles.blockVariantLead,
    section: styles.blockVariantSection,
  }[presentation.variant || "default"];
  const widthClass =
    presentation.width === "wide"
      ? styles.blockWidthWide
      : presentation.width === "bleed"
        ? styles.blockWidthBleed
        : undefined;
  const motionClass =
    presentation.motion === "fade-up"
      ? styles.motionFadeUp
      : presentation.motion === "fade-left"
        ? styles.motionFadeLeft
        : presentation.motion === "fade-right"
          ? styles.motionFadeRight
          : presentation.motion === "scale-in"
            ? styles.motionScaleIn
            : undefined;
  const isMockVariant = Boolean(presentation.variant?.startsWith("mock-"));
  return cx(
    !isMockVariant && styles.blockFrame,
    variantClass,
    widthClass,
    motionClass,
  );
}

function renderBlock(
  block: GuideDetailBlock,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
): ReactNode {
  let content: ReactNode;
  switch (block.type) {
    case "dialogue":
      content = (
        <DialogueGroup
          items={[
            {
              character: block.character,
              text: block.text,
              variant: block.variant,
              image: block.image,
              label: block.label,
              motion: block.motion,
            },
          ]}
        />
      );
      break;
    case "paragraph":
      content = (
        <RichParagraph
          text={block.text}
          linkIndex={linkIndex}
          highlights={block.highlights}
          lineMode={block.flow === "sentence" ? "sentence" : "natural"}
          className={
            block.presentation?.variant === "lead"
              ? styles.leadText
              : styles.bodyText
          }
        />
      );
      break;
    case "subheading":
      content = <SubheadingBlock block={block} />;
      break;
    case "image":
      content = <FigureBlock block={block} />;
      break;
    case "list":
      content = (
        <ul className={styles.bodyList}>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      break;
    case "quote":
      content = (
        <blockquote className={styles.quote}>
          <p>{renderInlineMarkdown(block.text)}</p>
          {block.caption ? (
            <cite>{renderInlineMarkdown(block.caption)}</cite>
          ) : null}
        </blockquote>
      );
      break;
    case "divider":
      content = <hr className={styles.divider} />;
      break;
    case "comparisonTable":
      content = <TableBlock block={block} />;
      break;
    case "callout":
      content = <CalloutBlock block={block} />;
      break;
    case "flow":
      content = (
        <StepList
          title={block.title}
          steps={block.steps}
          variant={block.presentation?.variant}
        />
      );
      break;
    case "timeline":
      content = (
        <StepList
          title={block.title}
          steps={block.items}
          variant={block.presentation?.variant}
        />
      );
      break;
    case "decisionCards":
      content = (
        <DecisionCards
          title={block.title}
          cards={block.cards}
          variant={block.presentation?.variant}
        />
      );
      break;
    case "editorialBoard":
      content = <EditorialBoard block={block} />;
      break;
    case "caseStudy":
      content = <CaseStudy title={block.title} cases={block.cases} />;
      break;
    default:
      return null;
  }

  const className = presentationClasses(block);
  return className ? (
    <div key={`${block.type}-${index}`} className={className}>
      {content}
    </div>
  ) : (
    <div key={`${block.type}-${index}`} className={styles.blockDefault}>
      {content}
    </div>
  );
}

export function ArticleBlockStack({
  blocks,
  linkIndex,
}: {
  blocks?: GuideDetailBlock[] | null;
  linkIndex: Record<string, InternalLinkMeta>;
}) {
  if (!blocks?.length) return null;
  return (
    <div className={styles.blockStack}>
      {blocks.map((block, blockIndex) =>
        renderBlock(block, blockIndex, linkIndex),
      )}
    </div>
  );
}

export function Chapter({
  section,
  index,
  color,
  dialogue,
  linkIndex,
}: {
  section: GuideDetailSection & { id: string; displayTitle: string };
  index: number;
  color: string;
  dialogue?: ArticleDesignDialogue[] | null;
  linkIndex: Record<string, InternalLinkMeta>;
}) {
  const chapterStyle = { "--chapter-color": color } as CSSProperties;
  return (
    <section id={section.id} className={styles.chapter} style={chapterStyle}>
      <ChapterHeader
        index={index}
        title={section.displayTitle}
        deck={section.deck}
        color={color}
      />
      <DialogueGroup items={dialogue} />
      <div className={styles.blockStack}>
        {section.blocks.map((block, blockIndex) =>
          renderBlock(block, blockIndex, linkIndex),
        )}
      </div>
    </section>
  );
}
